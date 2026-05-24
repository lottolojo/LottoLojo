import React, { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setInfo("");
    // Dummy check, vervang door echte backend-call
    if (
      form.email === "joudejans76@gmail.com" &&
      form.password === "Sagitarius1%"
    ) {
      setInfo("Inloggen gelukt!");
      onLogin && onLogin();
    } else {
      setInfo("Ongeldige combinatie.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xs relative">
        <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">
          Admin login
        </h2>
        {info && <div className="text-sm text-yellow-700 mb-2 text-center">{info}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="E-mailadres"
            value={form.email}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Wachtwoord"
            value={form.password}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded mt-2"
            disabled={loading}
          >
            {loading ? "Even wachten..." : "Inloggen"}
          </button>
        </form>
      </div>
    </div>
  );
}
