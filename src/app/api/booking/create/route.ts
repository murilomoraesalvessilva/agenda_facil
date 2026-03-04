// src/app/api/booking/create/route.ts
// Rota pública — não requer autenticação.
// Cria um novo agendamento para um cliente.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, serviceId, clientName, clientPhone, date, time } = body;

    // ── Validação ──
    if (!businessId || !serviceId || !clientName || !clientPhone || !date || !time) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    // Monta o datetime combinando data e hora
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute]     = time.split(":").map(Number);
    const appointmentDate    = new Date(year, month - 1, day, hour, minute, 0);

    // Verifica se o horário já está ocupado
    const conflict = await prisma.appointment.findFirst({
      where: {
        businessId,
        date:   appointmentDate,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Este horário já está ocupado. Escolha outro." },
        { status: 409 }
      );
    }

    // Verifica se o serviço pertence ao negócio
    const service = await prisma.service.findFirst({
      where: { id: serviceId, businessId, active: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado." },
        { status: 404 }
      );
    }

    // Cria o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        serviceId,
        clientName:  clientName.trim(),
        clientPhone: clientPhone.trim(),
        date:        appointmentDate,
        status:      "PENDING",
      },
      include: { service: true },
    });

    return NextResponse.json(
      {
        message: "Agendamento realizado com sucesso!",
        appointment: {
          id:          appointment.id,
          clientName:  appointment.clientName,
          clientPhone: appointment.clientPhone,
          service:     appointment.service.name,
          price:       Number(appointment.service.price),
          duration:    appointment.service.duration,
          date:        appointment.date,
          time,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("[BOOKING CREATE ERROR]", error);
    if (error instanceof Error) console.error(error.message);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}