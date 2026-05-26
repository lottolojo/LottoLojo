import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Geluiden ---
function playBloop() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

// pong pong ping — oplopende tonen (index bepaalt welk geluid)
function playMatchSound(idx) {
  try {
    const freqs = [400, 500, 800];
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = idx % 3 === 2 ? "triangle" : "sine";
    osc.frequency.value = freqs[idx % 3];
    const dur = idx % 3 === 2 ? 0.55 : 0.38;
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
  } catch {}
}

// pop pop — geen matches
function playNoMatchSound() {
  try {
    [0, 0.3].forEach(d => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, ctx.currentTime + d);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + d + 0.18);
      gain.gain.setValueAtTime(0.22, ctx.currentTime + d);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.22);
      osc.start(ctx.currentTime + d); osc.stop(ctx.currentTime + d + 0.25);
    });
  } catch {}
}

// --- Confetti ---
function Confetti() {
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#74b9ff', '#fd79a8'];
  const pieces = Array.from({ length: 90 }, (_, i) => ({
    id: i, color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 2.5 + Math.random() * 2,
    size: 7 + Math.random() * 10,
    rotate: Math.random() * 720 - 360,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div key={p.id}
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.6, background: p.color, borderRadius: 2 }}
          initial={{ y: -30, rotate: 0, opacity: 1 }}
          animate={{ y: '105vh', rotate: p.rotate, opacity: [1, 1, 0.5, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute top-0"
        />
      ))}
    </div>
  );
}

// --- Bal component ---
// Kleurlogica (nieuwe volgorde):
//   drawMode + revealed + isFallen (= in drawn) → GRIJS (gevallen, uitgespeeld)
//   drawMode + revealed + !isFallen             → GOUD (nog niet gevallen, in spel)
//   isLastNeeded                                → ROOD + trillen (1 verwijderd van jackpot)
//   geen drawMode                               → groene gradient (normaal)
function Ball({ number, delay, drawMode, revealed, isFallen, isLastNeeded }) {
  let bgClass = number
    ? 'bg-gradient-to-br from-yellow-300 to-green-400 text-black border-white'
    : 'bg-gray-300 text-gray-400 border-white';

  if (drawMode && revealed) {
    if (isLastNeeded) {
      bgClass = 'bg-gradient-to-br from-red-400 to-red-600 text-white border-red-200';
    } else if (isFallen) {
      // Gevallen (getrokken door loterij) → grijs, nummer iets vervaagd
      bgClass = 'bg-gray-300 text-gray-400/80 border-gray-200';
    } else {
      // Nog niet gevallen → goud (speelbaar)
      bgClass = 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-black border-yellow-300';
    }
  }

  // Trilling voor last needed: continu, elke 3 seconden
  const shakeVariants = {
    idle:  { x: 0, opacity: 1, y: 0, scale: 1 },
    shake: { x: [0, -5, 5, -4, 4, -2, 2, 0], opacity: 1, y: 0, scale: 1,
             transition: { duration: 0.55 } }
  };
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (!isLastNeeded || !revealed) return;
    const run = () => { setShaking(true); setTimeout(() => setShaking(false), 600); };
    run();
    const iv = setInterval(run, 3000);
    return () => clearInterval(iv);
  }, [isLastNeeded, revealed]);

  // Flash bij reveal (alleen voor niet-lastNeeded ballen)
  const revealAnim = drawMode && revealed && !isLastNeeded
    ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 1], y: 0 }
    : { opacity: 1, y: 0, scale: 1 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isLastNeeded && revealed
        ? (shaking ? shakeVariants.shake : shakeVariants.idle)
        : revealAnim}
      transition={drawMode && revealed && !isLastNeeded
        ? { duration: 0.3 }
        : { duration: 0.45, delay: isLastNeeded ? 0 : delay }}
      className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mx-1 mb-2 border-4 drop-shadow-lg select-none ${bgClass}`}
    >
      {number || "?"}
      {/* Fonkeltje bij initieel laden */}
      {number && !drawMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: -22 }}
          transition={{ duration: 0.3, delay: delay + 0.3 }}
          className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <g filter="url(#g1)"><circle cx="9" cy="9" r="3" fill="#fff700"/></g>
            <g filter="url(#s1)"><circle cx="9" cy="9" r="1.5" fill="#fff"/></g>
            <defs>
              <filter id="g1" x="0" y="0" width="18" height="18" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="3"/></filter>
              <filter id="s1" x="5" y="5" width="8" height="8" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="1"/></filter>
            </defs>
          </svg>
        </motion.div>
      )}
      {/* Glinstering bij goud */}
      {drawMode && revealed && !isFallen && !isLastNeeded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute inset-0 rounded-full bg-white/30 pointer-events-none"
        />
      )}
    </motion.div>
  );
}

// --- Hoofd component ---
export default function Dashboard() {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("lotto_lang");
    if (saved) return saved;
    const bl = (navigator.language || navigator.userLanguage || "nl").toLowerCase();
    if (bl.startsWith("nl")) return "nl";
    if (bl.startsWith("es")) return "es";
    return "en";
  });
  const stored = localStorage.getItem("lotto_numbers");
  const [numbers, setNumbers] = useState(stored ? JSON.parse(stored) : Array(10).fill(null));
  const [selected, setSelected] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState(null);
  const [pot, setPot] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // Draw & reveal state
  const [latestDraw, setLatestDraw] = useState(null);
  const [cumulativeNumbers, setCumulativeNumbers] = useState([]);
  // nummers die al gevallen waren VOOR de nieuwste trekking (= cumulatief - nummers van laatste trekking)
  const [prevCumulativeNumbers, setPrevCumulativeNumbers] = useState([]);
  const [isNewDraw, setIsNewDraw] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [revealDone, setRevealDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [jackpotSeen, setJackpotSeen] = useState(false);
  const matchSoundIdx = useRef(0);

  let userName = "";
  try {
    const token = localStorage.getItem("lotto_token");
    if (token) { const p = JSON.parse(atob(token.split('.')[1])); userName = p.name || ""; }
  } catch {}

  function handleLanguageChange(lang) {
    setLanguage(lang); localStorage.setItem("lotto_lang", lang);
  }

  // Haal profiel + credits op
  useEffect(() => {
    const token = localStorage.getItem("lotto_token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const api = import.meta.env.VITE_API_URL;
    fetch(api + "/auth/me", { headers })
      .then(r => r.json()).then(d => { if (typeof d.credits === "number") setCredits(d.credits); }).catch(() => {});
    fetch(api + "/auth/pot", { headers })
      .then(r => r.json()).then(d => { if (typeof d.potTotal === "number") setPot(d); }).catch(() => {});
  }, []);

  // Haal nummers op
  useEffect(() => {
    const token = localStorage.getItem("lotto_token");
    if (!token) return;
    fetch(import.meta.env.VITE_API_URL + "/auth/numbers", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.numbers && Array.isArray(data.numbers)) {
          setNumbers(data.numbers); setSelected(data.numbers);
          localStorage.setItem("lotto_numbers", JSON.stringify(data.numbers));
        } else { setNumbers(Array(10).fill(null)); setSelected([]); }
      }).catch(() => setError("Kan nummers niet ophalen van de server."));
  }, []);

  // Haal laatste trekking + cumulatieve nummers op
  useEffect(() => {
    const token = localStorage.getItem("lotto_token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const api = import.meta.env.VITE_API_URL;

    Promise.all([
      fetch(api + "/auth/draw/latest", { headers }).then(r => r.json()),
      fetch(api + "/auth/draw/cumulative", { headers }).then(r => r.json())
    ]).then(([draw, cumData]) => {
      if (!draw || !draw.id) return;
      setLatestDraw(draw);
      const cumNums = Array.isArray(cumData.numbers) ? cumData.numbers : [];
      setCumulativeNumbers(cumNums);

      // Bereken prevCumulative: cumulatief zonder de nummers van de laatste trekking
      const latestDrawnNums = Array.isArray(draw.winningNumbers) ? draw.winningNumbers : [];
      // Rebuild cumulatief exclusief de nieuwste trekking om "al eerder gevallen" te weten
      // We halen dit uit de cumData minus de unieke nieuwe nummers van de laatste trekking
      // die niet al eerder voorkwamen — we berekenen dit door de nieuwste nummers te filteren
      // die NIET al in de vorige cumulatieve set zaten. Maar we hebben niet de vorige set.
      // Benadering: vraag cumulative op zonder latest. We slaan dat op als prevCumulative.
      // Simpele aanpak: cumulative zonder de nummers die ALLEEN in de laatste trekking zitten.
      // Dit is correct als cumData de set is inclusief de laatste trekking.
      // prevCumulative = nummers in cumNums die NIET uniek zijn voor de laatste trekking,
      // d.w.z. nummers die al voor de laatste trekking aanwezig waren.
      // We kennen de vorige set niet direct, maar we weten dat prevCum = cumNums \ (latestNums die niet eerder voorkwamen).
      // De simpelste correcte aanpak: prevCum = cumNums (we markeren nieuw vs oud via aparte API call indien nodig)
      // Voor reveal: "nieuw gevallen deze week" = latestDrawnNums die ook in mijn 10 nummers zitten
      // en pas NU voor het eerst zijn gevallen (niet al eerder). Dat is: latestDrawnNums die in cumNums zitten
      // maar NIET in cumNums-exclusief-latest. We laden een extra endpoint niet, maar berekenen:
      // als een nummer in latestDrawnNums zit, was het "potentieel nieuw" — we tonen animatie.
      // Als cumData.drawCount === 1, dan zijn alle latestDrawnNums nieuw.
      // Als drawCount > 1, sommige latestDrawnNums waren al in eerdere trekkingen.
      // We slaan prevCumulative op als cumNums minus nieuw (nieuw = latestNums die niet dubbel staan in andere draws)
      // Praktisch: we sturen een apart verzoek voor prevCumulative NIET — we markeren gewoon alle
      // nummers van de laatste trekking als "potentieel nieuw" voor de reveal. De kleur (grijs) klopt altijd.
      setPrevCumulativeNumbers(cumNums.filter(n => !latestDrawnNums.includes(n)));

      const lastSeen = localStorage.getItem("lotto_last_draw_id");
      if (String(draw.id) !== lastSeen) {
        setIsNewDraw(true);
      } else {
        setRevealDone(true);
      }
    }).catch(() => {});
  }, []);

  // Start reveal zodra nummers én draw geladen zijn
  // revealIndex loopt nu alleen door de NIEUW gevallen ballen (indices in newlyFallenIndices)
  useEffect(() => {
    if (!isNewDraw || !latestDraw || numbers.every(n => n === null)) return;
    matchSoundIdx.current = 0;
    const t = setTimeout(() => setRevealIndex(0), 800);
    return () => clearTimeout(t);
  }, [isNewDraw, latestDraw, numbers]);

  // Nieuw gevallen ballen: user-nummers die in de laatste trekking zitten
  const latestDrawnNums = latestDraw && Array.isArray(latestDraw.winningNumbers) ? latestDraw.winningNumbers : [];
  const newlyFallenIndices = numbers
    .map((n, i) => (n !== null && latestDrawnNums.includes(n) ? i : -1))
    .filter(i => i >= 0);

  // Reveal loop — alleen over nieuw gevallen ballen
  useEffect(() => {
    if (revealIndex < 0 || !latestDraw) return;
    if (revealIndex >= newlyFallenIndices.length) {
      // Alle nieuw gevallen ballen zijn getoond
      const allFallen = numbers.every(n => n !== null && cumulativeNumbers.includes(n));
      if (newlyFallenIndices.length === 0) setTimeout(() => playNoMatchSound(), 300);
      if (allFallen) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 6000);
        try {
          const audio = new Audio('/jackpot-cheer.mp3');
          audio.volume = 0.85;
          audio.play().catch(() => {});
        } catch {}
      }
      localStorage.setItem("lotto_last_draw_id", String(latestDraw.id));
      setRevealDone(true);
      return;
    }
    const timer = setTimeout(() => {
      // Speel geluid voor deze nieuw gevallen bal
      playMatchSound(matchSoundIdx.current);
      matchSoundIdx.current += 1;
      setRevealIndex(prev => prev + 1);
    }, 700);
    return () => clearTimeout(timer);
  }, [revealIndex, latestDraw, numbers, cumulativeNumbers, newlyFallenIndices.length]);

  // Berekeningen — gebaseerd op CUMULATIEVE getrokken nummers
  const drawMode = latestDraw !== null && (revealDone || revealIndex >= 0);
  // Hoeveel van mijn 10 nummers zijn ooit gevallen (cumulatief)?
  const fallenCount = drawMode ? numbers.filter(n => n !== null && cumulativeNumbers.includes(n)).length : 0;
  // Jackpot = alle 10 nummers gevallen
  const isJackpot = drawMode && fallenCount === 10 && numbers.every(n => n !== null);

  // "Last needed" — rood + trillend wanneer 9 van 10 gevallen (1 nummer nog nodig)
  const lastNeededIndex = (drawMode && revealDone && fallenCount === 9 && numbers.filter(n => n !== null).length === 10)
    ? (() => {
        let idx = -1;
        numbers.forEach((n, i) => { if (n !== null && !cumulativeNumbers.includes(n)) idx = i; });
        return idx;
      })()
    : -1;

  function openPicker() {
    setSelected(numbers.every(n => typeof n === "number" && n !== null) ? numbers : []);
    setShowPicker(true);
  }

  function handleSelect(num) {
    if (selected.includes(num)) { setSelected(selected.filter(n => n !== num)); }
    else if (selected.length < 10) { setSelected([...selected, num]); playBloop(); }
  }

  async function saveNumbers(keepSame = false) {
    setError("");
    const sorted = keepSame ? numbers : [...selected].sort((a, b) => a - b);
    setNumbers(sorted);
    setShowPicker(false);
    localStorage.setItem("lotto_numbers", JSON.stringify(sorted));
    setRevealDone(false); setRevealIndex(-1); setIsNewDraw(false);
    setShowSuccess(true); setJackpotSeen(true);
    const token = localStorage.getItem("lotto_token");
    if (token) {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + "/auth/numbers", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ numbers: sorted })
        });
        if (!res.ok) setError("Opslaan mislukt.");
      } catch { setError("Opslaan mislukt."); }
    }
  }

  function goToHome() {
    window.history.pushState({}, "", "/"); window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Status bericht na reveal
  const statusMsg = (() => {
    if (!drawMode || !revealDone) return null;
    if (isJackpot) return { nl: "🏆 JACKPOT! Alle 10 nummers gevallen!", en: "🏆 JACKPOT! All 10 numbers drawn!", es: "🏆 ¡JACKPOT! ¡Los 10 números!", color: "bg-yellow-100 border-yellow-400 text-yellow-800" };
    if (fallenCount === 9) return { nl: "🔥 Zo dichtbij! 9 van 10 gevallen — nog 1 nodig!", en: "🔥 So close! 9 of 10 — just 1 more!", es: "🔥 ¡Tan cerca! 9 de 10 — ¡1 más!", color: "bg-orange-100 border-orange-400 text-orange-700" };
    if (fallenCount > 0) return { nl: `✅ ${fallenCount} van 10 nummers ooit gevallen`, en: `✅ ${fallenCount} of 10 ever drawn`, es: `✅ ${fallenCount} de 10 sorteados`, color: "bg-green-100 border-green-300 text-green-800" };
    return { nl: "😔 Nog geen van jouw nummers gevallen", en: "😔 None of your numbers drawn yet", es: "😔 Ningún número sorteado aún", color: "bg-gray-100 border-gray-300 text-gray-600" };
  })();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300 px-2">
      {showConfetti && <Confetti />}

      {/* Taalkeuze met vlaggen + info-knop */}
      <div className="absolute top-4 right-4 flex gap-1 z-10 items-center">
        {[["nl","🇳🇱"],["en","🇬🇧"],["es","🇪🇸"]].map(([l, flag]) => (
          <button key={l} onClick={() => handleLanguageChange(l)}
            title={l.toUpperCase()}
            className={`text-xl leading-none px-1.5 py-1 rounded transition-all ${language === l ? 'ring-2 ring-green-700 bg-white/60' : 'opacity-60 hover:opacity-100'}`}>
            {flag}
          </button>
        ))}
        {credits !== null && (
          <button onClick={() => setShowInfo(true)}
            title={language === "nl" ? "Over LottoLoJo" : language === "en" ? "About LottoLoJo" : "Sobre LottoLoJo"}
            className="ml-1 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-green-800 font-bold text-base flex items-center justify-center shadow transition-all border border-green-300">
            ?
          </button>
        )}
      </div>

      {error && <div className="text-red-700 font-bold mb-2">{error}</div>}

      {/* Credits box */}
      {credits !== null && (
        <div className={`rounded-xl px-5 py-3 mb-4 text-center font-semibold text-base shadow-sm border-2 w-full max-w-sm
          ${credits === 0 ? 'bg-red-100 border-red-400 text-red-700'
            : credits <= 2 ? 'bg-orange-100 border-orange-400 text-orange-700'
            : 'bg-green-100 border-green-300 text-green-800'}`}>
          {credits === 0 && <>
            <div className="font-bold">{language === "nl" ? "❌ Geen credits" : language === "en" ? "❌ No credits" : "❌ Sin créditos"}</div>
            <div className="text-sm mt-0.5">{language === "nl" ? "Je doet niet mee aan de volgende trekking." : language === "en" ? "You won't join the next draw." : "No participarás en el próximo sorteo."}</div>
          </>}
          {credits > 0 && credits <= 2 && <>
            <div className="font-bold">{language === "nl" ? `⚠️ Nog ${credits} credit${credits > 1 ? "s" : ""}` : language === "en" ? `⚠️ Only ${credits} credit${credits > 1 ? "s" : ""} left` : `⚠️ Solo ${credits} crédito${credits > 1 ? "s" : ""}`}</div>
            <div className="text-sm mt-0.5">{language === "nl" ? "Waardeer op om mee te blijven spelen!" : language === "en" ? "Top up to keep playing!" : "¡Recarga para seguir jugando!"}</div>
          </>}
          {credits > 2 && <div>{language === "es" ? `💳 Créditos: ${credits}` : `💳 Credits: ${credits}`}</div>}
        </div>
      )}

      {/* Pot display */}
      {pot !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm mb-4"
        >
          <div className="relative overflow-hidden rounded-2xl shadow-xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-400 via-yellow-300 to-amber-400">
            {/* Glinstering overlay */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
              className="absolute inset-0 w-1/3 bg-white/30 skew-x-[-20deg] pointer-events-none"
            />
            <div className="relative px-5 py-4 text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-yellow-800/70 mb-1">
                {language === "nl" ? "🏆 Huidige Jackpot" : language === "en" ? "🏆 Current Jackpot" : "🏆 Bote Actual"}
              </div>
              <motion.div
                key={pot.potTotal}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                className="text-4xl font-black text-green-900 tracking-tight drop-shadow"
              >
                {pot.potTotal === 0
                  ? (language === "nl" ? "Nog geen pot" : language === "en" ? "No pot yet" : "Sin bote aún")
                  : `€ ${pot.potTotal.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
              </motion.div>
              {pot.potTotal > 0 && (
                <div className="flex justify-center gap-4 mt-2 text-xs text-green-900/70 font-semibold">
                  <span>🏅 {language === "nl" ? "Winnaar" : language === "en" ? "Winner" : "Ganador"}: <span className="text-green-800 font-bold">€ {pot.winnerShare.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                  <span>❤️ {language === "nl" ? "Goed doel" : language === "en" ? "Charity" : "Caridad"}: <span className="text-red-700 font-bold">€ {pot.orgShare.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <h2 className="text-2xl font-bold mb-2 text-green-800 text-center">
        {language === "nl" ? "Jouw 10 Lotjo nummers" : language === "en" ? "Your 10 Lotjo numbers" : "Tus 10 números Lotjo"}
      </h2>

      {numbers.every(n => n !== null) && userName && (
        <div className="text-lg font-semibold text-green-900 mb-2 text-center">
          {language === "nl" ? `Welkom terug, ${userName}!` : language === "en" ? `Welcome back, ${userName}!` : `¡Bienvenido, ${userName}!`}
        </div>
      )}

      {/* Trekking info — toont datum en getrokken nummers van de LAATSTE trekking */}
      {latestDraw && latestDrawnNums.length > 0 && (
        <div className="text-sm text-green-900/70 mb-3 text-center">
          {language === "nl" ? "Laatste trekking:" : language === "en" ? "Latest draw:" : "Último sorteo:"}{" "}
          <span className="font-semibold">{new Date(latestDraw.drawDate).toLocaleDateString(language === "nl" ? "nl-NL" : "en-GB")}</span>
          {" — "}{latestDrawnNums.join(" · ")}
          {cumulativeNumbers.length > 0 && (
            <span className="ml-2 text-green-700/60">
              ({language === "nl" ? `${cumulativeNumbers.length} uniek ooit gevallen` : `${cumulativeNumbers.length} unique ever drawn`})
            </span>
          )}
        </div>
      )}

      {/* Reveal bezig */}
      {isNewDraw && !revealDone && revealIndex >= 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-green-900 font-bold mb-2 text-center">
          {language === "nl" ? "🎱 Nieuwe trekking — controleer jouw nummers..." : language === "en" ? "🎱 New draw — checking your numbers..." : "🎱 Verificando tus números..."}
        </motion.div>
      )}

      {/* Legende bij draw mode */}
      {drawMode && revealDone && (
        <div className="flex gap-4 text-xs mb-2 text-green-900/80">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 inline-block border border-yellow-400"/>
            {language === "nl" ? "Niet gevallen" : language === "en" ? "Not drawn" : "No sorteado"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block border border-gray-200"/>
            {language === "nl" ? "Gevallen" : language === "en" ? "Drawn" : "Sorteado"}
          </span>
        </div>
      )}

      {/* Ballen */}
      <div className="flex flex-row flex-wrap justify-center mb-4">
        {numbers.map((num, i) => (
          <Ball key={i} number={num} delay={i * 0.15}
            drawMode={drawMode}
            revealed={
              revealDone ||
              // Nieuw-gevallen ballen: alleen revealed als hun positie in newlyFallenIndices al voorbij is
              (newlyFallenIndices.includes(i)
                ? revealIndex > newlyFallenIndices.indexOf(i)
                : true) // Al eerder gevallen of niet gevallen → direct zichtbaar
            }
            isFallen={num !== null && cumulativeNumbers.includes(num)}
            isLastNeeded={i === lastNeededIndex}
          />
        ))}
      </div>

      {/* Status bericht */}
      {statusMsg && revealDone && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`rounded-xl px-5 py-3 mb-3 text-center font-bold text-base border-2 shadow-sm w-full max-w-sm ${statusMsg.color}`}>
          {language === "nl" ? statusMsg.nl : language === "en" ? statusMsg.en : statusMsg.es}
        </motion.div>
      )}

      {/* Jackpot opties — zelfde nummers of kies opnieuw */}
      {isJackpot && revealDone && !jackpotSeen && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl px-6 py-4 w-full max-w-sm text-center">
            <p className="font-bold text-yellow-800 text-base">
              {language === "nl" ? "Wil je doorgaan met dezelfde nummers?" : language === "en" ? "Continue with the same numbers?" : "¿Continuar con los mismos números?"}
            </p>
            <div className="flex gap-3">
              <button onClick={() => saveNumbers(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all">
                {language === "nl" ? "Zelfde nummers" : language === "en" ? "Same numbers" : "Mismos números"}
              </button>
              <button onClick={openPicker}
                className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg text-sm transition-all">
                {language === "nl" ? "Kies opnieuw" : language === "en" ? "Choose again" : "Elegir de nuevo"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {showSuccess && !isJackpot && (
        <div className="text-green-800 font-bold mb-2 text-center">
          {language === "nl" ? "Je nummers zijn opgeslagen. Succes!" : language === "en" ? "Numbers saved. Good luck!" : "¡Números guardados. ¡Buena suerte!"}
        </div>
      )}

      {!numbers.every(n => n !== null) && !showSuccess && (
        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded text-base mb-4"
          style={{ minWidth: 120 }} onClick={openPicker}>
          {language === "nl" ? "Selecteer nummers" : language === "en" ? "Select numbers" : "Seleccionar números"}
        </button>
      )}

      {numbers.every(n => n !== null) && (
        <div className="flex items-center gap-2 mb-2">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-semibold py-1 px-3 rounded text-base"
            style={{ minWidth: 120 }} onClick={goToHome}>
            {language === "nl" ? "Terug naar overzicht" : language === "en" ? "Back to overview" : "Volver al resumen"}
          </button>
          <button
            title={language === "nl" ? "Uitloggen" : "Logout"}
            onClick={() => { localStorage.removeItem("lotto_token"); localStorage.removeItem("lotto_numbers"); window.location.href = "/"; }}
            className="ml-2 p-2 rounded-full hover:bg-red-100 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
          </button>
        </div>
      )}

      {/* Info / Over LottoLoJo modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => setShowInfo(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
              onClick={e => e.stopPropagation()}>

              {/* Sluitknop */}
              <button onClick={() => setShowInfo(false)}
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">×</button>

              {/* Titel */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🎱</span>
                <h2 className="text-xl font-bold text-green-800">
                  {language === "nl" ? "Over LottoLoJo" : language === "en" ? "About LottoLoJo" : "Sobre LottoLoJo"}
                </h2>
              </div>

              {/* Speluitleg */}
              <div className="mb-4">
                <h3 className="font-bold text-green-700 mb-1 text-sm uppercase tracking-wide">
                  {language === "nl" ? "Hoe werkt het spel?" : language === "en" ? "How does the game work?" : "¿Cómo funciona el juego?"}
                </h3>
                {language === "nl" && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Kies 10 nummers (1–45). Elke week worden er 6 nummers getrokken via de officiële Nederlandse Lotto.
                    Jouw nummers worden cumulatief bijgehouden — zodra al jouw 10 nummers ooit zijn gevallen, win jij de jackpot!
                    Nummers die dubbel vallen tellen niet opnieuw mee. Hoe meer trekkingen, hoe groter de pot.
                  </p>
                )}
                {language === "en" && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Pick 10 numbers (1–45). Every week, 6 numbers are drawn through the official Dutch Lotto.
                    Your numbers are tracked cumulatively — once all 10 of your numbers have ever been drawn, you win the jackpot!
                    Duplicate draws don't count again. The more draws without a winner, the bigger the pot.
                  </p>
                )}
                {language === "es" && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Elige 10 números (1–45). Cada semana se sortean 6 números a través de la Lotería Holandesa oficial.
                    Tus números se rastrean acumulativamente — ¡cuando todos tus 10 números hayan salido alguna vez, ganas el jackpot!
                    Los números repetidos no cuentan de nuevo. Cuantos más sorteos sin ganador, mayor el bote.
                  </p>
                )}
              </div>

              {/* Verdeling pot */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-green-700 mb-2 text-sm uppercase tracking-wide">
                  {language === "nl" ? "💰 Verdeling van de pot" : language === "en" ? "💰 Prize distribution" : "💰 Distribución del bote"}
                </h3>
                <div className="flex flex-col gap-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>{language === "nl" ? "🏆 Winnaar(s)" : language === "en" ? "🏆 Winner(s)" : "🏆 Ganador(es)"}</span>
                    <span className="font-bold text-green-700">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "nl" ? "❤️ Goed doel" : language === "en" ? "❤️ Charity" : "❤️ Caridad"}</span>
                    <span className="font-bold text-red-500">15%</span>
                  </div>
                </div>
              </div>

              {/* Goed doel sectie */}
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🇨🇴</span>
                  <h3 className="font-bold text-yellow-800 text-sm uppercase tracking-wide">
                    {language === "nl" ? "Waar gaat de 15% naartoe?" : language === "en" ? "Where does the 15% go?" : "¿A dónde va el 15%?"}
                  </h3>
                </div>
                {language === "nl" && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    De 15% organisatiekosten gaan volledig naar een goed doel voor kinderen op scholen
                    in arme gebieden van Colombia. Met deze bijdrage voorzien we hen van betere leermiddelen,
                    schoolbenodigdheden en helpen we bij het bijbrengen van onderwijs aan kinderen die dit
                    het hardst nodig hebben. Samen maken we het verschil! 🙏
                  </p>
                )}
                {language === "en" && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    The 15% goes entirely to a charity supporting children in schools in impoverished areas
                    of Colombia. With this contribution we provide them with better learning materials,
                    school supplies, and help bring quality education to the children who need it most.
                    Together we make a difference! 🙏
                  </p>
                )}
                {language === "es" && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    El 15% va íntegramente a una organización benéfica que apoya a niños en escuelas
                    de zonas pobres de Colombia. Con esta contribución les proporcionamos mejores materiales
                    de aprendizaje, útiles escolares y ayudamos a brindar educación de calidad a los niños
                    que más lo necesitan. ¡Juntos hacemos la diferencia! 🙏
                  </p>
                )}
              </div>

              <button onClick={() => setShowInfo(false)}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl transition-all text-sm">
                {language === "nl" ? "Sluiten" : language === "en" ? "Close" : "Cerrar"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nummerkiezer modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg relative flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-green-800">
              {language === "nl" ? "Kies 10 unieke nummers (1–45)" : language === "en" ? "Choose 10 unique numbers (1–45)" : "Elige 10 números únicos (1–45)"}
            </h3>
            <div className="grid grid-cols-9 gap-1.5 mb-3">
              {Array.from({ length: 45 }, (_, i) => i + 1).map(num => (
                <button key={num}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-2 text-sm
                    ${selected.includes(num) ? 'bg-green-500 text-white border-green-700' : 'bg-gray-200 text-gray-700 border-gray-400'}
                    ${selected.length === 10 && !selected.includes(num) ? 'opacity-40 cursor-not-allowed' : ''}`}
                  onClick={() => handleSelect(num)}
                  disabled={selected.length === 10 && !selected.includes(num)}>
                  {num}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-3">{selected.length}/10 {language === "nl" ? "gekozen" : language === "en" ? "chosen" : "elegidos"}</p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded text-base disabled:opacity-50"
              onClick={() => saveNumbers(false)} disabled={selected.length !== 10}>
              {language === "nl" ? "Opslaan" : language === "en" ? "Save" : "Guardar"}
            </button>
            <button className="text-gray-500 underline mt-2 text-base" onClick={() => setShowPicker(false)}>
              {language === "nl" ? "Annuleren" : language === "en" ? "Cancel" : "Cancelar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
