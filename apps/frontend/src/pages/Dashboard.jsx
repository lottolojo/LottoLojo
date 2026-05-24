import React, { useState } from "react";

function Ball({ number }) {
  return (
    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mx-1 mb-2 border-4 border-white drop-shadow-lg ${number ? 'bg-gradient-to-br from-yellow-300 to-green-400 text-black' : 'bg-gray-300 text-gray-400'}`}>
      {number || "?"}
    </div>
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
    setNumbers(selected);
    setShowPicker(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300">
      <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">Jouw 10 Lotto LoJo nummers</h2>
      <div className="flex flex-row flex-wrap justify-center mb-6">
        {numbers.map((num, i) => <Ball key={i} number={num} />)}
      </div>
      <button
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => setShowPicker(true)}
      >
        Selecteer nummers
      </button>
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
