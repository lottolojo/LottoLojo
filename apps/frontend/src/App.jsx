

import React, { useState, useEffect } from "react";
import "./theme.css";
import AuthModal from "./components/AuthModal";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

function LottoBall({ number, animate, isLojo, lojoLetter }) {
  return (
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mx-1 mb-2 transition-all duration-700 bg-gradient-to-br from-yellow-300 to-green-400 border-4 border-white drop-shadow-lg ${animate ? "animate-bounce" : ""}`}
      style={{
        animationDelay: `${Math.random() * 0.5}s`,
      }}
    >
      {isLojo ? lojoLetter : number}
    </div>
  );
}


function RulesModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-green-700"
          onClick={onClose}
          aria-label="Sluiten"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">Spelregels Lotto LoJo</h2>
        <div className="text-gray-800 text-base space-y-3">
          <p>De trekking wordt gedaan door de Nederlandse Loterij. Na registratie kun je als deelnemer <b>10 unieke nummers</b> kiezen uit 1 t/m 45. Deze nummers worden als 10 ballen op je scherm getoond.</p>
          <p>Elke zaterdagavond om <b>21:00 uur</b> vindt de trekking plaats. Er worden 6 winnende getallen getrokken uit 45 (het reservegetal telt niet mee).</p>
          <p>Gevallen nummers worden als <span className="text-green-700 font-bold">groene ballen</span> getoond, nog niet gevallen nummers blijven grijs.</p>
          <p>De deelnameprijs is <b>€2,50 per trekking</b>. De eerste trekking kan nooit een winnaar opleveren, zodat er direct een pot wordt opgebouwd. Van de totale pot wordt <b>15% aan de organisatie</b> toegekend, de rest wordt volledig uitgekeerd aan de winnaar(s).</p>
          <p>Als admin zie je een lijst met alle deelnemers en hun gekozen getallen. Je kunt als admin de gevallen nummers invoeren; de app kleurt automatisch de juiste ballen groen en bepaalt wie er gewonnen heeft.</p>
          <p>Een winnaar krijgt confetti en een felicitatie op het scherm. Iedereen ziet na de trekking of de Lotto is gevallen, door wie (of door meerdere personen tegelijk).</p>
          <p>Na elke trekking kunnen deelnemers tot <b>13:00 uur 's middags vóór de nieuwe trekking</b> hun nummers aanpassen. Daarna en tussendoor is dat niet mogelijk.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [language, setLanguage] = useState("nl");
  const [lojoPhase, setLojoPhase] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, type: "login" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Ballen: 10 stuks, 4-7 worden LOJO
  const ballNumbers = [12, 7, 23, 4, 18, 9, 31, 5, 27, 14];
  const lojoIndices = [3, 4, 5, 6];
  const lojoLetters = ["L", "O", "J", "O"];

  useEffect(() => {
    // Start animatie, na 2.5s transformeren ballen 4-7 naar LOJO, na 4s animatie klaar
    const lojoTimeout = setTimeout(() => setLojoPhase(true), 2500);
    const endTimeout = setTimeout(() => setShowAnimation(false), 4000);
    return () => {
      clearTimeout(lojoTimeout);
      clearTimeout(endTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300 relative">
      {/* Taalwissel */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            className={`text-2xl hover:scale-110 transition-transform ${language === lang.code ? "" : "opacity-60"}`}
            onClick={() => setLanguage(lang.code)}
            aria-label={lang.label}
          >
            {lang.flag}
          </button>
        ))}
      </div>

      <img
        src="/logo.svg"
        alt="LottoLoJo logo"
        className="w-32 mb-6 drop-shadow-lg z-10 cursor-pointer"
        onClick={handleLogoClick}
      />

      {/* Admin login modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xs relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-green-700"
              onClick={() => setShowAdminModal(false)}
              aria-label="Sluiten"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">Admin Login</h2>
            <AdminLogin onLogin={() => setShowAdminModal(false)} />
          </div>
        </div>
      )}
        // Admin login via 5x klikken op logo
        const [logoClicks, setLogoClicks] = useState(0);
        const [showAdminModal, setShowAdminModal] = useState(false);
// Plaats deze functie bovenaan in de App component, niet in de render/JSX
      <h1 className="text-4xl font-extrabold text-green-900 mb-2 z-10 text-center">Lotto LoJo</h1>
      <p className="text-lg text-yellow-800 mb-8 z-10 text-center">
        {language === "nl" && "Speel samen. Win samen. Doe mee!"}
        {language === "en" && "Play together. Win together. Join us!"}
        {language === "es" && "Juega juntos. Gana juntos. ¡Únete!"}
      </p>

      {/* Animatie */}
      <AnimatePresence mode="wait">
        {showAnimation ? (
          <motion.div
            key="balls"
            className="flex flex-row items-end justify-center h-32 mb-8 z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {ballNumbers.map((num, i) => (
              <LottoBall
                key={i}
                number={num}
                animate={true}
                isLojo={lojoPhase && lojoIndices.includes(i)}
                lojoLetter={lojoPhase && lojoIndices.includes(i) ? lojoLetters[lojoIndices.indexOf(i)] : null}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/80 rounded-xl shadow-xl p-8 w-full max-w-md z-10">
              <p className="text-center text-green-700 font-semibold mb-4">
                {language === "nl" && "Welkom bij de besloten Lotto voor vrienden!"}
                {language === "en" && "Welcome to the private Lotto for friends!"}
                {language === "es" && "¡Bienvenido a la Lotería privada para amigos!"}
              </p>
              <div className="flex flex-col gap-4">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-all"
                  onClick={() => setAuthModal({ open: true, type: "login" })}
                >
                  {language === "nl" && "Inloggen"}
                  {language === "en" && "Login"}
                  {language === "es" && "Iniciar sesión"}
                </button>
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-2 rounded transition-all"
                  onClick={() => setAuthModal({ open: true, type: "register" })}
                >
                  {language === "nl" && "Registreren"}
                  {language === "en" && "Register"}
                  {language === "es" && "Registrarse"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Auth modals */}
      <AuthModal
        open={authModal.open}
        type={authModal.type}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        onSubmit={(data) => {
          setAuthModal({ ...authModal, open: false });
          setLoggedIn(true);
        }}
        language={language}
      />

      {/* Subtiele balk onderin na inloggen */}
      {loggedIn && (
        <div className="fixed bottom-0 left-0 w-full bg-white/80 border-t border-green-300 py-2 px-4 flex justify-center gap-6 text-green-800 text-sm z-50 shadow">
          <a
            href="#"
            onClick={e => { e.preventDefault(); window.history.pushState({}, "", "/reset-password"); window.dispatchEvent(new PopStateEvent("popstate")); }}
            className="underline hover:text-green-600"
          >
            Wachtwoord wijzigen
          </a>
          <span>|</span>
          <a
            href="#"
            onClick={e => { e.preventDefault(); setShowRules(true); }}
            className="underline hover:text-green-600"
          >
            Uitleg & spelregels
          </a>
        </div>
      )}

      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
