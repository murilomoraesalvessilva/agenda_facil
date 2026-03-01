"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "BARBEARIA", "SALÃO DE BELEZA", "CLÍNICA MÉDICA", "PSICOLOGIA",
  "PERSONAL TRAINER", "TATUAGEM", "SPA / ESTÉTICA", "NUTRIÇÃO",
  "FISIOTERAPIA", "ODONTOLOGIA", "OUTRO",
];

const DAYS_OF_WEEK = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

const HOURS = Array.from({ length: 28 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
});

const DEFAULT_SERVICES = [
  { id: 1, name: "Corte Masculino", duration: 30, price: 35 },
  { id: 2, name: "Barba",           duration: 20, price: 25 },
];

const TOTAL_STEPS = 4;

// ─── STEP CONFIGS ─────────────────────────────────────────────────────────────

const STEPS = [
  { n: "01", label: "NEGÓCIO"   },
  { n: "02", label: "HORÁRIOS"  },
  { n: "03", label: "SERVIÇOS"  },
  { n: "04", label: "PRONTO"    },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [businessSlug, setBusinessSlug] = useState("");
  const router = useRouter();

  // step 1 — business info
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [phone,        setPhone]        = useState("");
  const [address,      setAddress]      = useState("");

  // step 2 — hours
  const [activeDays,   setActiveDays]   = useState(["SEG","TER","QUA","QUI","SEX","SAB"]);
  const [openTime,     setOpenTime]     = useState("08:00");
  const [closeTime,    setCloseTime]    = useState("18:00");
  const [slotDuration, setSlotDuration] = useState(30);

  // step 3 — services
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [newSvc,   setNewSvc]   = useState({ name: "", duration: 30, price: "" });
  const [svcError, setSvcError] = useState("");

  // ── helpers ──
  const slug = businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const toggleDay = (d) => setActiveDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const addService = () => {
    if (!newSvc.name)   { setSvcError("Nome obrigatório"); return; }
    if (!newSvc.price)  { setSvcError("Preço obrigatório"); return; }
    setServices(prev => [...prev, { ...newSvc, id: Date.now(), price: Number(newSvc.price) }]);
    setNewSvc({ name: "", duration: 30, price: "" });
    setSvcError("");
  };

  const removeService = (id) => setServices(prev => prev.filter((s: any) => s.id !== id));

  const validateStep = () => {
    if (step === 1) {
      const e: Record<string, string> = {};
      if (!businessName) e.businessName = "Campo obrigatório";
      if (!businessType) e.businessType = "Selecione um tipo";
      if (!phone)        e.phone        = "Campo obrigatório";
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    if (step === 2) {
      if (activeDays.length === 0) { setErrors({ days: "Selecione ao menos um dia" }); return false; }
      setErrors({});
      return true;
    }
    if (step === 3) {
      if (services.length === 0) { setSvcError("Adicione ao menos um serviço"); return false; }
      return true;
    }
    return true;
  };

  const advance = async () => {
    if (!validateStep()) return;
    if (step === 3) {
      setLoading(true);

      try {
        const res = await fetch("/api/business/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName,
            businessType,
            phone,
            address,
            activeDays,
            openTime,
            closeTime,
            slotDuration,
            services,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erro ao salvar. Tente novamente.");
          setLoading(false);
          return;
        }

        // Salva o slug para usar no botão "Ver página pública"
        setBusinessSlug(data.business.slug);
        setStep(4);

      } catch (err) {
        alert("Erro de conexão. Tente novamente.");
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep(s => s + 1);
  };

  // ── styles ──
  const inp = (err: string | undefined) => ({
    width: "100%", padding: "14px 16px",
    fontFamily: "'Barlow', sans-serif", fontSize: 15,
    background: "#F5F2ED",
    border: `2px solid ${err ? "#FF6B6B" : "#0A0A0A"}`,
    outline: "none", color: "#0A0A0A",
  });

  const lbl = {
    fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.25em", textTransform: "uppercase",
    color: "#888", display: "block", marginBottom: 8,
  };

  const errMsg = (k: string) => errors[k]
    ? <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#FF6B6B", marginTop: 4, display: "block" }}>{errors[k]}</span>
    : null;

  return (
    <div style={{
      fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
      minHeight: "100vh", background: "#F5F2ED", color: "#0A0A0A",
      display: "grid", gridTemplateColumns: "300px 1fr",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,400;0,700;0,900;1,700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #1B4FD8; color: #fff; }
        input:focus, select:focus { border-color: #1B4FD8 !important; outline: none; }

        .next-btn {
          width: 100%; padding: 18px;
          background: #0A0A0A; color: #F5F2ED;
          border: none; cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px; font-weight: 900; letter-spacing: 0.22em; text-transform: uppercase;
          transition: all 0.15s;
        }
        .next-btn:hover:not(:disabled) { background: #1B4FD8; transform: translate(-2px,-2px); box-shadow: 2px 2px 0 #0A0A0A; }
        .next-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .back-btn {
          padding: 18px 28px; background: transparent;
          border: 2px solid #0A0A0A; cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;
          transition: all 0.15s;
        }
        .back-btn:hover { background: rgba(10,10,10,0.05); }

        .day-btn {
          flex: 1; padding: 12px 0; text-align: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 900; letter-spacing: 0.1em;
          border: 2px solid #0A0A0A; cursor: pointer;
          transition: all 0.12s; background: transparent; color: #0A0A0A;
        }
        .day-btn.on  { background: #0A0A0A; color: #F5F2ED; }
        .day-btn.sun { border-color: #ccc; color: #bbb; }
        .day-btn:hover:not(.sun) { border-color: #1B4FD8; color: #1B4FD8; }
        .day-btn.on:hover { background: #1B4FD8; border-color: #1B4FD8; color: #fff; }

        .type-btn {
          padding: 10px 14px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          border: 2px solid #0A0A0A; background: transparent; color: #0A0A0A;
          cursor: pointer; transition: all 0.12s;
        }
        .type-btn:hover  { border-color: #1B4FD8; color: #1B4FD8; }
        .type-btn.chosen { background: #1B4FD8; color: #fff; border-color: #1B4FD8; }

        .slot-chip {
          display: inline-block; padding: 6px 14px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 700; letter-spacing: 0.1em;
          border: 1px solid #ccc; color: #888;
          cursor: default; background: #fff;
        }

        .svc-row {
          display: grid; grid-template-columns: 1fr 80px 80px 36px;
          align-items: center; gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        }

        .add-btn {
          padding: 14px 20px;
          background: #0A0A0A; color: #F5F2ED; border: none; cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;
          white-space: nowrap; transition: background 0.15s;
        }
        .add-btn:hover { background: #1B4FD8; }

        .del-btn {
          width: 32px; height: 32px; border: 2px solid #FF6B6B;
          background: transparent; color: #FF6B6B; cursor: pointer;
          font-size: 14px; font-weight: 900; display: flex;
          align-items: center; justify-content: center;
          transition: all 0.12s; flex-shrink: 0;
        }
        .del-btn:hover { background: #FF6B6B; color: #fff; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.25s ease forwards; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }

        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-10deg); }
          70%  { transform: scale(1.15) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .check-pop { animation: checkPop 0.5s cubic-bezier(.36,.07,.19,.97) 0.3s both; }

        @keyframes slideProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        @media (max-width: 860px) {
          .layout { grid-template-columns: 1fr !important; }
          .left-panel { display: none !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          LEFT — PROGRESS SIDEBAR
      ══════════════════════════════════════════ */}
      <aside className="left-panel" style={{
        background: "#0A0A0A", padding: "48px 40px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        borderRight: "2px solid #222", position: "sticky", top: 0, height: "100vh",
        overflowY: "auto",
      }}>
        {/* logo */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 56 }}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 24, fontWeight: 900, color: "#F5F2ED", textTransform: "uppercase" }}>AGENDAÍ</span>
            <span style={{ width: 7, height: 7, background: "#FF6B6B", display: "inline-block", marginBottom: 2 }} />
          </div>

          {/* step list */}
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#444", marginBottom: 32 }}>
            CONFIGURAÇÃO INICIAL
          </div>

          {STEPS.map((s, i) => {
            const sn    = i + 1;
            const done  = step > sn;
            const curr  = step === sn;
            return (
              <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 32 }}>
                {/* connector line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={{
                    width: 36, height: 36, flexShrink: 0,
                    border: `2px solid ${done ? "#FF6B6B" : curr ? "#1B4FD8" : "#333"}`,
                    background: done ? "#FF6B6B" : curr ? "#1B4FD8" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 900,
                    color: done || curr ? "#fff" : "#444",
                    transition: "all 0.3s",
                  }}>
                    {done ? "✓" : s.n}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 2, height: 28, background: done ? "#FF6B6B" : "#222", marginTop: 2, transition: "background 0.4s" }} />
                  )}
                </div>

                <div style={{ paddingTop: 6 }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 900, letterSpacing: "0.06em", color: done ? "#FF6B6B" : curr ? "#F5F2ED" : "#333" }}>
                    {s.label}
                  </div>
                  {curr && (
                    <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#555", marginTop: 3 }}>
                      {["", "Informações do negócio", "Dias e horários de funcionamento", "Serviços oferecidos", "Tudo pronto!"][sn]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* bottom note */}
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 28 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333", marginBottom: 8 }}>
            14 DIAS GRÁTIS
          </div>
          <p style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#444", lineHeight: 1.65 }}>
            Sem cartão de crédito. Configure agora e comece a receber agendamentos hoje mesmo.
          </p>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          RIGHT — FORM AREA
      ══════════════════════════════════════════ */}
      <main style={{ padding: "60px 72px", overflowY: "auto", maxHeight: "100vh" }}>

        {/* ──────────── STEP 1 — NEGÓCIO ──────────── */}
        {step === 1 && (
          <div className="fu" style={{ maxWidth: 600 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>PASSO 01 DE 03</div>
            <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 60, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 8 }}>
              SEU<br />NEGÓCIO<span style={{ color: "#FF6B6B" }}>.</span>
            </h1>
            <p style={{ fontFamily: "'Barlow'", fontSize: 15, color: "#666", lineHeight: 1.7, marginBottom: 48 }}>
              Essas informações vão aparecer na sua página pública de agendamento.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* business name */}
              <div>
                <span style={lbl}>NOME DO NEGÓCIO</span>
                <input
                  type="text" placeholder="Ex: Barbearia do João"
                  value={businessName} onChange={e => { setBusinessName(e.target.value); setErrors(er => ({ ...er, businessName: undefined })); }}
                  style={inp(errors.businessName)}
                />
                {errMsg("businessName")}
                {businessName && (
                  <div style={{ marginTop: 8, fontFamily: "'Barlow'", fontSize: 12, color: "#888" }}>
                    Sua URL pública:{" "}
                    <span style={{ color: "#1B4FD8", fontWeight: 600 }}>agendai.com.br/{slug}</span>
                  </div>
                )}
              </div>

              {/* type */}
              <div>
                <span style={lbl}>TIPO DE NEGÓCIO</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {BUSINESS_TYPES.map((t: any) => (
                    <button key={t} className={`type-btn ${businessType === t ? "chosen" : ""}`}
                      onClick={() => { setBusinessType(t); setErrors(er => ({ ...er, businessType: undefined })); }}
                    >{t}</button>
                  ))}
                </div>
                {errMsg("businessType")}
              </div>

              {/* phone */}
              <div>
                <span style={lbl}>WHATSAPP DO NEGÓCIO</span>
                <input
                  type="tel" placeholder="(86) 9 9999-9999"
                  value={phone} onChange={e => { setPhone(e.target.value); setErrors(er => ({ ...er, phone: undefined })); }}
                  style={inp(errors.phone)}
                />
                {errMsg("phone")}
                <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#888", marginTop: 6, display: "block" }}>
                  Seus clientes poderão te chamar diretamente por aqui.
                </span>
              </div>

              {/* address */}
              <div>
                <span style={lbl}>ENDEREÇO <span style={{ color: "#bbb", letterSpacing: "0.1em" }}>(OPCIONAL)</span></span>
                <input
                  type="text" placeholder="Rua, número — Parnaíba, PI"
                  value={address} onChange={e => setAddress(e.target.value)}
                  style={inp(false)}
                />
              </div>
            </div>

            <div style={{ marginTop: 48 }}>
              <button className="next-btn" onClick={advance}>PRÓXIMO PASSO →</button>
            </div>
          </div>
        )}

        {/* ──────────── STEP 2 — HORÁRIOS ──────────── */}
        {step === 2 && (
          <div className="fu" style={{ maxWidth: 640 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>PASSO 02 DE 03</div>
            <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 60, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 8 }}>
              QUANDO<br />VOCÊ<br />ATENDE<span style={{ color: "#FF6B6B" }}>?</span>
            </h1>
            <p style={{ fontFamily: "'Barlow'", fontSize: 15, color: "#666", lineHeight: 1.7, marginBottom: 48 }}>
              Configure os dias e horários em que seu negócio está aberto para agendamentos.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              {/* days */}
              <div>
                <span style={lbl}>DIAS DE ATENDIMENTO</span>
                <div style={{ display: "flex", gap: 0, border: "2px solid #0A0A0A" }}>
                  {DAYS_OF_WEEK.map((d, i) => {
                    const isSun = d === "DOM";
                    const isOn  = activeDays.includes(d);
                    return (
                      <button key={d}
                        className={`day-btn ${isOn ? "on" : ""} ${isSun ? "sun" : ""}`}
                        onClick={() => !isSun && toggleDay(d)}
                        style={{ borderRight: i < 6 ? "1px solid #333" : "none" }}
                      >{d}</button>
                    );
                  })}
                </div>
                {errMsg("days")}
                <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#888", marginTop: 8, display: "block" }}>
                  Domingo não disponível nesta versão.
                </span>
              </div>

              {/* open / close */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <span style={lbl}>ABERTURA</span>
                  <select value={openTime} onChange={e => setOpenTime(e.target.value)} style={{ ...inp(false), appearance: "none", cursor: "pointer" }}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <span style={lbl}>FECHAMENTO</span>
                  <select value={closeTime} onChange={e => setCloseTime(e.target.value)} style={{ ...inp(false), appearance: "none", cursor: "pointer" }}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* slot duration */}
              <div>
                <span style={lbl}>INTERVALO ENTRE HORÁRIOS</span>
                <div style={{ display: "flex", gap: 0, border: "2px solid #0A0A0A", width: "fit-content" }}>
                  {[15, 20, 30, 45, 60].map((d, i) => (
                    <button key={d}
                      onClick={() => setSlotDuration(d)}
                      style={{
                        padding: "12px 20px",
                        fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 900, letterSpacing: "0.08em",
                        border: "none", cursor: "pointer",
                        borderRight: i < 4 ? "1px solid #ccc" : "none",
                        background: slotDuration === d ? "#0A0A0A" : "transparent",
                        color: slotDuration === d ? "#F5F2ED" : "#0A0A0A",
                        transition: "all 0.12s",
                      }}
                    >{d}min</button>
                  ))}
                </div>
                <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#888", marginTop: 8, display: "block" }}>
                  Tempo mínimo entre um agendamento e outro.
                </span>
              </div>

              {/* preview slots */}
              <div style={{ background: "#fff", border: "2px solid #0A0A0A", padding: "20px 24px" }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", marginBottom: 14 }}>
                  PRÉVIA DOS HORÁRIOS DISPONÍVEIS
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(() => {
                    const slots = [];
                    const [oh, om] = openTime.split(":").map(Number);
                    const [ch, cm] = closeTime.split(":").map(Number);
                    let cur = oh * 60 + om;
                    const end = ch * 60 + cm;
                    while (cur < end) {
                      const hh = Math.floor(cur / 60).toString().padStart(2, "0");
                      const mm = (cur % 60).toString().padStart(2, "0");
                      slots.push(`${hh}:${mm}`);
                      cur += slotDuration;
                    }
                    return slots.slice(0, 12).map((s: any) => <span key={s} className="slot-chip">{s}</span>);
                  })()}
                  <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#bbb", alignSelf: "center" }}>...</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 48, display: "flex", gap: 8 }}>
              <button className="back-btn" onClick={() => setStep(1)}>← VOLTAR</button>
              <button className="next-btn" onClick={advance} style={{ flex: 1 }}>PRÓXIMO PASSO →</button>
            </div>
          </div>
        )}

        {/* ──────────── STEP 3 — SERVIÇOS ──────────── */}
        {step === 3 && (
          <div className="fu" style={{ maxWidth: 680 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>PASSO 03 DE 03</div>
            <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 60, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 8 }}>
              O QUE<br />VOCÊ<br />OFERECE<span style={{ color: "#FF6B6B" }}>?</span>
            </h1>
            <p style={{ fontFamily: "'Barlow'", fontSize: 15, color: "#666", lineHeight: 1.7, marginBottom: 48 }}>
              Adicione os serviços que seus clientes poderão agendar. Você pode editar depois.
            </p>

            {/* service list */}
            {services.length > 0 && (
              <div style={{ border: "2px solid #0A0A0A", marginBottom: 24 }}>
                {/* header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 36px", gap: 16, padding: "10px 20px", background: "#0A0A0A" }}>
                  {["SERVIÇO", "TEMPO", "VALOR", ""].map(h => (
                    <div key={h} style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#555" }}>{h}</div>
                  ))}
                </div>
                {services.map((s, i) => (
                  <div key={s.id} className="svc-row" style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 900, textTransform: "uppercase" }}>{s.name}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 700, color: "#888" }}>{s.duration}min</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 900, color: "#1B4FD8" }}>R${s.price}</div>
                    <button className="del-btn" onClick={() => removeService(s.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* add new service */}
            <div style={{ border: "2px solid #0A0A0A", padding: "24px", background: "#fff" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 20 }}>
                + ADICIONAR SERVIÇO
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px auto", gap: 12, alignItems: "end" }}>
                <div>
                  <span style={lbl}>NOME</span>
                  <input
                    type="text" placeholder="Ex: Corte + Barba"
                    value={newSvc.name}
                    onChange={e => { setNewSvc(v => ({ ...v, name: e.target.value })); setSvcError(""); }}
                    style={inp(false)}
                  />
                </div>
                <div>
                  <span style={lbl}>DURAÇÃO</span>
                  <select
                    value={newSvc.duration}
                    onChange={e => setNewSvc(v => ({ ...v, duration: Number(e.target.value) }))}
                    style={{ ...inp(false), appearance: "none", cursor: "pointer" }}
                  >
                    {[15, 20, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d}min</option>)}
                  </select>
                </div>
                <div>
                  <span style={lbl}>VALOR (R$)</span>
                  <input
                    type="number" placeholder="0"
                    value={newSvc.price}
                    onChange={e => { setNewSvc(v => ({ ...v, price: e.target.value })); setSvcError(""); }}
                    style={inp(false)}
                  />
                </div>
                <button className="add-btn" onClick={addService}>ADD</button>
              </div>
              {svcError && <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#FF6B6B", marginTop: 8, display: "block" }}>{svcError}</span>}
            </div>

            <div style={{ marginTop: 48, display: "flex", gap: 8 }}>
              <button className="back-btn" onClick={() => setStep(2)}>← VOLTAR</button>
              <button className="next-btn" onClick={advance} disabled={loading} style={{ flex: 1 }}>
                {loading ? <><span className="spinner" />CONFIGURANDO...</> : "FINALIZAR CONFIGURAÇÃO →"}
              </button>
            </div>
          </div>
        )}

        {/* ──────────── STEP 4 — PRONTO ──────────── */}
        {step === 4 && (
          <div className="fu" style={{ maxWidth: 600 }}>
            <div className="check-pop" style={{
              width: 88, height: 88, background: "#0A0A0A",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 40,
            }}>
              <span style={{ fontSize: 40, color: "#4CAF50" }}>✓</span>
            </div>

            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#4CAF50", marginBottom: 12 }}>
              CONFIGURAÇÃO CONCLUÍDA
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 72, fontWeight: 900, lineHeight: 0.92, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 24 }}>
              TUDO<br />PRONTO<span style={{ color: "#FF6B6B" }}>!</span>
            </h1>
            <p style={{ fontFamily: "'Barlow'", fontSize: 16, color: "#555", lineHeight: 1.75, maxWidth: 460, marginBottom: 48 }}>
              Seu negócio está configurado. Compartilhe sua URL e comece a receber agendamentos agora mesmo.
            </p>

            {/* URL card */}
            <div style={{ border: "2px solid #1B4FD8", padding: "20px 24px", background: "#F0EDFF", marginBottom: 32 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#1B4FD8", marginBottom: 6 }}>SUA URL PÚBLICA</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, color: "#1B4FD8", wordBreak: "break-all" }}>
                agendai.com.br/{slug || "seu-negocio"}
              </div>
              <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#888", marginTop: 6 }}>
                Coloque no Instagram, cartão de visita e WhatsApp.
              </div>
            </div>

            {/* summary */}
            <div style={{ border: "2px solid #0A0A0A", marginBottom: 40 }}>
              <div style={{ background: "#0A0A0A", padding: "12px 20px" }}>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#555" }}>RESUMO DA CONFIGURAÇÃO</span>
              </div>
              {[
                ["NEGÓCIO",    businessName || "—"],
                ["TIPO",       businessType || "—"],
                ["WHATSAPP",   phone || "—"],
                ["DIAS",       activeDays.join(", ")],
                ["HORÁRIO",    `${openTime} às ${closeTime}`],
                ["SERVIÇOS",   `${services.length} cadastrado${services.length !== 1 ? "s" : ""}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 20px", borderBottom: "1px solid #eee" }}>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>{k}</span>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 17, fontWeight: 900 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={{
                width: "100%", padding: "18px",
                background: "#1B4FD8", color: "#fff", border: "none", cursor: "pointer",
                fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 900,
                letterSpacing: "0.22em", textTransform: "uppercase",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#0A0A0A"; e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "2px 2px 0 #1B4FD8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#1B4FD8"; e.currentTarget.style.transform = "translate(0,0)"; e.currentTarget.style.boxShadow = "none"; }}
                onClick={() => router.push("/dashboard")}
              >IR PARA O DASHBOARD →</button>

              <button style={{
                width: "100%", padding: "18px",
                background: "transparent", color: "#0A0A0A",
                border: "2px solid #0A0A0A", cursor: "pointer",
                fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 900,
                letterSpacing: "0.22em", textTransform: "uppercase",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(10,10,10,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => router.push(`/agendar/${businessSlug || slug || "seu-negocio"}`)}
              >VER MINHA PÁGINA PÚBLICA</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}