import React, { useState } from "react";

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(e) {
    e.preventDefault();
    setLoading(true);
    setInfo("");
    try {
      const res = await fetch("https://lottolojo-1.onrender.com/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setInfo("Check je e-mail voor de reset-link.");
        setStep(2);
      } else {
        setInfo(data.error || "Fout bij aanvragen.");
      }
    } catch {
      setInfo("Netwerkfout.");
    }
    setLoading(false);
  }

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    setInfo("");
    try {
      const res = await fetch("https://lottolojo-1.onrender.com/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setInfo("Wachtwoord succesvol aangepast. Je kunt nu inloggen.");
        setStep(3);
      } else {
        setInfo(data.error || "Fout bij resetten.");
      }
    } catch {
      setInfo("Netwerkfout.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xs relative">
        <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">
          Wachtwoord wijzigen
        </h2>
        {info && <div className="text-sm text-yellow-700 mb-2 text-center">{info}</div>}
        {step === 1 && (
          <form onSubmit={handleRequest} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="E-mailadres"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded mt-2"
              disabled={loading}
            >
              {loading ? "Even wachten..." : "Stuur reset-link"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleReset} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Reset token uit e-mail"
              value={token}
              onChange={e => setToken(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="password"
              placeholder="Nieuw wachtwoord"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded mt-2"
              disabled={loading}
            >
              {loading ? "Even wachten..." : "Wachtwoord wijzigen"}
            </button>
          </form>
        )}
        {step === 3 && (
          <div className="text-center">Je wachtwoord is aangepast. Je kunt nu inloggen.</div>
        )}
      </div>
    </div>
  );
}
