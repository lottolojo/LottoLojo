import React, { useState } from "react";
import { BUILD_NUMBER } from "../buildinfo";

// Zet hier je backend-URL, bijvoorbeeld van Render of localhost
const API_URL = "https://lottolojo-1.onrender.com/auth";

export default function AuthModal({ open, onClose, type, onSubmit, language }) {
  const [phase, setPhase] = useState(type); // "login", "register", "verify2fa", "login2fa"

  // Reset fase als type verandert (bij openen modal)
  React.useEffect(() => {
    setPhase(type);
  }, [type, open]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    pincode: ""
  });
  const [info, setInfo] = useState("");

  if (!open) return null;

  const isLogin = phase === "login";
  const isRegister = phase === "register";
  const isVerify2fa = phase === "verify2fa";
  const isLogin2fa = phase === "login2fa";
  const isForgot = phase === "forgot";

  const labels = {
    nl: {
      login: "Inloggen",
      register: "Registreren",
      email: "E-mailadres",
      password: "Wachtwoord",
      name: "Naam",
      pincode: "Pincode (2FA)",
      submit: "Versturen",
      close: "Sluiten"
    },
    en: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      name: "Name",
      pincode: "Pincode (2FA)",
      submit: "Submit",
      close: "Close"
    },
    es: {
      login: "Iniciar sesión",
      register: "Registrarse",
      email: "Correo electrónico",
      password: "Contraseña",
      name: "Nombre",
      pincode: "Pin (2FA)",
      submit: "Enviar",
      close: "Cerrar"
    }
  };


  const l = labels[language] || labels.nl;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isRegister) {
      setInfo("");
      try {
        const res = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password
          })
        });
        const data = await res.json();
        if (res.ok) {
          setInfo("Registratie gelukt! Klik op de verificatielink die je per e-mail hebt ontvangen om je account te activeren.");
          // Toon de verificatielink als mock (voor testen)
          if (data.verifyUrl) {
            setInfo(prev => prev + `\n\nVerificatielink: ${data.verifyUrl}`);
          }
        } else {
          setInfo(data.error || "Registratie mislukt.");
        }
      } catch (err) {
        setInfo("Netwerkfout bij registratie.");
      }
    } else if (isLogin) {
      // Login gebruiker
      setInfo("");
      try {
        const res = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password
          })
        });
        if (res.ok) {
          setInfo("Succesvol ingelogd! Je wordt doorgestuurd...");
          setTimeout(() => {
            window.history.pushState({}, "", "/dashboard");
            window.dispatchEvent(new PopStateEvent("popstate"));
            onSubmit && onSubmit(form);
          }, 1000);
        } else {
          const data = await res.json();
          if (data.error === "E-mail nog niet geverifieerd.") {
            setInfo("Je account is nog niet geactiveerd. Check je e-mail voor de verificatielink.");
          } else if (data.require2fa) {
            setInfo("Te veel mislukte pogingen. Er is een code naar je e-mail gestuurd.");
            setPhase("login2fa");
          } else {
            setInfo(data.error || "Ongeldige combinatie. Probeer opnieuw.");
          }
        }
      } catch (err) {
        setInfo("Netwerkfout bij inloggen.");
      }
    } else if (isVerify2fa) {
      // Verifieer registratie 2FA
      setInfo("");
      try {
        const res = await fetch(`${API_URL}/verify2fa`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            pincode: form.pincode
          })
        });
        if (res.ok) {
          onSubmit(form);
        } else {
          const data = await res.json();
          setInfo(data.error || "Verificatie mislukt.");
        }
      } catch (err) {
        setInfo("Netwerkfout bij verificatie.");
      }
    } else if (isLogin2fa) {
      // Verifieer login 2FA
      setInfo("");
      try {
        const res = await fetch(`${API_URL}/login2fa`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            pincode: form.pincode
          })
        });
        if (res.ok) {
          onSubmit(form);
        } else {
          const data = await res.json();
          setInfo(data.error || "Verificatie mislukt.");
        }
      } catch (err) {
        setInfo("Netwerkfout bij verificatie.");
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xs relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-green-700"
          onClick={onClose}
          aria-label={l.close}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">
          {isLogin && l.login}
          {isRegister && l.register}
          {isVerify2fa && l.pincode}
          {isLogin2fa && l.pincode}
          {isForgot && "Wachtwoord vergeten"}
        </h2>
        {info && <div className="text-sm text-yellow-700 mb-2 text-center">{info}</div>}
        {isForgot ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setInfo("");
              try {
                const res = await fetch(`${API_URL}/forgot-password`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: form.email })
                });
                const data = await res.json();
                if (res.ok) {
                  setInfo("Er is een e-mail verstuurd met instructies om je wachtwoord te resetten.");
                } else {
                  setInfo(data.error || data.message || "Kon geen reset-link sturen.");
                }
              } catch {
                setInfo("Netwerkfout bij wachtwoord reset.");
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              name="email"
              placeholder={l.email}
              value={form.email}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded mt-2"
            >
              Verstuur reset-link
            </button>
            <button
              type="button"
              className="text-xs text-gray-500 underline mt-2"
              onClick={() => setPhase("login")}
            >
              Terug naar inloggen
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {isRegister && (
              <input
                type="text"
                name="name"
                placeholder={l.name}
                value={form.name}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                required
              />
            )}
            {(isRegister || isLogin) && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder={l.email}
                  value={form.email}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder={l.password}
                  value={form.password}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                  required
                />
                {/* Wachtwoord vergeten link */}
                {isLogin && (
                  <div className="text-xs text-gray-500 mt-1 mb-2 text-center">
                    <span
                      style={{ cursor: "pointer", textDecoration: "underline dotted" }}
                      onClick={() => setPhase("forgot")}
                    >
                      Wachtwoord vergeten?
                    </span>
                  </div>
                )}
              </>
            )}
            {(isVerify2fa || isLogin2fa) && (
              <input
                type="text"
                name="pincode"
                placeholder={l.pincode}
                value={form.pincode}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                required
                maxLength={6}
              />
            )}
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded mt-2"
            >
              {l.submit}
            </button>
          </form>
        )}
        {/* Buildnummer/versie onderin */}
        <div className="text-[10px] text-gray-400 mt-4 text-center select-none">Build: {BUILD_NUMBER}</div>
      </div>
    </div>
  );
}
