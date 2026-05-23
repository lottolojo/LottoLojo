import React from "react";
import "./theme.css";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300">
      <img src="/logo.svg" alt="LottoLoJo logo" className="w-32 mb-6 drop-shadow-lg" />
      <h1 className="text-4xl font-extrabold text-green-900 mb-2">Lotto LoJo</h1>
      <p className="text-lg text-yellow-800 mb-8">Speel samen. Win samen. Luxe, veilig en fun!</p>
      <div className="bg-white/80 rounded-xl shadow-xl p-8 w-full max-w-md">
        <p className="text-center text-green-700 font-semibold">Welkom bij de besloten Lotto voor vrienden!</p>
        {/* Hier komen login, registratie, dashboard, etc. */}
      </div>
    </div>
  );
}
