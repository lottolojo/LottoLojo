import React, { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL + "/auth";

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [language] = useState(localStorage.getItem("lotto_lang") || "nl");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setInfo("");
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (res.ok && data.user && data.user.role === "admin" && data.token) {
        localStorage.setItem("lotto_token", data.token);
        setInfo(
          language === "nl" ? "Succesvol ingelogd als admin!" :
          language === "en" ? "Successfully logged in as admin!" :
          "¡Sesión iniciada como admin!"
        );
        setTimeout(() => {
          window.history.pushState({}, "", "/admin-panel");
          window.dispatchEvent(new PopStateEvent("popstate"));
          onLogin && onLogin();
        }, 600);
      } else if (res.ok) {
        setInfo(
          language === "nl" ? "Je hebt geen admin-rechten." :
          language === "en" ? "You don't have admin rights." :
          "No tienes derechos de administrador."
        );
      } else {
        setInfo(data.error ||
          (language === "nl" ? "Ongeldige combinatie." :
          language === "en" ? "Invalid credentials." :
          "Combinación inválida.")
        );
      }
    } catch (err) {
      setInfo(
        language === "nl" ? "Netwerkfout. Kan geen verbinding maken met de server." :
        language === "en" ? "Network error. Cannot connect to server." :
        "Error de red. No se puede conectar al servidor."
      );
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="LottoLoJo" className="w-20 h-20 drop-shadow-lg" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full">
          {/* Admin badge */}
          <div className="flex justify-center mb-4">
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-300 uppercase tracking-wide">
              Admin
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-green-800 text-center">
            {language === "nl" && "Admin login"}
            {language === "en" && "Admin login"}
            {language === "es" && "Acceso admin"}
          </h2>

          {info && (
            <div className={`text-sm font-semibold mb-4 text-center px-3 py-2 rounded-lg ${info.includes("Succesvol") || info.includes("Successfully") || info.includes("iniciada") ? "bg-green-100 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              name="email"
              placeholder={language === "nl" ? "E-mailadres" : language === "en" ? "Email address" : "Correo electrónico"}
              value={form.email}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              required
              autoComplete="email"
            />
            <input
              type="password"
              name="password"
              placeholder={language === "nl" ? "Wachtwoord" : language === "en" ? "Password" : "Contraseña"}
              value={form.password}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 rounded-lg text-base mt-2 transition-all disabled:opacity-60"
              disabled={loading}
            >
              {loading
                ? (language === "nl" ? "Even wachten..." : language === "en" ? "Please wait..." : "Espere...")
                : (language === "nl" ? "Inloggen" : language === "en" ? "Login" : "Entrar")}
            </button>
          </form>

          {/* Terug naar home */}
          <div className="mt-5 text-center">
            <button
              className="text-sm text-gray-400 hover:text-green-700 underline transition"
              onClick={() => {
                window.history.pushState({}, "", "/");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
            >
              {language === "nl" ? "← Terug naar de app" : language === "en" ? "← Back to the app" : "← Volver a la app"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
