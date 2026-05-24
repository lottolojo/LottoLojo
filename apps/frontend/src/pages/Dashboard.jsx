import React, { useState } from "react";
import { motion } from "framer-motion";

function Ball({ number, animate, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mx-1 mb-2 border-4 border-white drop-shadow-lg ${number ? 'bg-gradient-to-br from-yellow-300 to-green-400 text-black' : 'bg-gray-300 text-gray-400'}`}
    >
      {number || "?"}
      {/* Fonkeltje animatie */}
      {number && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: -24 }}
          transition={{ duration: 0.3, delay: delay + 0.3 }}
          className="absolute left-1/2 -translate-x-1/2 top-0"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <g filter="url(#glow)"><circle cx="9" cy="9" r="3" fill="#fff700"/></g>
            <g filter="url(#sparkle)"><circle cx="9" cy="9" r="1.5" fill="#fff"/></g>
            <defs>
              <filter id="glow" x="0" y="0" width="18" height="18" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="3"/></filter>
              <filter id="sparkle" x="5" y="5" width="8" height="8" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="1"/></filter>
            </defs>
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const [language] = useState(localStorage.getItem("lotto_lang") || "nl");
  // Haal bestaande nummers uit localStorage, zodat ze blijven na refresh/login
  const stored = localStorage.getItem("lotto_numbers");
  const initialNumbers = stored ? JSON.parse(stored) : Array(10).fill(null);
  const [numbers, setNumbers] = useState(initialNumbers);
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  function handleSelect(num) {
    if (selected.includes(num)) {
      setSelected(selected.filter(n => n !== num));
    } else if (selected.length < 10) {
      setSelected([...selected, num]);
    }
  }

  function saveNumbers() {
    // Sorteer de geselecteerde nummers oplopend
    const sorted = [...selected].sort((a, b) => a - b);
    setNumbers(sorted);
    setShowPicker(false);
    localStorage.setItem("lotto_numbers", JSON.stringify(sorted));
    setShowSuccess(true);
  }

  function goToHome() {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300">
      <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">
        {language === "nl" && "Jouw 10 Lotjo nummers"}
        {language === "en" && "Your 10 Lotjo numbers"}
        {language === "es" && "Tus 10 números Lotjo"}
      </h2>
      <div className="flex flex-row flex-wrap justify-center mb-6">
        {numbers.map((num, i) => (
          <Ball key={i} number={num} animate={!!num} delay={i * 0.15} />
        ))}
      </div>
      {/* Succesbericht na kiezen */}
      {showSuccess && (
        <div className="text-green-800 font-bold mb-2">
          {language === "nl" && "Je hebt je nummers gekozen. Succes!"}
          {language === "en" && "You have chosen your numbers. Success!"}
          {language === "es" && "¡Has elegido tus números. Éxito!"}
        </div>
      )}
      {/* Selecteer-knop alleen tonen als nog niet gekozen */}
      {!numbers.every(n => n !== null) && !showSuccess && (
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded text-base mb-4"
          style={{ minWidth: 120 }}
          onClick={() => setShowPicker(true)}
        >
          {language === "nl" && "Selecteer nummers"}
          {language === "en" && "Select numbers"}
          {language === "es" && "Seleccionar números"}
        </button>
      )}
      {/* Toon terugknop als er gekozen nummers zijn */}
      {numbers.every(n => n !== null) && (
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-semibold py-1 px-3 rounded text-base mb-2"
          style={{ minWidth: 120 }}
          onClick={goToHome}
        >
          {language === "nl" && "Terug naar overzicht"}
          {language === "en" && "Back to overview"}
          {language === "es" && "Volver al resumen"}
        </button>
      )}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-green-800">
              {language === "nl" && "Kies 10 unieke nummers (1-45)"}
              {language === "en" && "Choose 10 unique numbers (1-45)"}
              {language === "es" && "Elige 10 números únicos (1-45)"}
            </h3>
            <div className="grid grid-cols-9 gap-2 mb-4">
              {Array.from({ length: 45 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${selected.includes(num) ? 'bg-green-500 text-white border-green-700' : 'bg-gray-200 text-gray-700 border-gray-400'} ${selected.length === 10 && !selected.includes(num) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleSelect(num)}
                  disabled={selected.length === 10 && !selected.includes(num)}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded text-base mt-2"
              style={{ minWidth: 100 }}
              onClick={saveNumbers}
              disabled={selected.length !== 10}
            >
              {language === "nl" && "Opslaan"}
              {language === "en" && "Save"}
              {language === "es" && "Guardar"}
            </button>
            <button
              className="text-gray-500 underline mt-2 text-base"
              onClick={() => setShowPicker(false)}
            >
              {language === "nl" && "Annuleren"}
              {language === "en" && "Cancel"}
              {language === "es" && "Cancelar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
