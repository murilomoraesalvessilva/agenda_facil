"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function generateSlots(openTime: string, closeTime: string, slotDuration: number) {
  const slots = [];
  const [openH, openM]   = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  let current = openH * 60 + openM;
  const end   = closeH * 60 + closeM;
  while (current + slotDuration <= end) {
    const h = String(Math.floor(current / 60)).padStart(2, "0");
    const m = String(current % 60).padStart(2, "0");
    slots.push(h + ":" + m);
    current += slotDuration;
  }
  return slots;
}

function generateDays(schedules: any[]) {
  const DAY_LABELS = ["DOM","SEG","TER","QUA","QUI","SEX","SAB"];
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14 && days.length < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dow = date.getDay();
    const schedule = schedules.find(s => s.dayOfWeek === dow);
    if (!schedule) continue;
    const slots   = generateSlots(schedule.openTime, schedule.closeTime, schedule.slotDuration);
    const dateStr = date.toISOString().split("T")[0];
    const label   = DAY_LABELS[dow];
    const display = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    days.push({ label, date: display, dateStr, slots, dow });
  }
  return days;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function SlugPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDay,     setSelectedDay]     = useState(0);
  const [selectedSlot,    setSelectedSlot]    = useState<string | null>(null);
  const [step,            setStep]            = useState(1);
  const [form,            setForm]            = useState({ name: "", phone: "" });
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [loading,         setLoading]         = useState(false);
  const [data,            setData]            = useState<any>(null);
  const [dataLoading,     setDataLoading]     = useState<boolean>(true);
  const [dataError,       setDataError]       = useState<string | null>(null);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };
  const router = useRouter();
  const params = useParams();
  const slug   = params?.slug;

  useEffect(() => {
    if (!slug) return;
    fetch("/api/booking/" + slug)
      .then(r => r.json())
      .then(d => { setData(d); setDataLoading(false); })
      .catch(() => { setDataError("Erro ao carregar."); setDataLoading(false); });
  }, [slug]);

  const business    = data?.business  || {};
  const services    = data?.services  || [];
  const schedules   = data?.schedules || [];
  const bookedSlots = data?.bookedSlots || [];
  const DAYS        = generateDays(schedules);

  const service = services.find(s => s.id === selectedService);
  const day     = DAYS[selectedDay] || { label: "", date: "", dateStr: "", slots: [] };

  const availableSlots = (day.slots || []).filter(slot => {
    const key = day.dateStr + " " + slot;
    return !bookedSlots.includes(key);
  });

  const canNext = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedSlot;
    return true;
  };

  const advance = async () => {
    if (step === 3) {
      const e: Record<string, string> = {};
      if (!form.name)  e.name  = "Campo obrigatório";
      if (!form.phone) e.phone = "Campo obrigatório";
      if (Object.keys(e).length) { setErrors(e); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/booking/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId:  business.id,
            serviceId:   selectedService,
            clientName:  form.name,
            clientPhone: form.phone,
            date:        day.dateStr,
            time:        selectedSlot,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          setErrors({ phone: result.error || "Erro ao agendar." });
          setLoading(false);
          return;
        }
        setStep(4);
      } catch {
        setErrors({ phone: "Erro de conexão. Tente novamente." });
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep(s => s + 1);
  };

  const back = () => { setStep(s => s - 1); setErrors({}); };
  const reset = () => { setStep(1); setSelectedService(null); setSelectedDay(0); setSelectedSlot(null); setForm({ name: "", phone: "" }); };

  const inp = (err: string | undefined) => ({
    width: "100%", padding: "14px 16px",
    fontFamily: "'Barlow', sans-serif", fontSize: 15,
    background: "#F5F2ED",
    border: `2px solid ${err ? "#FF6B6B" : "#0A0A0A"}`,
    outline: "none", color: "#0A0A0A",
  });

  const lbl: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", display: "block", marginBottom: 8 };
  const errMsg = (k: string) => errors[k] ? <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#FF6B6B", marginTop: 4, display: "block" }}>{errors[k]}</span> : null;

  if (dataLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Barlow Condensed'", fontSize: 24, fontWeight: 900, letterSpacing: "0.2em", background: "#F5F2ED" }}>
      CARREGANDO...
    </div>
  );

  if (dataError || data?.error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Barlow Condensed'", fontSize: 24, fontWeight: 900, letterSpacing: "0.2em", background: "#F5F2ED", color: "#FF6B6B" }}>
      NEGÓCIO NÃO ENCONTRADO.
    </div>
  );

  return (
    <div style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", background: "#F5F2ED", color: "#0A0A0A", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,400;0,700;0,900;1,700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #1B4FD8; color: #fff; }
        input:focus { border-color: #1B4FD8 !important; outline: none; }

        .service-row {
          display: grid; grid-template-columns: 1fr auto;
          align-items: center; gap: 24px;
          padding: 24px 28px;
          border-bottom: 2px solid #0A0A0A;
          cursor: pointer; transition: background 0.12s;
          border-left: 4px solid transparent;
        }
        .service-row:hover   { background: rgba(27,79,216,0.04); border-left-color: #1B4FD8; }
        .service-row.picked  { background: #0A0A0A; border-left-color: #FF6B6B; }

        .day-btn {
          flex: 1; padding: 14px 8px; text-align: center;
          border: 2px solid #0A0A0A; cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700; transition: all 0.12s;
          background: transparent; color: #0A0A0A;
        }
        .day-btn:hover  { background: rgba(27,79,216,0.06); }
        .day-btn.active { background: #0A0A0A; color: #F5F2ED; }

        .slot-btn {
          padding: 12px 8px; text-align: center;
          border: 2px solid #0A0A0A; cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px; font-weight: 900; letter-spacing: 0.04em;
          background: transparent; color: #0A0A0A;
          transition: all 0.12s;
        }
        .slot-btn:hover:not(.booked):not(.chosen) { background: rgba(27,79,216,0.08); border-color: #1B4FD8; }
        .slot-btn.chosen { background: #1B4FD8; color: #fff; border-color: #1B4FD8; }
        .slot-btn.booked { background: #eee; color: #bbb; border-color: #ddd; cursor: not-allowed; text-decoration: line-through; }

        .confirm-btn {
          width: 100%; padding: 18px;
          background: #0A0A0A; color: #F5F2ED; border: none; cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 900;
          letter-spacing: 0.22em; text-transform: uppercase;
          transition: all 0.15s;
        }
        .confirm-btn:hover:not(:disabled) { background: #1B4FD8; transform: translate(-2px,-2px); box-shadow: 2px 2px 0 #0A0A0A; }
        .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .back-btn {
          padding: 18px 24px; background: transparent;
          border: 2px solid #0A0A0A; cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 900;
          letter-spacing: 0.2em; text-transform: uppercase;
          transition: all 0.15s;
        }
        .back-btn:hover { background: #F5F2ED; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.25s ease forwards; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 8px; }

        @keyframes checkPop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .check-pop { animation: checkPop 0.5s cubic-bezier(.36,.07,.19,.97) 0.2s both; }

        @media (max-width: 860px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .sticky-col { position: static !important; }
        }
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={{ background: "#0A0A0A", borderBottom: "2px solid #222", padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, cursor: "pointer" }} onClick={() => router.push("/")}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 900, color: "#F5F2ED", textTransform: "uppercase" }}>AGENDAÍ</span>
          <span style={{ width: 6, height: 6, background: "#FF6B6B", display: "inline-block", marginBottom: 2 }} />
        </div>
        <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#444", letterSpacing: "0.06em" }}>
          agendai.com.br/{business.slug}
        </span>
      </div>

      {/* ── BUSINESS HEADER ── */}
      <div style={{ background: "#fff", borderBottom: "2px solid #0A0A0A", padding: "40px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 80px 80px 0", borderColor: "transparent #FF6B6B transparent transparent" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#888", textTransform: "uppercase" }}>{business.type} — {business.address || "Parnaíba, PI"}</span>
              <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 56, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.01em", textTransform: "uppercase", marginTop: 8, marginBottom: 16 }}>
                {business.name?.toUpperCase()}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900, color: "#1B4FD8" }}>{4.9}</span>
                  <div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ width: 10, height: 10, background: i <= Math.floor(4.9) ? "#1B4FD8" : "#ddd" }} />
                      ))}
                    </div>
                    <div style={{ fontFamily: "'Barlow'", fontSize: 11, color: "#888", marginTop: 2 }}>{127} avaliações</div>
                  </div>
                </div>
                <div style={{ height: 32, width: 2, background: "#eee" }} />
                <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#666" }}>{schedules.length ? schedules.map(s => ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][s.dayOfWeek]).join(", ") + ": " + (schedules[0]?.openTime || "08:00") + " às " + (schedules[0]?.closeTime || "18:00") : "Ver horários"}</div>
                <div style={{ height: 32, width: 2, background: "#eee" }} />
                <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#666" }}>{business.phone}</div>
              </div>
            </div>
            <div style={{ background: "#F5F2ED", border: "2px solid #0A0A0A", padding: "12px 20px", maxWidth: 280 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", marginBottom: 4 }}>SOBRE</div>
              <p style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#555", lineHeight: 1.6 }}>{business.about}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      {step < 4 && (
        <div style={{ background: "#fff", borderBottom: "2px solid #0A0A0A", padding: "0 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex" }}>
            {[["01", "SERVIÇO"], ["02", "HORÁRIO"], ["03", "SEUS DADOS"]].map(([n, lbl], i) => {
              const s = i + 1;
              const active = step === s;
              const done   = step > s;
              return (
                <div key={n} style={{
                  flex: 1, padding: "16px 0", textAlign: "center",
                  borderBottom: `3px solid ${active ? "#1B4FD8" : done ? "#FF6B6B" : "transparent"}`,
                  borderRight: i < 2 ? "1px solid #eee" : "none",
                }}>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: active ? "#1B4FD8" : done ? "#FF6B6B" : "#bbb" }}>
                    {done ? "✓ " : `${n} — `}{lbl}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 48px" }}>
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>

          {/* LEFT — steps */}
          <div>

            {/* ──── STEP 1: SERVIÇO ──── */}
            {step === 1 && (
              <div className="fu">
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>PASSO 01</div>
                <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 48, fontWeight: 900, letterSpacing: "-0.01em", textTransform: "uppercase", marginBottom: 32 }}>
                  QUAL SERVIÇO<span style={{ color: "#FF6B6B" }}>?</span>
                </h2>

                <div style={{ border: "2px solid #0A0A0A" }}>
                  {/* table header */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "10px 28px", gap: 24, background: "#0A0A0A" }}>
                    {["SERVIÇO / DURAÇÃO", "VALOR"].map(h => (
                      <div key={h} style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", color: "#888" }}>{h}</div>
                    ))}
                  </div>
                  {(services || []).map(s => {
                    const picked = selectedService === s.id;
                    return (
                      <div key={s.id} className={`service-row ${picked ? "picked" : ""}`} onClick={() => setSelectedService(s.id)}>
                        <div>
                          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, textTransform: "uppercase", color: picked ? "#F5F2ED" : "#0A0A0A", letterSpacing: "0.02em" }}>{s.name}</div>
                          <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: picked ? "#888" : "#666", marginTop: 4 }}>{s.desc} · {s.duration} min</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 32, fontWeight: 900, color: picked ? "#FF6B6B" : "#1B4FD8", letterSpacing: "-0.02em" }}>
                            R${s.price}
                          </div>
                          <div style={{
                            width: 24, height: 24, flexShrink: 0,
                            border: `2px solid ${picked ? "#FF6B6B" : "#555"}`,
                            background: picked ? "#FF6B6B" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {picked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ──── STEP 2: HORÁRIO ──── */}
            {step === 2 && (
              <div className="fu">
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>PASSO 02</div>
                <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 48, fontWeight: 900, letterSpacing: "-0.01em", textTransform: "uppercase", marginBottom: 32 }}>
                  QUANDO<span style={{ color: "#FF6B6B" }}>?</span>
                </h2>

                {/* Day selector */}
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>ESCOLHA O DIA</div>
                <div style={{ display: "flex", gap: 0, marginBottom: 32, border: "2px solid #0A0A0A" }}>
                  {DAYS.map((d, i) => (
                    <button key={i} className={`day-btn ${selectedDay === i ? "active" : ""}`}
                      onClick={() => { setSelectedDay(i); setSelectedSlot(null); }}
                      style={{ borderRight: i < DAYS.length - 1 ? "1px solid #ccc" : "none" }}
                    >
                      <div style={{ fontSize: 11, letterSpacing: "0.15em", opacity: 0.6 }}>{d.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{d.date.split("/")[0]}</div>
                    </button>
                  ))}
                </div>

                {/* Slots */}
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>
                  HORÁRIOS DISPONÍVEIS — {day.label}, {day.date}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {availableSlots.map(slot => {
                    const booked = false;
                    const chosen = selectedSlot === slot;
                    return (
                      <button key={slot} className={`slot-btn ${chosen ? "chosen" : ""} ${booked ? "booked" : ""}`}
                        onClick={() => !booked && setSelectedSlot(slot)}
                      >{slot}</button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 14, height: 14, background: "#1B4FD8" }} />
                    <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#666" }}>Selecionado</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 14, height: 14, background: "#eee", border: "1px solid #ddd" }} />
                    <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#666" }}>Ocupado</span>
                  </div>
                </div>
              </div>
            )}

            {/* ──── STEP 3: DADOS ──── */}
            {step === 3 && (
              <div className="fu">
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>PASSO 03</div>
                <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 48, fontWeight: 900, letterSpacing: "-0.01em", textTransform: "uppercase", marginBottom: 32 }}>
                  SEUS DADOS<span style={{ color: "#FF6B6B" }}>.</span>
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div>
                    <span style={lbl}>SEU NOME</span>
                    <input type="text" placeholder="Como você quer ser chamado?" value={form.name} onChange={e => set("name", e.target.value)} style={inp(errors.name)} />
                    {errMsg("name")}
                  </div>
                  <div>
                    <span style={lbl}>WHATSAPP</span>
                    <input type="tel" placeholder="(86) 9 9999-9999" value={form.phone} onChange={e => set("phone", e.target.value)} style={inp(errors.phone)} />
                    {errMsg("phone")}
                    <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#888", marginTop: 6, display: "block" }}>
                      Você receberá a confirmação e o lembrete por aqui.
                    </span>
                  </div>

                  {/* resumo inline */}
                  <div style={{ background: "#F0EDFF", border: "2px solid #1B4FD8", padding: "20px 24px" }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1B4FD8", marginBottom: 12 }}>RESUMO DO AGENDAMENTO</div>
                    {[
                      ["NEGÓCIO",  business.name],
                      ["SERVIÇO",  service?.name],
                      ["DIA",      `${day.label}, ${day.date}`],
                      ["HORÁRIO",  selectedSlot],
                      ["DURAÇÃO",  `${service?.duration} min`],
                      ["VALOR",    `R$${service?.price}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid rgba(27,79,216,0.12)" }}>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888" }}>{k}</span>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 900, color: "#0A0A0A" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ──── STEP 4: CONFIRMADO ──── */}
            {step === 4 && (
              <div className="fu" style={{ textAlign: "left" }}>
                <div className="check-pop" style={{
                  width: 80, height: 80,
                  background: "#0A0A0A",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 32,
                }}>
                  <span style={{ fontSize: 36, color: "#4CAF50", fontWeight: 900 }}>✓</span>
                </div>

                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#4CAF50", marginBottom: 12 }}>AGENDAMENTO CONFIRMADO</div>
                <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 64, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase", marginBottom: 24 }}>
                  ATÉ<br />LOGO<span style={{ color: "#FF6B6B" }}>!</span>
                </h2>
                <p style={{ fontFamily: "'Barlow'", fontSize: 15, color: "#555", lineHeight: 1.7, maxWidth: 420, marginBottom: 40 }}>
                  Seu agendamento foi confirmado. Você receberá uma mensagem no WhatsApp com os detalhes e um lembrete no dia anterior.
                </p>

                {/* confirmation card */}
                <div style={{ border: "2px solid #0A0A0A", padding: "28px 32px", maxWidth: 420, marginBottom: 40 }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 16 }}>DETALHES</div>
                  {[
                    ["NEGÓCIO",  business.name],
                    ["CLIENTE",  form.name || "—"],
                    ["SERVIÇO",  service?.name],
                    ["DATA",     `${day.label}, ${day.date}`],
                    ["HORÁRIO",  selectedSlot],
                    ["VALOR",    `R$${service?.price}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #eee" }}>
                      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>{k}</span>
                      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 900 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={reset} style={{
                    background: "#0A0A0A", color: "#F5F2ED", border: "none", cursor: "pointer",
                    fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 900,
                    letterSpacing: "0.18em", textTransform: "uppercase", padding: "14px 28px",
                    transition: "all 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1B4FD8"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0A0A0A"}
                  >FAZER OUTRO AGENDAMENTO</button>
                </div>
              </div>
            )}

            {/* ── NAV BUTTONS ── */}
            {step < 4 && (
              <div style={{ display: "flex", gap: 8, marginTop: 40 }}>
                {step > 1 && <button className="back-btn" onClick={back}>← VOLTAR</button>}
                <button className="confirm-btn" onClick={advance} disabled={!canNext() || loading} style={{ flex: 1 }}>
                  {loading
                    ? <><span className="spinner" />CONFIRMANDO...</>
                    : step === 3 ? "CONFIRMAR AGENDAMENTO →"
                    : step === 2 ? "ESCOLHER MEUS DADOS →"
                    : "ESCOLHER HORÁRIO →"
                  }
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — sticky summary */}
          <div className="sticky-col" style={{ position: "sticky", top: 24 }}>
            <div style={{ border: "2px solid #0A0A0A", background: "#fff" }}>
              <div style={{ background: "#0A0A0A", padding: "16px 24px" }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#555" }}>RESUMO</div>
              </div>
              <div style={{ padding: "24px" }}>
                {selectedService ? (
                  <>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 900, textTransform: "uppercase", marginBottom: 4 }}>{service?.name}</div>
                    <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#888", marginBottom: 20 }}>{service?.duration} minutos</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 44, fontWeight: 900, color: "#1B4FD8", letterSpacing: "-0.02em", lineHeight: 1 }}>R${service?.price}</div>
                  </>
                ) : (
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nenhum serviço<br />selecionado</div>
                )}

                {selectedSlot && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #eee" }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>HORÁRIO</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900 }}>{selectedSlot}</div>
                    <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#888", marginTop: 2 }}>{day.label}, {day.date}</div>
                  </div>
                )}

                {!selectedService && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #eee" }}>
                    <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>
                      Selecione um serviço para ver o resumo do seu agendamento aqui.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* business quick info */}
            <div style={{ border: "2px solid #0A0A0A", borderTop: "none", padding: "20px 24px", background: "#F5F2ED" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>ESTABELECIMENTO</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 900, textTransform: "uppercase", marginBottom: 4 }}>{business.name}</div>
              <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#666", marginBottom: 8 }}>{business.address || "Parnaíba, PI"}</div>
              <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#666" }}>{schedules.length ? schedules.map(s => ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][s.dayOfWeek]).join(", ") + ": " + (schedules[0]?.openTime || "08:00") + " às " + (schedules[0]?.closeTime || "18:00") : "Ver horários"}</div>
              <a href={`https://wa.me/55${(business.phone || "").replace(/\D/g, "")}`} style={{
                display: "block", marginTop: 16,
                background: "#25D366", color: "#fff", border: "none", cursor: "pointer",
                fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 900,
                letterSpacing: "0.18em", textTransform: "uppercase",
                padding: "10px 0", textAlign: "center", textDecoration: "none",
                transition: "opacity 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >CHAMAR NO WHATSAPP</a>
            </div>
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "2px solid #0A0A0A", padding: "20px 48px", background: "#0A0A0A", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 80 }}>
        <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#444" }}>Agendamento por <span style={{ color: "#F5F2ED", fontWeight: 700 }}>Agendaí</span> · Parnaíba, PI</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444" }}>AGENDAI.COM.BR</div>
      </div>
    </div>
  );
}