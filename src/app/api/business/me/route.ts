// src/app/api/business/me/route.ts
// Retorna os dados do negócio do usuário autenticado,
// incluindo agendamentos do dia, serviços e horários.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Busca o negócio do usuário logado
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id, active: true },
      include: {
        services:  { where: { active: true }, orderBy: { name: "asc" } },
        schedules: { where: { active: true }, orderBy: { dayOfWeek: "asc" } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Nenhum negócio encontrado.", code: "NO_BUSINESS" }, { status: 404 });
    }

    // Agendamentos de hoje
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: { gte: todayStart, lte: todayEnd },
      },
      include: { service: true },
      orderBy: { date: "asc" },
    });

    // Estatísticas da semana
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // segunda
    weekStart.setHours(0, 0, 0, 0);

    const weekAppointments = await prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: { gte: weekStart },
        status: { not: "CANCELLED" },
      },
      include: { service: true },
      orderBy: { date: "asc" },
    });

    // Agrupa por dia da semana
    const DAY_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayAppts = weekAppointments.filter(a => {
        const d = new Date(a.date);
        return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
      });
      return {
        day:     DAY_LABELS[(weekStart.getDay() + i) % 7],
        total:   dayAppts.length,
        revenue: dayAppts.reduce((s, a) => s + Number(a.service.price), 0),
      };
    });

    return NextResponse.json({
      business: {
        id:      business.id,
        name:    business.name,
        slug:    business.slug,
        type:    business.type,
        phone:   business.phone,
        address: business.address,
        plan:    business.plan,
      },
      services:     business.services,
      schedules:    business.schedules,
      appointments: appointments.map(a => ({
        id:          a.id,
        clientName:  a.clientName,
        clientPhone: a.clientPhone,
        service:     a.service.name,
        serviceId:   a.serviceId,
        price:       Number(a.service.price),
        duration:    a.service.duration,
        date:        a.date,
        time:        new Date(a.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status:      a.status,
      })),
      stats: {
        todayRevenue:  appointments.filter(a => a.status === "DONE").reduce((s, a) => s + Number(a.service.price), 0),
        todayTotal:    appointments.length,
        todayDone:     appointments.filter(a => a.status === "DONE").length,
        weekData,
      },
    });

  } catch (error) {
    console.error("[BUSINESS ME ERROR]", error);
    if (error instanceof Error) console.error(error.message);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}