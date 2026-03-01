// src/app/api/booking/[slug]/route.ts
// Rota pública — não requer autenticação.
// Retorna os dados do negócio, serviços e horários disponíveis.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;  // ← adiciona o await
    console.log("[BOOKING GET] slug:", slug);

    const business = await prisma.business.findUnique({
      where: { slug, active: true },
      include: {
        services:  { where: { active: true }, orderBy: { name: "asc" } },
        schedules: { where: { active: true }, orderBy: { dayOfWeek: "asc" } },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Negócio não encontrado." },
        { status: 404 }
      );
    }

    // Busca agendamentos dos próximos 7 dias para marcar slots ocupados
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date();
    to.setDate(to.getDate() + 7);
    to.setHours(23, 59, 59, 999);

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: { gte: from, lte: to },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
      select: { date: true, service: { select: { duration: true } } },
    });

    // Formata slots ocupados como "YYYY-MM-DD HH:MM"
    const bookedSlots = bookedAppointments.map((a: any) => {
      const d = new Date(a.date);
      const date = d.toISOString().split("T")[0];
      const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return `${date} ${time}`;
    });

    return NextResponse.json({
      business: {
        id:      business.id,
        name:    business.name,
        slug:    business.slug,
        type:    business.type,
        phone:   business.phone,
        address: business.address,
        about:   business.about,
      },
      services: business.services.map(s => ({
        id:       s.id,
        name:     s.name,
        duration: s.duration,
        price:    Number(s.price),
        description: s.description,
      })),
      schedules: business.schedules.map(s => ({
        dayOfWeek:    s.dayOfWeek,
        openTime:     s.openTime,
        closeTime:    s.closeTime,
        slotDuration: s.slotDuration,
      })),
      bookedSlots,
    });

  } catch (error) {
    console.error("[BOOKING GET ERROR]", error);
    if (error instanceof Error) console.error(error.message);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}