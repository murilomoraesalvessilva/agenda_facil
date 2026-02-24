"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_APPOINTMENTS = [
  { id: 1, client: "Lucas Mendonça",    service: "Corte Masculino", time: "08:00", duration: 30, status: "done",    price: 35 },
  { id: 2, client: "Pedro Alves",       service: "Barba",           time: "08:40", duration: 20, status: "done",    price: 25 },
  { id: 3, client: "Marcos Ferreira",   service: "Combo Completo",  time: "09:10", duration: 50, status: "done",    price: 55 },
  { id: 4, client: "Rafael Costa",      service: "Corte Masculino", time: "10:20", duration: 30, status: "current", price: 35 },
  { id: 5, client: "João Nascimento",   service: "Barba",           time: "11:00", duration: 20, status: "next",    price: 25 },
  { id: 6, client: "André Lima",        service: "Combo Completo",  time: "11:30", duration: 50, status: "next",    price: 55 },
  { id: 7, client: "Bruno Carvalho",    service: "Corte Masculino", time: "13:00", duration: 30, status: "next",    price: 35 },
  { id: 8, client: "Diego Sousa",       service: "Barba",           time: "14:00", duration: 20, status: "next",    price: 25 },
  { id: 9, client: "Felipe Santos",     service: "Combo Completo",  time: "15:00", duration: 50, status: "next",    price: 55 },
  { id: 10, client: "Gabriel Oliveira", service: "Corte Masculino", time: "16:30", duration: 30, status: "next",    price: 35 },
];

const WEEK_DATA = [
  { day: "SEG", total: 8, revenue: 320 },
  { day: "TER", total: 6, revenue: 240 },
  { day: "QUA", total: 11, revenue: 430 },
  { day: "QUI", total: 9, revenue: 360 },
  { day: "SEX", total: 13, revenue: 510 },
  { day: "SAB", total: 10, revenue: 390 },
  { day: "DOM", total: 0, revenue: 0 },
];

const NAV_ITEMS = [
  { id: "overview",      label: "VISÃO GERAL" },
  { id: "agenda",        label: "AGENDA" },
  { id: "clients",       label: "CLIENTES" },
  { id: "services",      label: "SERVIÇOS" },
  { id: "settings",      label: "CONFIGURAÇÕES" },
];

const STATUS_CONFIG = {
  done:    { label: "CONCLUÍDO", bg: "#E8F5E9", color: "#2E7D32", border: "#2E7D32" },
  current: { label: "EM ANDAMENTO", bg: "#1B4FD8", color: "#fff", border: "#1B4FD8" },
  next:    { label: "AGUARDANDO", bg: "transparent", color: "#888", border: "#ccc" },
  cancelled: { label: "CANCELADO", bg: "#FFF0F0", color: "#FF6B6B", border: "#FF6B6B" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) => `R$${n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
const maxRevenue = Math.max(...WEEK_DATA.map(d => d.revenue));

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeNav, setActiveNav]     = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeAppt, setActiveAppt]   = useState(null);
  const [notifOpen, setNotifOpen]     = useState(false);
  const router = useRouter();

  const todayRevenue  = MOCK_APPOINTMENTS.filter(a => a.status === "done").reduce((s, a) => s + a.price, 0);
  const totalToday    = MOCK_APPOINTMENTS.length;
  const doneToday     = MOCK_APPOINTMENTS.filter(a => a.status === "done").length;
  const currentAppt   = MOCK_APPOINTMENTS.find(a => a.status === "current");

  return (
    <div style={{
      fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
      background: "#F5F2ED",
      color: "#0A0A0A",
      display: "flex",
      height: "100vh",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,700;0,900;1,700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #1B4FD8; color: #fff; }

        .nav-btn {
          display: block; width: 100%;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 14px 24px;
          border: none; cursor: pointer;
          text-align: left;
          background: transparent; color: #555;
          border-left: 3px solid transparent;
          transition: all 0.15s;
        }
        .nav-btn:hover { background: rgba(27,79,216,0.06); color: #0A0A0A; border-left-color: #1B4FD8; }
        .nav-btn.active { background: #0A0A0A; color: #F5F2ED; border-left-color: #FF6B6B; }

        .stat-card {
          background: #fff;
          border: 2px solid #0A0A0A;
          padding: 28px 32px;
          position: relative;
          overflow: hidden;
        }

        .appt-row {
          display: grid;
          grid-template-columns: 72px 1fr 140px 100px 80px;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(10,10,10,0.1);
          transition: background 0.12s;
          cursor: pointer;
          gap: 16px;
        }
        .appt-row:hover { background: rgba(27,79,216,0.04); }
        .appt-row.current-row { background: #EEF2FF; border-left: 4px solid #1B4FD8; }

        .action-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 8px 16px; border: none; cursor: pointer;
          transition: all 0.15s;
        }

        .bar-chart-bar { transition: height 0.4s ease; }
        .bar-chart-bar:hover { opacity: 0.8; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pulse { animation: pulse 1.8s infinite; }

        @media (max-width: 900px) {
          .sidebar { width: 64px !important; }
          .sidebar-label { display: none !important; }
          .appt-row { grid-template-columns: 60px 1fr 100px !important; }
          .appt-col-hide { display: none !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════ */}
      <aside className="sidebar" style={{
        width: sidebarOpen ? 240 : 64,
        background: "#0A0A0A",
        borderRight: "2px solid #222",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.2s",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          padding: "24px 20px",
          borderBottom: "2px solid #222",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          minHeight: 72,
        }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, color: "#F5F2ED", letterSpacing: "-0.01em", textTransform: "uppercase", whiteSpace: "nowrap" }}>AGENDAÍ</span>
              <span style={{ width: 6, height: 6, background: "#FF6B6B", display: "inline-block", marginBottom: 2, flexShrink: 0 }} />
            </div>
          )}
          <button onClick={() => setSidebarOpen(v => !v)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#555", fontSize: 18, lineHeight: 1,
            padding: 4, flexShrink: 0,
          }}>
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        {/* Business info */}
        {sidebarOpen && (
          <div style={{ padding: "20px 20px 0", borderBottom: "1px solid #1a1a1a", paddingBottom: 20 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: "#444", textTransform: "uppercase", marginBottom: 6 }}>ESTABELECIMENTO</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 900, color: "#F5F2ED", lineHeight: 1.2 }}>BARBEARIA<br />DO JOÃO</div>
            <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#555", marginTop: 6, cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/barbearia-do-joao")}>agendai.com.br/barbearia-do-joao</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
              <span className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} />
              <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#4CAF50", fontWeight: 500 }}>Aberto agora</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 16, overflowY: "auto" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`nav-btn ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
              title={item.label}
              style={{ paddingLeft: sidebarOpen ? 24 : 20, justifyContent: "center" }}
            >
              <span className="sidebar-label">{item.label}</span>
              {!sidebarOpen && <span style={{ fontSize: 16 }}>
                {{ overview: "◈", agenda: "◷", clients: "◉", services: "◫", settings: "◎" }[item.id]}
              </span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "20px", borderTop: "1px solid #1a1a1a" }}>
          {sidebarOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, background: "#1B4FD8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 900, color: "#fff", flexShrink: 0 }}>JB</div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 700, color: "#F5F2ED" }}>JOÃO BARROS</div>
                <div style={{ fontFamily: "'Barlow'", fontSize: 11, color: "#555" }}>Proprietário</div>
              </div>
            </div>
          ) : (
            <div style={{ width: 36, height: 36, background: "#1B4FD8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 900, color: "#fff" }}>JB</div>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MAIN
      ══════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── TOPBAR ── */}
        <header style={{
          height: 72, flexShrink: 0,
          background: "#fff",
          borderBottom: "2px solid #0A0A0A",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
        }}>
          <div>
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#888", textTransform: "uppercase" }}>
              {{ overview: "VISÃO GERAL", agenda: "AGENDA", clients: "CLIENTES", services: "SERVIÇOS", settings: "CONFIGURAÇÕES" }[activeNav]}
            </span>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 900, letterSpacing: "0.02em", lineHeight: 1.1 }}>
              SEGUNDA-FEIRA, 10 DE MARÇO
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* notification bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(v => !v)} style={{
                background: notifOpen ? "#0A0A0A" : "transparent",
                border: "2px solid #0A0A0A", width: 40, height: 40,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: notifOpen ? "#F5F2ED" : "#0A0A0A",
                transition: "all 0.15s",
              }}>◌</button>
              <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, background: "#FF6B6B", borderRadius: "50%", fontFamily: "'Barlow'", fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
              {notifOpen && (
                <div style={{ position: "absolute", top: 48, right: 0, width: 300, background: "#fff", border: "2px solid #0A0A0A", zIndex: 100, boxShadow: "4px 4px 0 #0A0A0A" }}>
                  {[
                    { msg: "João Nascimento agendou Barba — 11:00", time: "há 5min" },
                    { msg: "André Lima confirmou presença — 11:30", time: "há 18min" },
                    { msg: "Bruno Carvalho fez novo agendamento", time: "há 1h" },
                  ].map((n, i) => (
                    <div key={i} style={{ padding: "14px 16px", borderBottom: i < 2 ? "1px solid #eee" : "none" }}>
                      <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#0A0A0A", lineHeight: 1.4 }}>{n.msg}</div>
                      <div style={{ fontFamily: "'Barlow'", fontSize: 11, color: "#888", marginTop: 4 }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button style={{
              background: "#FF6B6B", border: "none", color: "#fff",
              fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 900,
              letterSpacing: "0.18em", textTransform: "uppercase",
              padding: "10px 20px", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#1B4FD8"}
              onMouseLeave={e => e.currentTarget.style.background = "#FF6B6B"}
            >+ NOVO AGENDAMENTO</button>
          </div>
        </header>

        {/* ── CONTENT SCROLL AREA ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "40px" }}>

          {/* ────────────── OVERVIEW ────────────── */}
          {activeNav === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

              {/* KPI cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { label: "FATURAMENTO HOJE", value: fmt(todayRevenue), sub: `${doneToday} serviços concluídos`, accent: "#1B4FD8" },
                  { label: "AGENDAMENTOS HOJE", value: totalToday, sub: `${doneToday} concluídos · ${totalToday - doneToday} restantes`, accent: "#FF6B6B" },
                  { label: "PRÓXIMO CLIENTE", value: currentAppt ? currentAppt.client.split(" ")[0].toUpperCase() : "—", sub: currentAppt ? `${currentAppt.service} · ${currentAppt.time}` : "Nenhum em andamento", accent: "#4CAF50" },
                  { label: "TAXA DE PRESENÇA", value: "91%", sub: "Últimos 30 dias", accent: "#FF9800" },
                ].map((card, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: card.accent }} />
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: "#888", textTransform: "uppercase", marginBottom: 10 }}>{card.label}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 44, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em", color: card.accent }}>{card.value}</div>
                    <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#888", marginTop: 8 }}>{card.sub}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart + current appointment */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

                {/* Bar chart */}
                <div style={{ background: "#fff", border: "2px solid #0A0A0A", padding: "28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: "#888", textTransform: "uppercase" }}>SEMANA ATUAL</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900 }}>AGENDAMENTOS POR DIA</div>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 32, fontWeight: 900, color: "#1B4FD8" }}>{fmt(WEEK_DATA.reduce((s, d) => s + d.revenue, 0))}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
                    {WEEK_DATA.map((d, i) => {
                      const h = d.revenue === 0 ? 4 : Math.max(16, (d.revenue / maxRevenue) * 120);
                      const isToday = i === 0;
                      return (
                        <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, color: isToday ? "#1B4FD8" : "#888" }}>{d.total || ""}</div>
                          <div className="bar-chart-bar" style={{
                            width: "100%", height: h,
                            background: isToday ? "#1B4FD8" : d.revenue === 0 ? "#eee" : "#0A0A0A",
                            cursor: "pointer",
                            position: "relative",
                          }} title={`${d.day}: ${fmt(d.revenue)}`} />
                          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: isToday ? "#1B4FD8" : "#888" }}>{d.day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Current appointment highlight */}
                <div style={{ background: "#1B4FD8", border: "2px solid #1B4FD8", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 12 }}>EM ANDAMENTO AGORA</div>
                    {currentAppt ? (
                      <>
                        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 8 }}>{currentAppt.client.toUpperCase()}</div>
                        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{currentAppt.service.toUpperCase()}</div>
                        <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{currentAppt.time} · {currentAppt.duration}min · {fmt(currentAppt.price)}</div>
                      </>
                    ) : (
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900, color: "rgba(255,255,255,0.4)" }}>NENHUM</div>
                    )}
                  </div>

                  <div style={{ marginTop: 32 }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 10 }}>PRÓXIMOS</div>
                    {MOCK_APPOINTMENTS.filter(a => a.status === "next").slice(0, 3).map((a, i) => (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 700, color: "#fff" }}>{a.time} — {a.client.split(" ")[0]}</span>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{a.service.split(" ")[0]}</span>
                      </div>
                    ))}
                  </div>

                  <button style={{
                    marginTop: 24, background: "#FF6B6B", border: "none", color: "#fff",
                    fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 900,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    padding: "12px", cursor: "pointer", width: "100%",
                    transition: "opacity 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >MARCAR COMO CONCLUÍDO</button>
                </div>
              </div>

              {/* Today's full list */}
              <div style={{ background: "#fff", border: "2px solid #0A0A0A" }}>
                <div style={{ padding: "20px 24px", borderBottom: "2px solid #0A0A0A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 900, letterSpacing: "0.04em" }}>AGENDA DE HOJE — {totalToday} AGENDAMENTOS</div>
                  <button style={{ background: "none", border: "2px solid #0A0A0A", fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 16px", cursor: "pointer" }}
                    onClick={() => setActiveNav("agenda")}
                  >VER COMPLETA</button>                </div>

                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "72px 1fr 140px 100px 80px", padding: "10px 24px", gap: 16, borderBottom: "1px solid #eee", background: "#F5F2ED" }}>
                  {["HORA", "CLIENTE", "SERVIÇO", "VALOR", "STATUS"].map(h => (
                    <div key={h} style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#888" }}>{h}</div>
                  ))}
                </div>

                {MOCK_APPOINTMENTS.map(appt => {
                  const sc = STATUS_CONFIG[appt.status];
                  return (
                    <div key={appt.id} className={`appt-row ${appt.status === "current" ? "current-row" : ""}`}
                      onClick={() => setActiveAppt(activeAppt === appt.id ? null : appt.id)}
                    >
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 900, color: appt.status === "current" ? "#1B4FD8" : "#0A0A0A" }}>{appt.time}</div>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 700 }}>{appt.client.toUpperCase()}</div>
                        {activeAppt === appt.id && (
                          <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#888", marginTop: 2 }}>{appt.duration} minutos</div>
                        )}
                      </div>
                      <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#444" }}>{appt.service}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 700, color: appt.status === "done" ? "#2E7D32" : "#0A0A0A" }}>{fmt(appt.price)}</div>
                      <div>
                        <span style={{
                          fontFamily: "'Barlow Condensed'", fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.15em", textTransform: "uppercase",
                          padding: "4px 8px",
                          background: sc.bg, color: sc.color,
                          border: `1px solid ${sc.border}`,
                          whiteSpace: "nowrap",
                        }}>{sc.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ────────────── AGENDA ────────────── */}
          {activeNav === "agenda" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 40, fontWeight: 900 }}>AGENDA COMPLETA</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  {["HOJE", "SEMANA", "MÊS"].map(v => (
                    <button key={v} style={{
                      fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      padding: "8px 20px", border: "2px solid #0A0A0A",
                      background: v === "HOJE" ? "#0A0A0A" : "transparent",
                      color: v === "HOJE" ? "#F5F2ED" : "#0A0A0A",
                      cursor: "pointer",
                    }}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div style={{ background: "#fff", border: "2px solid #0A0A0A" }}>
                {Array.from({ length: 11 }, (_, i) => {
                  const hour = `${(8 + i).toString().padStart(2, "0")}:00`;
                  const appts = MOCK_APPOINTMENTS.filter(a => a.time.startsWith((8 + i).toString().padStart(2, "0")));
                  return (
                    <div key={hour} style={{ display: "grid", gridTemplateColumns: "80px 1fr", borderBottom: "1px solid #eee", minHeight: 56 }}>
                      <div style={{ padding: "16px 16px", borderRight: "2px solid #0A0A0A", fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 700, color: "#888" }}>{hour}</div>
                      <div style={{ padding: "8px 16px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {appts.map(a => {
                          const sc = STATUS_CONFIG[a.status];
                          return (
                            <div key={a.id} style={{
                              padding: "8px 16px",
                              background: a.status === "current" ? "#1B4FD8" : a.status === "done" ? "#f0fff4" : "#F5F2ED",
                              border: `2px solid ${a.status === "current" ? "#1B4FD8" : a.status === "done" ? "#2E7D32" : "#ccc"}`,
                              cursor: "pointer",
                            }}>
                              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 900, color: a.status === "current" ? "#fff" : "#0A0A0A" }}>{a.client.split(" ")[0].toUpperCase()}</div>
                              <div style={{ fontFamily: "'Barlow'", fontSize: 11, color: a.status === "current" ? "rgba(255,255,255,0.7)" : "#888" }}>{a.service} · {a.time}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ────────────── PLACEHOLDER PAGES ────────────── */}
          {["clients", "services", "settings"].includes(activeNav) && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#888", textTransform: "uppercase", marginBottom: 16 }}>
                {{ clients: "CLIENTES", services: "SERVIÇOS", settings: "CONFIGURAÇÕES" }[activeNav]}
              </div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 80, fontWeight: 900, color: "#0A0A0A", lineHeight: 0.95, marginBottom: 32 }}>
                EM<br />BREVE<span style={{ color: "#FF6B6B" }}>.</span>
              </div>
              <p style={{ fontFamily: "'Barlow'", fontSize: 15, color: "#666", maxWidth: 400, lineHeight: 1.6 }}>
                Esta seção está sendo construída. Volte ao dashboard para ver seus agendamentos de hoje.
              </p>
              <button onClick={() => setActiveNav("overview")} style={{
                marginTop: 32, background: "#0A0A0A", color: "#F5F2ED", border: "none",
                fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 900,
                letterSpacing: "0.18em", textTransform: "uppercase",
                padding: "14px 32px", cursor: "pointer",
              }}>← VOLTAR AO DASHBOARD</button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}