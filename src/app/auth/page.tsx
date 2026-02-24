"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [step, setStep]         = useState(1);        // cadastro multi-step: 1 | 2
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const router = useRouter();

  // form state
  const [form, setForm] = useState({
    email: "", password: "", name: "",
    businessName: "", businessType: "", phone: "",
  });

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const businessTypes = [
    "BARBEARIA", "SALÃO DE BELEZA", "CLÍNICA", "PSICOLOGIA",
    "PERSONAL TRAINER", "TATUAGEM", "SPA / ESTÉTICA", "OUTRO",
  ];

  const validateLogin = () => {
    const e = {};
    if (!form.email)    e.email    = "Campo obrigatório";
    if (!form.password) e.password = "Campo obrigatório";
    return e;
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name)  e.name  = "Campo obrigatório";
    if (!form.email) e.email = "Campo obrigatório";
    if (!form.phone) e.phone = "Campo obrigatório";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.businessName) e.businessName = "Campo obrigatório";
    if (!form.businessType) e.businessType = "Selecione um tipo";
    return e;
  };

  const handleSubmit = () => {
    let errs = {};
    if (mode === "login")              errs = validateLogin();
    if (mode === "register" && step === 1) errs = validateStep1();
    if (mode === "register" && step === 2) errs = validateStep2();

    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (mode === "register" && step === 1) { setStep(2); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "login") router.push("/dashboard");
      else router.push("/onboarding");
    }, 1800);
  };

  const switchMode = (m) => { setMode(m); setStep(1); setErrors({}); };

  // ─── shared input style ───
  const inp = (hasError) => ({
    width: "100%",
    padding: "14px 16px",
    fontFamily: "'Barlow', sans-serif",
    fontSize: 15,
    background: "#F5F2ED",
    border: `2px solid ${hasError ? "#FF6B6B" : "#0A0A0A"}`,
    outline: "none",
    color: "#0A0A0A",
    transition: "border-color 0.15s",
  });

  const label = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11, fontWeight: 700,
    letterSpacing: "0.25em", textTransform: "uppercase",
    color: "#888", display: "block", marginBottom: 8,
  };

  const errMsg = (k) => errors[k] ? (
    <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#FF6B6B", marginTop: 4, display: "block" }}>
      {errors[k]}
    </span>
  ) : null;

  return (
    <div style={{
      fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "#F5F2ED",
      color: "#0A0A0A",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,700;0,900;1,700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #1B4FD8; color: #fff; }

        input:focus { border-color: #1B4FD8 !important; }
        select:focus { border-color: #1B4FD8 !important; outline: none; }

        .submit-btn {
          width: 100%;
          background: #0A0A0A; color: #F5F2ED;
          border: none; cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px; font-weight: 900;
          letter-spacing: 0.22em; text-transform: uppercase;
          padding: 18px;
          transition: all 0.15s;
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) { background: #1B4FD8; transform: translate(-2px, -2px); box-shadow: 2px 2px 0 #0A0A0A; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .mode-tab {
          flex: 1; padding: 14px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 900;
          letter-spacing: 0.2em; text-transform: uppercase;
          border: none; cursor: pointer;
          transition: all 0.15s;
        }

        .type-btn {
          padding: 10px 14px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          border: 2px solid #0A0A0A;
          background: transparent; color: #0A0A0A;
          cursor: pointer; transition: all 0.15s;
        }
        .type-btn:hover  { background: #0A0A0A; color: #F5F2ED; }
        .type-btn.chosen { background: #1B4FD8; color: #fff; border-color: #1B4FD8; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .fade-in { animation: fadeIn 0.25s ease forwards; }

        @media (max-width: 860px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .left-panel { display: none !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          LEFT — BRAND PANEL
      ══════════════════════════════════════════ */}
      <div className="left-panel" style={{
        background: "#0A0A0A",
        padding: "60px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        borderRight: "2px solid #222",
      }}>
        {/* grid texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        {/* corner accent */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 100px 100px 0", borderColor: "transparent #FF6B6B transparent transparent" }} />

        {/* Logo */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 48 }}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900, color: "#F5F2ED", letterSpacing: "-0.01em", textTransform: "uppercase" }}>AGENDAÍ</span>
            <span style={{ width: 8, height: 8, background: "#FF6B6B", display: "inline-block", marginBottom: 2 }} />
          </div>

          <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 64, fontWeight: 900, color: "#F5F2ED", lineHeight: 0.92, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
            {mode === "login" ? (
              <>BEM-<br />VINDO<br /><span style={{ color: "#1B4FD8" }}>DE</span><br /><span style={{ color: "#FF6B6B" }}>VOLTA.</span></>
            ) : (
              <>CRIE<br />SUA<br /><span style={{ color: "#1B4FD8" }}>CONTA</span><br /><span style={{ color: "#FF6B6B" }}>GRÁTIS.</span></>
            )}
          </h2>

          <p style={{ fontFamily: "'Barlow'", fontSize: 14, color: "#555", marginTop: 32, lineHeight: 1.7, maxWidth: 340 }}>
            {mode === "login"
              ? "Acesse seu painel, veja os agendamentos do dia e gerencie seu negócio de qualquer lugar."
              : "14 dias grátis. Sem cartão de crédito. Configure tudo em menos de 5 minutos e comece a receber agendamentos hoje."}
          </p>
        </div>

        {/* Stats */}
        <div style={{ position: "relative", borderTop: "1px solid #222", paddingTop: 40 }}>
          {[["150+", "negócios cadastrados"], ["98%", "de satisfação"], ["< 5min", "para começar"]].map(([n, l]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900, color: "#F5F2ED" }}>{n}</span>
              <span style={{ fontFamily: "'Barlow'", fontSize: 12, color: "#444", letterSpacing: "0.04em" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — FORM PANEL
      ══════════════════════════════════════════ */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 72px",
        overflowY: "auto",
      }}>

        {/* mode tabs */}
        <div style={{ display: "flex", border: "2px solid #0A0A0A", marginBottom: 48 }}>
          {[["login", "ENTRAR"], ["register", "CADASTRAR"]].map(([m, lbl]) => (
            <button key={m} className="mode-tab"
              onClick={() => switchMode(m)}
              style={{
                background: mode === m ? "#0A0A0A" : "transparent",
                color: mode === m ? "#F5F2ED" : "#888",
                borderRight: m === "login" ? "2px solid #0A0A0A" : "none",
              }}
            >{lbl}</button>
          ))}
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === "login" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 32, fontWeight: 900, letterSpacing: "0.02em", marginBottom: 4 }}>ACESSE SUA CONTA</div>
              <div style={{ fontFamily: "'Barlow'", fontSize: 14, color: "#888" }}>Parnaíba, PI — Plataforma de Agendamentos</div>
            </div>

            <div>
              <span style={label}>E-MAIL</span>
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                style={inp(errors.email)}
              />
              {errMsg("email")}
            </div>

            <div>
              <span style={label}>SENHA</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  style={{ ...inp(errors.password), paddingRight: 52 }}
                />
                <button onClick={() => setShowPass(v => !v)} style={{
                  position: "absolute", right: 0, top: 0, bottom: 0,
                  width: 48, background: "none", border: "none",
                  borderLeft: "2px solid #0A0A0A",
                  cursor: "pointer", color: "#888", fontSize: 13,
                  fontFamily: "'Barlow Condensed'", fontWeight: 700,
                  letterSpacing: "0.05em",
                }}>
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>
              {errMsg("password")}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={{ background: "none", border: "none", fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#1B4FD8", cursor: "pointer", textDecoration: "underline" }}>
                ESQUECI MINHA SENHA
              </button>
            </div>

            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <><span className="spinner" />ENTRANDO...</> : "ENTRAR →"}
            </button>

            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#888" }}>Não tem conta? </span>
              <button onClick={() => switchMode("register")} style={{ background: "none", border: "none", fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF6B6B", cursor: "pointer" }}>
                CADASTRE-SE GRÁTIS
              </button>
            </div>
          </div>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === "register" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* step indicator */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
                {[1, 2].map((s, i) => (
                  <React.Fragment key={s}>
                    <div style={{
                      width: 32, height: 32,
                      background: step >= s ? "#0A0A0A" : "transparent",
                      border: "2px solid #0A0A0A",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 900,
                      color: step >= s ? "#F5F2ED" : "#0A0A0A",
                    }}>{s}</div>
                    {i === 0 && <div style={{ flex: 1, height: 2, background: step === 2 ? "#0A0A0A" : "#ccc", maxWidth: 40 }} />}
                  </React.Fragment>
                ))}
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", marginLeft: 16 }}>
                  PASSO {step} DE 2
                </span>
              </div>

              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 32, fontWeight: 900, letterSpacing: "0.02em", marginBottom: 4 }}>
                {step === 1 ? "SEUS DADOS" : "SEU NEGÓCIO"}
              </div>
              <div style={{ fontFamily: "'Barlow'", fontSize: 14, color: "#888" }}>
                {step === 1 ? "Informações da sua conta." : "Como seu negócio vai aparecer para os clientes."}
              </div>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <span style={label}>NOME COMPLETO</span>
                  <input type="text" placeholder="João da Silva" value={form.name} onChange={e => set("name", e.target.value)} style={inp(errors.name)} />
                  {errMsg("name")}
                </div>

                <div>
                  <span style={label}>E-MAIL</span>
                  <input type="email" placeholder="seu@email.com" value={form.email} onChange={e => set("email", e.target.value)} style={inp(errors.email)} />
                  {errMsg("email")}
                </div>

                <div>
                  <span style={label}>WHATSAPP / TELEFONE</span>
                  <input type="tel" placeholder="(86) 9 9999-9999" value={form.phone} onChange={e => set("phone", e.target.value)} style={inp(errors.phone)} />
                  {errMsg("phone")}
                </div>

                <div>
                  <span style={label}>SENHA</span>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={e => set("password", e.target.value)}
                      style={{ ...inp(errors.password), paddingRight: 52 }}
                    />
                    <button onClick={() => setShowPass(v => !v)} style={{
                      position: "absolute", right: 0, top: 0, bottom: 0, width: 48,
                      background: "none", border: "none", borderLeft: "2px solid #0A0A0A",
                      cursor: "pointer", color: "#888", fontSize: 13,
                      fontFamily: "'Barlow Condensed'", fontWeight: 700, letterSpacing: "0.05em",
                    }}>
                      {showPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {errMsg("password")}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <span style={label}>NOME DO NEGÓCIO</span>
                  <input type="text" placeholder="Ex: Barbearia do João" value={form.businessName} onChange={e => set("businessName", e.target.value)} style={inp(errors.businessName)} />
                  {errMsg("businessName")}
                  {form.businessName && (
                    <div style={{ marginTop: 8, fontFamily: "'Barlow'", fontSize: 12, color: "#888" }}>
                      Sua URL: <span style={{ color: "#1B4FD8", fontWeight: 500 }}>
                        agendai.com.br/{form.businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <span style={label}>TIPO DE NEGÓCIO</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {businessTypes.map(t => (
                      <button key={t} className={`type-btn ${form.businessType === t ? "chosen" : ""}`}
                        onClick={() => set("businessType", t)}
                      >{t}</button>
                    ))}
                  </div>
                  {errMsg("businessType")}
                </div>

                <div style={{ background: "#F0EDFF", border: "2px solid #1B4FD8", padding: "16px 20px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#1B4FD8", marginBottom: 6 }}>14 DIAS GRATIS</div>
                  <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#444", lineHeight: 1.6 }}>
                    Sem cartão de crédito. Você configura seus serviços, horários e começa a receber agendamentos hoje mesmo.
                  </div>
                </div>
              </div>
            )}

            {/* actions */}
            <div style={{ display: "flex", gap: 8 }}>
              {step === 2 && (
                <button onClick={() => setStep(1)} style={{
                  padding: "18px 24px", background: "transparent",
                  border: "2px solid #0A0A0A", cursor: "pointer",
                  fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 900,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F5F2ED"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >← VOLTAR</button>
              )}
              <button className="submit-btn" onClick={handleSubmit} disabled={loading} style={{ flex: 1 }}>
                {loading
                  ? <><span className="spinner" />CRIANDO CONTA...</>
                  : step === 1 ? "PRÓXIMO PASSO →" : "CRIAR CONTA GRÁTIS →"
                }
              </button>
            </div>

            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#888" }}>Já tem conta? </span>
              <button onClick={() => switchMode("login")} style={{ background: "none", border: "none", fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF6B6B", cursor: "pointer" }}>
                ENTRAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}