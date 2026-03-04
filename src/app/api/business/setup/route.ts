// src/app/api/business/setup/route.ts
// Recebe os dados do onboarding e salva o negócio, horários e serviços no banco.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // ── Verifica se o usuário está autenticado ──
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { businessName, businessType, phone, address, activeDays, openTime, closeTime, slotDuration, services } = body;

    // ── Validação básica ──
    if (!businessName || !businessType) {
      return NextResponse.json(
        { error: "Nome e tipo do negócio são obrigatórios." },
        { status: 400 }
      );
    }

    if (!services || services.length === 0) {
      return NextResponse.json(
        { error: "Adicione ao menos um serviço." },
        { status: 400 }
      );
    }

    // ── Gera o slug a partir do nome ──
    let slug = businessName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Garante que o slug é único — se já existir, adiciona um sufixo
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // ── Mapeia os dias da semana ──
    const DAY_MAP: Record<string, number> = {
      DOM: 0, SEG: 1, TER: 2, QUA: 3, QUI: 4, SEX: 5, SAB: 6,
    };

    // ── Mapeia o tipo de negócio para o enum do Prisma ──
    const TYPE_MAP: Record<string, string> = {
      "BARBEARIA":       "BARBEARIA",
      "SALÃO DE BELEZA": "SALAO_DE_BELEZA",
      "CLÍNICA MÉDICA":  "CLINICA_MEDICA",
      "PSICOLOGIA":      "PSICOLOGIA",
      "PERSONAL TRAINER":"PERSONAL_TRAINER",
      "TATUAGEM":        "TATUAGEM",
      "SPA / ESTÉTICA":  "SPA_ESTETICA",
      "NUTRIÇÃO":        "NUTRICAO",
      "FISIOTERAPIA":    "FISIOTERAPIA",
      "ODONTOLOGIA":     "ODONTOLOGIA",
      "OUTRO":           "OUTRO",
    };

    // ── Cria tudo numa única transação ──
    const business = await prisma.$transaction(async (tx: any) => {
      // 1. Cria o negócio
      const newBusiness = await tx.business.create({
        data: {
          name:    businessName,
          slug,
          type:    (TYPE_MAP[businessType] || "OUTRO") as any,
          phone:   phone   || null,
          address: address || null,
          ownerId: session.user.id,
        },
      });

      // 2. Cria os horários de funcionamento
      const scheduleData = (activeDays as string[]).map((day) => ({
        businessId:   newBusiness.id,
        dayOfWeek:    DAY_MAP[day] ?? 1,
        openTime:     openTime     || "08:00",
        closeTime:    closeTime    || "18:00",
        slotDuration: slotDuration || 30,
      }));

      await tx.schedule.createMany({ data: scheduleData });

      // 3. Cria os serviços
      const serviceData = (services as any[]).map((s) => ({
        businessId:  newBusiness.id,
        name:        s.name,
        duration:    Number(s.duration),
        price:       Number(s.price),
        description: s.desc || null,
      }));

      await tx.service.createMany({ data: serviceData });

      return newBusiness;
    });

    return NextResponse.json(
      {
        message: "Negócio configurado com sucesso!",
        business: {
          id:   business.id,
          slug: business.slug,
          name: business.name,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("[BUSINESS SETUP ERROR]", JSON.stringify(error, null, 2));
    if (error instanceof Error) console.error(error.message, error.stack);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}