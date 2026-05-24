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
  const [numbers, setNumbers] = useState(Array(10).fill(null));
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState([]);
  
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
    // Sla op in localStorage zodat App.jsx ze kan tonen
    localStorage.setItem("lotto_numbers", JSON.stringify(sorted));
  }

  function goToHome() {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300">
      <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">Jouw 10 Lotto LoJo nummers</h2>
      <div className="flex flex-row flex-wrap justify-center mb-6">
        {numbers.map((num, i) => (
          <Ball key={i} number={num} animate={!!num} delay={i * 0.15} />
        ))}
      </div>
      <button
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => setShowPicker(true)}
      >
        Selecteer nummers
      </button>
      {/* Toon terugknop als er gekozen nummers zijn */}
      {numbers.every(n => n !== null) && (
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded mb-2"
          onClick={goToHome}
        >
          Terug naar overzicht
        </button>
      )}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-green-800">Kies 10 unieke nummers (1-45)</h3>
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
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
              onClick={saveNumbers}
              disabled={selected.length !== 10}
            >
              Opslaan
            </button>
            <button
              className="text-gray-500 underline mt-2"
              onClick={() => setShowPicker(false)}
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
