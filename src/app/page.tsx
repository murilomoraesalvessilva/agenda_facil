"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AgendaiLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [ticker, setTicker] = useState(0);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [hoverPlan, setHoverPlan] = useState(null);
  const heroRef = useRef(null);
  const router  = useRouter();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTicker(p => p + 1), 40);
    return () => clearInterval(t);
  }, []);

  const tickerItems = [
    "AGENDAMENTOS ONLINE", "PARNAÍBA PI", "SALÕES", "BARBEARIAS",
    "CLÍNICAS", "SEM PAPEL", "SEM TELEFONE", "NOTIFICAÇÃO NO WHATSAPP",
    "PÁGINA PRÓPRIA", "PAINEL DE CONTROLE", "14 DIAS GRÁTIS",
  ];

  const repeatedTicker = [...tickerItems, ...tickerItems, ...tickerItems];

  const plans = [
    {
      id: "basico",
      label: "01 — BÁSICO",
      price: billingAnnual ? "R$49" : "R$59",
      per: "/mês",
      desc: "Para quem está começando. Um profissional, agendamentos ilimitados, página pública e suporte via chat.",
      items: ["1 profissional", "Agendamentos ilimitados", "Página pública", "WhatsApp", "Suporte chat"],
      bg: "#F0EDFF",
      border: "#1B4FD8",
      cta: "COMEÇAR GRÁTIS",
    },
    {
      id: "pro",
      label: "02 — PROFISSIONAL",
      price: billingAnnual ? "R$99" : "R$119",
      per: "/mês",
      desc: "Para negócios em crescimento. Até 5 profissionais, relatórios e suporte prioritário.",
      items: ["5 profissionais", "Agendamentos ilimitados", "Página personalizada", "WhatsApp", "Relatórios", "Suporte prioritário"],
      bg: "#1B4FD8",
      border: "#1B4FD8",
      cta: "ASSINAR AGORA",
      featured: true,
    },
    {
      id: "empresa",
      label: "03 — EMPRESARIAL",
      price: billingAnnual ? "R$179" : "R$219",
      per: "/mês",
      desc: "Para redes e franquias. Profissionais ilimitados, múltiplas unidades e API.",
      items: ["Ilimitado", "Multi-unidades", "API", "Relatórios avançados", "Onboarding", "SLA"],
      bg: "#FF6B6B",
      border: "#FF6B6B",
      cta: "FALAR COM VENDAS",
    },
  ];

  const steps = [
    { n: "I", title: "CADASTRE SEU NEGÓCIO", body: "Nome, serviços, horários. Menos de cinco minutos. Sem burocracia." },
    { n: "II", title: "COMPARTILHE O LINK", body: "Você ganha uma URL própria. Coloca no Instagram, no cartão, no WhatsApp." },
    { n: "III", title: "RECEBA CLIENTES", body: "Eles agendam. Você recebe confirmação automática. Acabou o telefone tocando." },
  ];

  const testimonials = [
    { name: "FERNANDA LEAL", role: "Studio Bella", quote: "As faltas caíram 80% depois que comecei a usar. Os lembretes automáticos mudaram tudo." },
    { name: "RODRIGO BARROS", role: "Barbearia Corte & Arte", quote: "Parece que meu negócio cresceu de tamanho, mesmo sendo a mesma barbearia de sempre." },
    { name: "DRA. CAMILA MOTA", role: "Clínica Sorriso", quote: "Economizei uma funcionária inteira. O sistema agenda, confirma e lembra — sozinho." },
  ];

  const offsetX = -(ticker * 0.4) % (tickerItems.join("   ——   ").length * 9);

  return (
    <div style={{
      fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
      background: "#F5F2ED",
      color: "#0A0A0A",
      overflowX: "hidden",
      cursor: "default",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        ::selection { background: #1B4FD8; color: #fff; }

        body { overflow-x: hidden; }

        .nav-item {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #0A0A0A; text-decoration: none;
          transition: color 0.15s;
        }
        .nav-item:hover { color: #FF6B6B; }

        .big-cta {
          display: inline-block;
          background: #1B4FD8;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px; font-weight: 900;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 16px 40px;
          border: none; cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          text-decoration: none;
        }
        .big-cta:hover { background: #FF6B6B; transform: translate(-2px, -2px); }

        .ghost-cta {
          display: inline-block;
          background: transparent;
          color: #0A0A0A;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px; font-weight: 900;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 15px 40px;
          border: 2px solid #0A0A0A; cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
        }
        .ghost-cta:hover { background: #0A0A0A; color: #F5F2ED; transform: translate(-2px, -2px); }

        .ticker-wrap {
          overflow: hidden;
          white-space: nowrap;
          background: #1B4FD8;
          padding: 14px 0;
          border-top: 2px solid #0A0A0A;
          border-bottom: 2px solid #0A0A0A;
        }
        .ticker-inner {
          display: inline-block;
          white-space: nowrap;
        }
        .ticker-item {
          display: inline-block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px; font-weight: 900;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #fff;
          margin: 0 28px;
        }
        .ticker-sep {
          display: inline-block;
          color: #FF6B6B;
          margin: 0 4px;
          font-weight: 900;
        }

        .section-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: #888; margin-bottom: 0;
        }

        .display-xl {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900; line-height: 0.92;
          letter-spacing: -0.01em; text-transform: uppercase;
        }

        .body-text {
          font-family: 'Barlow', sans-serif;
          font-weight: 400; line-height: 1.65;
          color: #444;
        }

        .ruled { border-top: 2px solid #0A0A0A; }
        .ruled-light { border-top: 1px solid rgba(10,10,10,0.15); }

        .plan-row {
          display: grid;
          grid-template-columns: 220px 1fr 180px;
          align-items: center;
          padding: 32px 0;
          border-bottom: 2px solid #0A0A0A;
          transition: background 0.15s;
          cursor: pointer;
          gap: 40px;
        }
        .plan-row:hover { background: rgba(27,79,216,0.04); }
        .plan-row.featured { background: #1B4FD8; color: #fff; padding: 32px 24px; margin: 0 -24px; }
        .plan-row.featured .body-text { color: rgba(255,255,255,0.7); }
        .plan-row.featured .section-label { color: rgba(255,255,255,0.5); }

        .step-block {
          border-left: 4px solid #1B4FD8;
          padding: 0 0 0 32px;
          margin-bottom: 0;
        }

        .testimonial-block {
          border-top: 2px solid #0A0A0A;
          padding: 40px 0;
        }

        .tag-pill {
          display: inline-block;
          border: 2px solid #0A0A0A;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 6px 14px;
          transition: all 0.15s; cursor: default;
        }
        .tag-pill:hover { background: #0A0A0A; color: #F5F2ED; }

        .number-huge {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900; font-size: 120px;
          line-height: 1; letter-spacing: -0.03em;
          color: #1B4FD8;
          opacity: 0.12;
          position: absolute;
          top: -20px; left: -10px;
          pointer-events: none;
          user-select: none;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slideIn 0.6s ease forwards; }
        .si-1 { animation-delay: 0.05s; opacity: 0; }
        .si-2 { animation-delay: 0.15s; opacity: 0; }
        .si-3 { animation-delay: 0.28s; opacity: 0; }
        .si-4 { animation-delay: 0.4s; opacity: 0; }

        .diagonal-accent {
          position: absolute;
          top: 0; right: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 0 120px 120px 0;
          border-color: transparent #FF6B6B transparent transparent;
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .plan-row { grid-template-columns: 1fr !important; gap: 16px !important; }
          .stats-row { grid-template-columns: 1fr 1fr !important; }
          .testi-grid { grid-template-columns: 1fr !important; }
          .hide-sm { display: none !important; }
          nav { padding: 16px 20px !important; }
          .hero-section { padding: 100px 20px 60px !important; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        background: scrollY > 40 ? "#F5F2ED" : "transparent",
        borderBottom: scrollY > 40 ? "2px solid #0A0A0A" : "2px solid transparent",
        transition: "border-color 0.2s, background 0.2s",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase" }}>AGENDAÍ</span>
          <span style={{ width: 8, height: 8, background: "#FF6B6B", display: "inline-block", marginBottom: 2 }} />
        </div>

        <div className="hide-sm" style={{ display: "flex", gap: 40 }}>
          {["Como funciona", "Nichos", "Preços", "Depoimentos"].map(l => (
            <a key={l} href="#" className="nav-item">{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 0 }}>
          <button className="ghost-cta" style={{ fontSize: 13, padding: "10px 20px", letterSpacing: "0.15em" }} onClick={() => router.push("/auth")}>ENTRAR</button>
          <button className="big-cta" style={{ fontSize: 13, padding: "10px 20px", letterSpacing: "0.15em", marginLeft: -2 }} onClick={() => router.push("/auth")}>COMEÇAR</button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero-section" ref={heroRef} style={{
        padding: "140px 48px 80px",
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
      }}>
        {/* background grid lines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(10,10,10,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,0.04) 1px, transparent 1px)", backgroundSize: "80px 80px", pointerEvents: "none" }} />

        {/* top-right accent block */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 320, height: 320, background: "#1B4FD8", opacity: 0.06 }} />
        <div style={{ position: "absolute", top: 60, right: 60, width: 180, height: 4, background: "#FF6B6B" }} />
        <div style={{ position: "absolute", top: 60, right: 60, width: 4, height: 180, background: "#FF6B6B" }} />

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <div className="hero-grid slide-in si-1" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 0, alignItems: "end" }}>
            <div>
              <p className="section-label slide-in si-1" style={{ marginBottom: 24 }}>
                Plataforma SaaS — Parnaíba, PI — 2025
              </p>
              <h1 className="display-xl slide-in si-2" style={{ fontSize: "clamp(72px, 10vw, 148px)", marginBottom: 0, color: "#0A0A0A" }}>
                AGENDE<br />
                <span style={{ color: "#1B4FD8", WebkitTextStroke: "0px" }}>MAIS.</span><br />
                <span style={{ color: "#FF6B6B" }}>LIGUE</span><br />
                MENOS.
              </h1>
            </div>

            <div className="hide-sm slide-in si-3" style={{ paddingBottom: 8, paddingLeft: 40, borderLeft: "2px solid #0A0A0A" }}>
              <p className="body-text" style={{ fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
                A plataforma de agendamentos feita para os negócios de Parnaíba. Salões, barbearias, clínicas — seus clientes agendam online e você recebe tudo no WhatsApp.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button className="big-cta" style={{ width: "100%", textAlign: "center" }} onClick={() => router.push("/auth")}>TESTE GRÁTIS POR 14 DIAS</button>
                <button className="ghost-cta" style={{ width: "100%", textAlign: "center" }} onClick={() => router.push("/agendar/barbearia-do-joao")}>VER DEMONSTRAÇÃO</button>
              </div>
              <p style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#888", marginTop: 16, letterSpacing: "0.05em" }}>
                Sem cartão de crédito. Cancele quando quiser.
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="slide-in si-4" style={{ marginTop: 80, paddingTop: 32, borderTop: "2px solid #0A0A0A", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[["150+", "Negócios ativos"], ["98%", "Taxa de satisfação"], ["< 5min", "Para começar a usar"]].map(([n, l], i) => (
              <div key={l} style={{ paddingRight: 40, borderRight: i < 2 ? "1px solid rgba(10,10,10,0.2)" : "none", paddingLeft: i > 0 ? 40 : 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 56, fontWeight: 900, letterSpacing: "-0.03em", color: "#1B4FD8", lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#666", marginTop: 4, letterSpacing: "0.04em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div className="ticker-wrap">
        <div className="ticker-inner" style={{ transform: `translateX(${offsetX}px)`, transition: "none" }}>
          {repeatedTicker.map((item, i) => (
            <span key={i} className="ticker-item">
              {item}
              <span className="ticker-sep">——</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── NICHOS ─── */}
      <section style={{ padding: "80px 48px", borderBottom: "2px solid #0A0A0A" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 40 }}>
            <p className="section-label">Segmentos atendidos</p>
            <div style={{ width: 60, height: 2, background: "#FF6B6B" }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {["Salões de Beleza", "Barbearias", "Clínicas", "Psicólogos", "Personal Trainers", "Estúdios de Tatuagem", "Consultórios Médicos", "Spas & Estética", "Nutricionistas", "Fisioterapeutas"].map(n => (
              <span key={n} className="tag-pill">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section style={{ padding: "100px 48px", background: "#0A0A0A", color: "#F5F2ED" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <p className="section-label" style={{ color: "#555", marginBottom: 20 }}>Como funciona</p>
              <h2 className="display-xl" style={{ fontSize: 60, color: "#F5F2ED", marginBottom: 32 }}>
                TRÊS<br />PASSOS.<br />
                <span style={{ color: "#FF6B6B" }}>SÓ.</span>
              </h2>
              <p className="body-text" style={{ color: "#666", fontSize: 14 }}>
                Sem treinamento. Sem manual. Sem suporte técnico necessário.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ paddingBottom: 48, paddingTop: i === 0 ? 0 : 48, borderBottom: i < 2 ? "1px solid #222" : "none", display: "grid", gridTemplateColumns: "80px 1fr", gap: 32 }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 64, fontWeight: 900, color: "#1B4FD8", lineHeight: 1, opacity: 0.5 }}>{s.n}</div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900, letterSpacing: "0.04em", color: "#F5F2ED", marginBottom: 12 }}>{s.title}</div>
                    <p className="body-text" style={{ color: "#777", fontSize: 15 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PREÇOS ─── */}
      <section style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 60, flexWrap: "wrap", gap: 24 }}>
            <div>
              <p className="section-label" style={{ marginBottom: 12 }}>Planos</p>
              <h2 className="display-xl" style={{ fontSize: 72 }}>QUANTO<br />CUSTA<span style={{ color: "#FF6B6B" }}>?</span></h2>
            </div>

            {/* Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, border: "2px solid #0A0A0A", padding: 0, alignSelf: "flex-end" }}>
              <button onClick={() => setBillingAnnual(false)} style={{
                padding: "10px 24px", border: "none", cursor: "pointer",
                fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                background: !billingAnnual ? "#0A0A0A" : "transparent",
                color: !billingAnnual ? "#F5F2ED" : "#0A0A0A",
                transition: "all 0.15s",
              }}>MENSAL</button>
              <button onClick={() => setBillingAnnual(true)} style={{
                padding: "10px 24px", border: "none", cursor: "pointer",
                fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                background: billingAnnual ? "#0A0A0A" : "transparent",
                color: billingAnnual ? "#F5F2ED" : "#0A0A0A",
                borderLeft: "2px solid #0A0A0A",
                transition: "all 0.15s",
              }}>ANUAL <span style={{ color: "#FF6B6B", fontSize: 11 }}>−17%</span></button>
            </div>
          </div>

          {/* Plan rows */}
          <div style={{ borderTop: "2px solid #0A0A0A" }}>
            {plans.map((plan, i) => (
              <div key={plan.id} className={`plan-row ${plan.featured ? "featured" : ""}`}
                onMouseEnter={() => setHoverPlan(plan.id)}
                onMouseLeave={() => setHoverPlan(null)}
                style={{
                  display: "grid", gridTemplateColumns: "240px 1fr auto",
                  alignItems: "center", padding: plan.featured ? "36px 24px" : "32px 0",
                  margin: plan.featured ? "0 -24px" : "0",
                  borderBottom: "2px solid " + (plan.featured ? "rgba(255,255,255,0.15)" : "#0A0A0A"),
                  background: plan.featured ? "#1B4FD8" : (hoverPlan === plan.id ? "rgba(27,79,216,0.04)" : "transparent"),
                  transition: "background 0.15s",
                  cursor: "pointer", gap: 40,
                }}>
                <div>
                  <p className="section-label" style={{ color: plan.featured ? "rgba(255,255,255,0.5)" : "#888", marginBottom: 8 }}>{plan.label}</p>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em", color: plan.featured ? "#fff" : "#0A0A0A" }}>
                    {plan.price}
                    <span style={{ fontSize: 18, fontWeight: 400, color: plan.featured ? "rgba(255,255,255,0.5)" : "#888" }}>{plan.per}</span>
                  </div>
                </div>

                <div>
                  <p className="body-text" style={{ fontSize: 15, marginBottom: 16, color: plan.featured ? "rgba(255,255,255,0.75)" : "#444" }}>{plan.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {plan.items.map(item => (
                      <span key={item} style={{
                        fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        padding: "4px 12px",
                        border: `1px solid ${plan.featured ? "rgba(255,255,255,0.25)" : "rgba(10,10,10,0.2)"}`,
                        color: plan.featured ? "rgba(255,255,255,0.7)" : "#555",
                      }}>{item}</span>
                    ))}
                  </div>
                </div>

                <button style={{
                  fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 900,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  padding: "14px 28px", border: "none", cursor: "pointer",
                  background: plan.featured ? "#FF6B6B" : "#0A0A0A",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  transition: "transform 0.15s, background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translate(0,0)"}
                  onClick={() => router.push("/auth")}
                >{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEPOIMENTOS ─── */}
      <section style={{ padding: "100px 48px", background: "#F0EDFF", borderTop: "2px solid #0A0A0A" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 64, display: "flex", alignItems: "baseline", gap: 24 }}>
            <p className="section-label">Depoimentos</p>
            <div style={{ height: 2, flex: 1, background: "#0A0A0A" }} />
          </div>

          <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-block" style={{ paddingRight: i < 2 ? 48 : 0, paddingLeft: i > 0 ? 48 : 0, borderLeft: i > 0 ? "2px solid #0A0A0A" : "none" }}>
                <p className="body-text" style={{ fontSize: 17, lineHeight: 1.65, marginBottom: 32, color: "#222", fontStyle: "italic" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 900, letterSpacing: "0.08em" }}>{t.name}</div>
                  <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#888", marginTop: 2 }}>{t.role} — Parnaíba, PI</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section style={{ padding: "0", borderTop: "2px solid #0A0A0A", background: "#FF6B6B", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 80 }}>
          <div>
            <p className="section-label" style={{ color: "rgba(0,0,0,0.45)", marginBottom: 20 }}>Comece hoje mesmo</p>
            <h2 className="display-xl" style={{ fontSize: "clamp(52px, 7vw, 96px)", color: "#fff", lineHeight: 0.95, marginBottom: 24 }}>
              SEU NEGÓCIO<br />NÃO ESPERA.
            </h2>
            <p className="body-text" style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, maxWidth: 480 }}>
              14 dias grátis. Sem cartão de crédito. Cancele quando quiser. Feito para Parnaíba.
            </p>
          </div>
          <div className="hide-sm" style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 280 }}>
            <button style={{
              background: "#fff", color: "#FF6B6B", border: "none",
              fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 900,
              letterSpacing: "0.18em", textTransform: "uppercase",
              padding: "18px 40px", cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#0A0A0A"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translate(-3px,-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#FF6B6B"; e.currentTarget.style.transform = "translate(0,0)"; }}
              onClick={() => router.push("/auth")}
            >CRIAR CONTA GRÁTIS</button>
            <button style={{
              background: "transparent", color: "#fff",
              border: "2px solid rgba(255,255,255,0.6)",
              fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 900,
              letterSpacing: "0.18em", textTransform: "uppercase",
              padding: "18px 40px", cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.transform = "translate(-3px,-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; e.currentTarget.style.transform = "translate(0,0)"; }}
              onClick={() => router.push("/barbearia-do-joao")}
            >VER DEMONSTRAÇÃO</button>
          </div>
        </div>

        {/* background type decoration */}
        <div style={{ position: "absolute", bottom: -30, right: -20, fontFamily: "'Barlow Condensed'", fontSize: 200, fontWeight: 900, color: "rgba(255,255,255,0.08)", lineHeight: 1, userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em" }}>
          AGENDE
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: "40px 48px", background: "#0A0A0A", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, borderTop: "2px solid #222" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, color: "#F5F2ED", letterSpacing: "-0.01em", textTransform: "uppercase" }}>AGENDAÍ</span>
          <span style={{ width: 6, height: 6, background: "#FF6B6B", display: "inline-block", marginBottom: 2 }} />
        </div>
        <p style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#444", letterSpacing: "0.06em" }}>
          © 2025 AGENDAÍ — PARNAÍBA, PIAUÍ
        </p>
        <div style={{ display: "flex", gap: 32 }}>
          {["Termos", "Privacidade", "Contato"].map(l => (
            <a key={l} href="#" style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = "#FF6B6B"}
              onMouseLeave={e => e.target.style.color = "#444"}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}