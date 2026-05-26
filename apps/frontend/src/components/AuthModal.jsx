import React, { useState, useRef } from "react";
import { BUILD_NUMBER } from "../buildinfo";

const API_URL = import.meta.env.VITE_API_URL + "/auth";

const T = {
  nl: {
    login: "Inloggen",
    register: "Registreren",
    verifyEmail: "E-mail bevestigen",
    email: "E-mailadres",
    password: "Wachtwoord",
    name: "Naam",
    pincode: "Pincode (2FA)",
    submit: "Versturen",
    close: "Sluiten",
    forgotPassword: "Wachtwoord vergeten?",
    backToLogin: "Terug naar inloggen",
    sendReset: "Verstuur reset-link",
    verifyTitle: "Voer de verificatiecode in",
    verifySubtitle: (email) => `We hebben een 6-cijferige code gestuurd naar ${email}. Geldig voor 30 minuten.`,
    verifyPlaceholder: "6-cijferige code",
    verifyBtn: "Bevestigen",
    verifySuccess: "✅ E-mail geverifieerd! Je kunt nu inloggen.",
    resendCode: "Stuur nieuwe code",
    noCodeYet: "Geen code ontvangen?",
  },
  en: {
    login: "Login",
    register: "Register",
    verifyEmail: "Verify email",
    email: "Email",
    password: "Password",
    name: "Name",
    pincode: "Pincode (2FA)",
    submit: "Submit",
    close: "Close",
    forgotPassword: "Forgot password?",
    backToLogin: "Back to login",
    sendReset: "Send reset link",
    verifyTitle: "Enter your verification code",
    verifySubtitle: (email) => `We sent a 6-digit code to ${email}. Valid for 30 minutes.`,
    verifyPlaceholder: "6-digit code",
    verifyBtn: "Confirm",
    verifySuccess: "✅ Email verified! You can now log in.",
    resendCode: "Send new code",
    noCodeYet: "Didn't receive a code?",
  },
  es: {
    login: "Iniciar sesión",
    register: "Registrarse",
    verifyEmail: "Verificar correo",
    email: "Correo electrónico",
    password: "Contraseña",
    name: "Nombre",
    pincode: "Pin (2FA)",
    submit: "Enviar",
    close: "Cerrar",
    forgotPassword: "¿Olvidaste tu contraseña?",
    backToLogin: "Volver al inicio de sesión",
    sendReset: "Enviar enlace de restablecimiento",
    verifyTitle: "Introduce el código de verificación",
    verifySubtitle: (email) => `Enviamos un código de 6 dígitos a ${email}. Válido por 30 minutos.`,
    verifyPlaceholder: "Código de 6 dígitos",
    verifyBtn: "Confirmar",
    verifySuccess: "✅ ¡Correo verificado! Ya puedes iniciar sesión.",
    resendCode: "Enviar nuevo código",
    noCodeYet: "¿No recibiste el código?",
  }
};

export default function AuthModal({ open, onClose, type, onSubmit, language }) {
  const [phase, setPhase] = useState(type);
  const [form, setForm] = useState({ email: "", password: "", name: "", pincode: "" });
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [info, setInfo] = useState("");
  const [infoType, setInfoType] = useState("warn"); // "warn" | "ok" | "err"
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const codeRefs = useRef([]);

  React.useEffect(() => { setPhase(type); setInfo(""); setLoading(false); }, [type, open]);

  if (!open) return null;

  const l = T[language] || T.nl;
  const isLogin = phase === "login";
  const isRegister = phase === "register";
  const isVerifyEmail = phase === "verifyEmail";
  const isVerify2fa = phase === "verify2fa";
  const isLogin2fa = phase === "login2fa";
  const isForgot = phase === "forgot";

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  function handleCodeInput(idx, val) {
    const cleaned = val.replace(/\D/, "").slice(-1);
    const next = [...code];
    next[idx] = cleaned;
    setCode(next);
    if (cleaned && idx < 5) codeRefs.current[idx + 1]?.focus();
  }

  function handleCodeKey(idx, e) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) codeRefs.current[idx - 1]?.focus();
  }

  function handleCodePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      codeRefs.current[5]?.focus();
    }
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setInfo(""); setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch(`${API_URL}/register`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
        });
        const data = await res.json();
        if (res.ok) {
          setRegisteredEmail(form.email);
          setCode(["", "", "", "", "", ""]);
          setPhase("verifyEmail");
          if (!data.emailSent && data.devCode) {
            setInfoType("warn");
            setInfo(`⚠️ Mail mislukt. Jouw code is: ${data.devCode}`);
          } else if (!data.emailSent) {
            setInfoType("warn");
            setInfo("⚠️ E-mail kon niet worden verstuurd. Vraag de admin om je verificatiecode.");
          } else {
            setInfoType("ok");
            setInfo(data.message || "✅ Code verstuurd! Controleer je inbox.");
          }
        } else {
          setInfoType("err"); setInfo(data.error || "Registratie mislukt.");
        }

      } else if (isVerifyEmail) {
        const fullCode = code.join("");
        if (fullCode.length !== 6) { setInfoType("err"); setInfo("Vul alle 6 cijfers in."); setLoading(false); return; }
        const res = await fetch(`${API_URL}/verify-email-code`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: registeredEmail, code: fullCode })
        });
        const data = await res.json();
        if (res.ok) {
          setInfoType("ok"); setInfo(l.verifySuccess);
          setTimeout(() => { setPhase("login"); setInfo(""); }, 2000);
        } else {
          setInfoType("err"); setInfo(data.error || "Ongeldige code.");
        }

      } else if (isLogin) {
        const res = await fetch(`${API_URL}/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("lotto_token", data.token);
          setInfoType("ok"); setInfo("Succesvol ingelogd! Je wordt doorgestuurd...");
          setTimeout(() => {
            window.history.pushState({}, "", "/dashboard");
            window.dispatchEvent(new PopStateEvent("popstate"));
            onSubmit && onSubmit(form);
          }, 1000);
        } else {
          if (data.error === "E-mail nog niet geverifieerd.") {
            setInfoType("warn");
            setInfo("Je account is nog niet geactiveerd. Check je e-mail voor de verificatiecode.");
          } else if (data.require2fa) {
            setInfoType("warn");
            setInfo("Te veel mislukte pogingen. Er is een code naar je e-mail gestuurd.");
            setPhase("login2fa");
          } else {
            setInfoType("err"); setInfo(data.error || "Ongeldige combinatie. Probeer opnieuw.");
          }
        }

      } else if (isVerify2fa || isLogin2fa) {
        const endpoint = isVerify2fa ? "verify2fa" : "login2fa";
        const res = await fetch(`${API_URL}/${endpoint}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, pincode: form.pincode })
        });
        if (res.ok) { onSubmit(form); }
        else { const data = await res.json(); setInfoType("err"); setInfo(data.error || "Verificatie mislukt."); }
      }
    } catch (err) {
      setInfoType("err"); setInfo("Netwerkfout — probeer opnieuw. (" + (err?.message || "onbekend") + ")");
    } finally {
      setLoading(false);
    }
  }

  const infoCls = infoType === "ok"
    ? "text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
    : infoType === "err"
    ? "text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
    : "text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose}>×</button>

        <h2 className="text-2xl font-bold mb-1 text-green-800 text-center">
          {isLogin && l.login}
          {isRegister && l.register}
          {isVerifyEmail && l.verifyEmail}
          {(isVerify2fa || isLogin2fa) && l.pincode}
          {isForgot && (language === "es" ? "Restablecer contraseña" : language === "en" ? "Reset password" : "Wachtwoord vergeten")}
        </h2>

        {info && <div className={`text-sm mb-3 text-center ${infoCls}`}>{info}</div>}

        {/* ── Verificatie e-mail code ── */}
        {isVerifyEmail && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-600 text-center">{l.verifySubtitle(registeredEmail)}</p>
            <div className="flex gap-2 my-2" onPaste={handleCodePaste}>
              {code.map((digit, i) => (
                <input key={i}
                  ref={el => codeRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={e => handleCodeInput(i, e.target.value)}
                  onKeyDown={e => handleCodeKey(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                  style={{ borderColor: digit ? "#16a34a" : "#d1d5db" }}
                />
              ))}
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-60">
              {loading ? "⏳ ..." : l.verifyBtn}
            </button>
            <p className="text-xs text-gray-400">{l.noCodeYet}{" "}
              <span className="text-green-600 cursor-pointer underline"
                onClick={async () => {
                  const res = await fetch(`${API_URL}/register`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: form.name, email: registeredEmail, password: form.password })
                  });
                  if (res.ok) { setInfoType("ok"); setInfo("Nieuwe code verstuurd!"); }
                }}>
                {l.resendCode}
              </span>
            </p>
          </div>
        )}

        {/* ── Wachtwoord vergeten ── */}
        {isForgot && (
          <form onSubmit={async (e) => {
            e.preventDefault(); setInfo("");
            try {
              const res = await fetch(`${API_URL}/forgot-password`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email })
              });
              const data = await res.json();
              if (res.ok) { setInfoType("ok"); setInfo("Er is een e-mail verstuurd met instructies."); }
              else { setInfoType("err"); setInfo(data.error || data.message || "Kon geen reset-link sturen."); }
            } catch { setInfoType("err"); setInfo("Netwerkfout."); }
          }} className="flex flex-col gap-3">
            <input type="email" name="email" placeholder={l.email} value={form.email} onChange={handleChange}
              className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required/>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl">{l.sendReset}</button>
            <button type="button" className="text-xs text-gray-500 underline" onClick={() => setPhase("login")}>{l.backToLogin}</button>
          </form>
        )}

        {/* ── Login / Registratie / 2FA ── */}
        {!isVerifyEmail && !isForgot && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {isRegister && (
              <input type="text" name="name" placeholder={l.name} value={form.name} onChange={handleChange}
                className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required/>
            )}
            {(isRegister || isLogin) && (<>
              <input type="email" name="email" placeholder={l.email} value={form.email} onChange={handleChange}
                className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required/>
              <input type="password" name="password" placeholder={l.password} value={form.password} onChange={handleChange}
                className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required/>
              {isLogin && (
                <div className="text-xs text-gray-500 text-center -mt-1">
                  <span className="cursor-pointer underline decoration-dotted" onClick={() => setPhase("forgot")}>{l.forgotPassword}</span>
                </div>
              )}
            </>)}
            {(isVerify2fa || isLogin2fa) && (
              <input type="text" name="pincode" placeholder={l.pincode} value={form.pincode} onChange={handleChange}
                className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" required maxLength={6}/>
            )}
            <button type="submit" disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl mt-1 transition-all disabled:opacity-60">
              {loading ? "⏳ ..." : l.submit}
            </button>
          </form>
        )}

        <div className="text-[10px] text-gray-400 mt-5 text-center select-none">Build: {BUILD_NUMBER}</div>
      </div>
    </div>
  );
}
