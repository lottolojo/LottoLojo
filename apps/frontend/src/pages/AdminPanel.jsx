import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL + "/auth";

const FLAGS = { nl: "🇳🇱", en: "🇬🇧", es: "🇪🇸" };

const CURRENCIES = {
  EUR: { symbol: '€', name: 'Euro (€)' },
  USD: { symbol: '$', name: 'US Dollar ($)' },
  GBP: { symbol: '£', name: 'British Pound (£)' },
  COP: { symbol: '$', name: 'Peso Colombiano ($)' },
  MXN: { symbol: '$', name: 'Peso Mexicano ($)' },
};

const T = {
  nl: {
    title: "Admin Panel", subtitle: "Deelnemersbeheer",
    logout: "Uitloggen",
    loading: "Laden...", saving: "Opslaan...",
    drawSection: "🎱 Wekelijkse trekking invoeren",
    drawDateLabel: "Trekkingsdatum",
    drawNumbersLabel: "6 winnende nummers (1–45)",
    saveDraw: "Trekking opslaan",
    recentDraws: "Recente trekkingen",
    published: "✅ Gepubliceerd", concept: "📝 Concept",
    potSection: "💰 Huidige pot",
    winnerSection: "🏆 Winnaar",
    winnerNumbers: "Nummers:",
    winnerContact: "⚠️ Neem contact op met de winnaar!",
    noWinner: "Nog geen winnaar.",
    winnerPayout: (sym, w, o, pct) => `Winnaar: ${sym}${w} — Organisatie ${pct}%: ${sym}${o}`,
    resetSection: "♻️ Lotto resetten",
    resetWarning: "Dit wist alle trekkingen en de pot. Deelnemers behouden hun nummers. Niet ongedaan te maken!",
    resetBtn: "Lotto resetten", confirmReset: "Zeker weten?", yesReset: "Ja, reset", cancel: "Annuleren",
    colName: "Naam", colEmail: "Email", colRole: "Rol", colStatus: "Status", colCredits: "Credits", colActions: "Acties",
    statusPending: "⏳ Niet goedgekeurd", statusBlocked: "🚫 Geblokkeerd", statusActive: "✅ Actief",
    statusPendingShort: "⏳ Wacht", statusBlockedShort: "🚫 Gebl.",
    actionsBtn: "Acties ›",
    approve: "✅ Goedkeuren", unblock: "🔓 Deblokkeren", block: "🚫 Blokkeren",
    makeAdmin: "⭐ Maak admin", makeParticipant: "👤 Maak deelnemer",
    resetNumbers: "🔄 Reset nummers", deleteUser: "🗑️ Verwijder gebruiker",
    creditsLabel: "Credits toevoegen (betaald bedrag)",
    addCreditsBtn: "Toevoegen",
    creditsPreview: (n, sym, price) => `= ${n} credit${n !== 1 ? 's' : ''} (${sym}${price}/stuk)`,
    creditsSaved: (added, total) => `+${added} credit${added !== 1 ? 's' : ''} toegevoegd — nieuw saldo: ${total}`,
    confirmDelete: (name) => `Gebruiker "${name}" permanent verwijderen?`,
    confirmResetNums: (name) => `Nummers van ${name} resetten?`,
    drawSaved: (n) => `Trekking opgeslagen — ${n} deelnemers: 1 credit afgeschreven`,
    fetchLotto: "🔄 Ophalen van Lotto.nl",
    fetching: "Ophalen...",
    fetchSuccess: (d, nums) => `Opgehaald van Lotto.nl: ${d} — nummers: ${nums}. Controleer en sla op.`,
    settingsTitle: "⚙️ Instellingen",
    settingsCreditPrice: "Creditprijs per trekking",
    settingsOrgPct: "Organisatiepercentage (%)",
    settingsCurrency: "Valuta",
    settingsSave: "Opslaan",
    settingsSaved: "Instellingen opgeslagen",
  },
  en: {
    title: "Admin Panel", subtitle: "Participant Management",
    logout: "Log out",
    loading: "Loading...", saving: "Saving...",
    drawSection: "🎱 Enter weekly draw",
    drawDateLabel: "Draw date",
    drawNumbersLabel: "6 winning numbers (1–45)",
    saveDraw: "Save draw",
    recentDraws: "Recent draws",
    published: "✅ Published", concept: "📝 Draft",
    potSection: "💰 Current pot",
    winnerSection: "🏆 Winner",
    winnerNumbers: "Numbers:",
    winnerContact: "⚠️ Contact the winner!",
    noWinner: "No winner yet.",
    winnerPayout: (sym, w, o, pct) => `Winner: ${sym}${w} — Organisation ${pct}%: ${sym}${o}`,
    resetSection: "♻️ Reset Lotto",
    resetWarning: "This clears all draws and the pot. Participants keep their numbers. Cannot be undone!",
    resetBtn: "Reset Lotto", confirmReset: "Are you sure?", yesReset: "Yes, reset", cancel: "Cancel",
    colName: "Name", colEmail: "Email", colRole: "Role", colStatus: "Status", colCredits: "Credits", colActions: "Actions",
    statusPending: "⏳ Not approved", statusBlocked: "🚫 Blocked", statusActive: "✅ Active",
    statusPendingShort: "⏳ Pending", statusBlockedShort: "🚫 Blocked",
    actionsBtn: "Actions ›",
    approve: "✅ Approve", unblock: "🔓 Unblock", block: "🚫 Block",
    makeAdmin: "⭐ Make admin", makeParticipant: "👤 Make participant",
    resetNumbers: "🔄 Reset numbers", deleteUser: "🗑️ Delete user",
    creditsLabel: "Add credits (amount paid)",
    addCreditsBtn: "Add",
    creditsPreview: (n, sym, price) => `= ${n} credit${n !== 1 ? 's' : ''} (${sym}${price}/each)`,
    creditsSaved: (added, total) => `+${added} credit${added !== 1 ? 's' : ''} added — new balance: ${total}`,
    confirmDelete: (name) => `Permanently delete user "${name}"?`,
    confirmResetNums: (name) => `Reset numbers for ${name}?`,
    drawSaved: (n) => `Draw saved — ${n} participants: 1 credit deducted`,
    fetchLotto: "🔄 Fetch from Lotto.nl",
    fetching: "Fetching...",
    fetchSuccess: (d, nums) => `Fetched from Lotto.nl: ${d} — numbers: ${nums}. Check and save.`,
    settingsTitle: "⚙️ Settings",
    settingsCreditPrice: "Credit price per draw",
    settingsOrgPct: "Organisation percentage (%)",
    settingsCurrency: "Currency",
    settingsSave: "Save",
    settingsSaved: "Settings saved",
  },
  es: {
    title: "Panel Admin", subtitle: "Gestión de participantes",
    logout: "Cerrar sesión",
    loading: "Cargando...", saving: "Guardando...",
    drawSection: "🎱 Ingresar sorteo semanal",
    drawDateLabel: "Fecha del sorteo",
    drawNumbersLabel: "6 números ganadores (1–45)",
    saveDraw: "Guardar sorteo",
    recentDraws: "Sorteos recientes",
    published: "✅ Publicado", concept: "📝 Borrador",
    potSection: "💰 Bote actual",
    winnerSection: "🏆 Ganador",
    winnerNumbers: "Números:",
    winnerContact: "⚠️ ¡Contacta al ganador!",
    noWinner: "Aún no hay ganador.",
    winnerPayout: (sym, w, o, pct) => `Ganador: ${sym}${w} — Organización ${pct}%: ${sym}${o}`,
    resetSection: "♻️ Reiniciar Lotto",
    resetWarning: "Esto borra todos los sorteos y el bote. Los participantes conservan sus números. ¡No se puede deshacer!",
    resetBtn: "Reiniciar Lotto", confirmReset: "¿Estás seguro?", yesReset: "Sí, reiniciar", cancel: "Cancelar",
    colName: "Nombre", colEmail: "Email", colRole: "Rol", colStatus: "Estado", colCredits: "Créditos", colActions: "Acciones",
    statusPending: "⏳ No aprobado", statusBlocked: "🚫 Bloqueado", statusActive: "✅ Activo",
    statusPendingShort: "⏳ Pendiente", statusBlockedShort: "🚫 Bloq.",
    actionsBtn: "Acciones ›",
    approve: "✅ Aprobar", unblock: "🔓 Desbloquear", block: "🚫 Bloquear",
    makeAdmin: "⭐ Hacer admin", makeParticipant: "👤 Hacer participante",
    resetNumbers: "🔄 Resetear números", deleteUser: "🗑️ Eliminar usuario",
    creditsLabel: "Agregar créditos (monto pagado)",
    addCreditsBtn: "Agregar",
    creditsPreview: (n, sym, price) => `= ${n} crédito${n !== 1 ? 's' : ''} (${sym}${price}/c/u)`,
    creditsSaved: (added, total) => `+${added} crédito${added !== 1 ? 's' : ''} agregado — saldo nuevo: ${total}`,
    confirmDelete: (name) => `¿Eliminar permanentemente al usuario "${name}"?`,
    confirmResetNums: (name) => `¿Resetear los números de ${name}?`,
    drawSaved: (n) => `Sorteo guardado — ${n} participantes: 1 crédito deducido`,
    fetchLotto: "🔄 Obtener de Lotto.nl",
    fetching: "Obteniendo...",
    fetchSuccess: (d, nums) => `Obtenido de Lotto.nl: ${d} — números: ${nums}. Comprueba y guarda.`,
    settingsTitle: "⚙️ Configuración",
    settingsCreditPrice: "Precio por crédito",
    settingsOrgPct: "Porcentaje organización (%)",
    settingsCurrency: "Moneda",
    settingsSave: "Guardar",
    settingsSaved: "Configuración guardada",
  }
};

export default function AdminPanel({ token }) {
  const [lang, setLang] = useState(localStorage.getItem("lotto_admin_lang") || "nl");
  const t = T[lang];

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [euroInputs, setEuroInputs] = useState({});

  const [potInfo, setPotInfo] = useState(null);
  const [winnerInfo, setWinnerInfo] = useState(null);

  const [drawNumbers, setDrawNumbers] = useState(["", "", "", "", "", ""]);
  const [drawDate, setDrawDate] = useState(new Date().toISOString().slice(0, 10));
  const [drawLoading, setDrawLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [draws, setDraws] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [settings, setSettings] = useState({ creditPrice: 2.50, orgPercentage: 0.15 });
  const [currency, setCurrencyState] = useState(localStorage.getItem("lotto_currency") || "EUR");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ creditPrice: '', orgPercentage: '', currency: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const sym = CURRENCIES[currency]?.symbol ?? '€';
  const orgPct = Math.round(settings.orgPercentage * 100);

  function changeLang(l) { setLang(l); localStorage.setItem("lotto_admin_lang", l); }
  function changeCurrency(c) { setCurrencyState(c); localStorage.setItem("lotto_currency", c); }

  useEffect(() => { loadData(); }, [token]);

  async function loadData() {
    setLoading(true); setError("");
    try {
      const [usersRes, potRes, drawsRes, winnerRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/pot`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/draws`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/winner`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/settings`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const usersData = await usersRes.json();
      if (!Array.isArray(usersData)) throw new Error(usersData.error || "Fout bij ophalen gebruikers");
      setUsers(usersData);
      const inputs = {};
      usersData.forEach(u => { inputs[u.id] = ''; });
      setEuroInputs(inputs);
      if (potRes.ok) setPotInfo(await potRes.json());
      if (drawsRes.ok) { const d = await drawsRes.json(); setDraws(Array.isArray(d) ? d : []); }
      if (winnerRes.ok) setWinnerInfo(await winnerRes.json());
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings(s);
        setSettingsForm({ creditPrice: s.creditPrice, orgPercentage: Math.round(s.orgPercentage * 100), currency: localStorage.getItem("lotto_currency") || "EUR" });
      }
    } catch (e) {
      setError(e.message || "Laden mislukt");
    }
    setLoading(false);
  }

  async function submitDraw() {
    setError(""); setSuccess("");
    const nums = drawNumbers.map(n => parseInt(n));
    if (nums.some(isNaN) || new Set(nums).size !== 6) { setError("Vul 6 unieke nummers in (1-45)."); return; }
    if (nums.some(n => n < 1 || n > 45)) { setError("Nummers moeten tussen 1 en 45 liggen."); return; }
    setDrawLoading(true);
    const res = await fetch(`${API_URL}/admin/draw`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ drawDate, winningNumbers: nums })
    });
    const data = await res.json();
    setDrawLoading(false);
    if (res.ok) {
      setSuccess(t.drawSaved(data.creditsDeducted ?? 0));
      setDrawNumbers(["", "", "", "", "", ""]);
      setDraws(prev => [data, ...prev].slice(0, 10));
      // Herlaad data om bijgewerkte credits en winnaars te tonen
      loadData();
    } else { setError(data.error || "Fout bij opslaan."); }
  }

  async function fetchFromLotto() {
    setFetchLoading(true); setError(""); setSuccess("");
    const res = await fetch(`${API_URL}/admin/fetch-lotto-draw`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setFetchLoading(false);
    if (res.ok) {
      setDrawNumbers(data.numbers.map(String));
      setDrawDate(data.date);
      setSuccess(t.fetchSuccess(data.date, data.numbers.join(', ')));
    } else {
      setError(data.error || "Ophalen mislukt.");
    }
  }

  async function addCredits(userId) {
    setError(""); setSuccess("");
    const amount = parseFloat(euroInputs[userId]);
    if (isNaN(amount) || amount <= 0) { setError("Vul een geldig bedrag in."); return; }
    const res = await fetch(`${API_URL}/admin/add-credits`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, amount })
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(t.creditsSaved(data.creditsAdded, data.creditsBalance));
      setUsers(u => u.map(u2 => u2.id === userId ? { ...u2, profile: { ...u2.profile, creditsBalance: data.creditsBalance } } : u2));
      setEuroInputs(prev => ({ ...prev, [userId]: '' }));
    } else { setError(data.error || "Fout bij credits."); }
  }

  async function saveSettings() {
    setSettingsLoading(true); setError(""); setSuccess("");
    const creditPrice = parseFloat(settingsForm.creditPrice);
    const orgPercentage = parseFloat(settingsForm.orgPercentage) / 100;
    if (isNaN(creditPrice) || creditPrice <= 0 || isNaN(orgPercentage) || orgPercentage < 0 || orgPercentage > 1) {
      setError("Ongeldige instellingen."); setSettingsLoading(false); return;
    }
    const res = await fetch(`${API_URL}/admin/settings`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ creditPrice, orgPercentage })
    });
    const data = await res.json();
    setSettingsLoading(false);
    if (res.ok) {
      setSettings(data);
      changeCurrency(settingsForm.currency);
      setSuccess(t.settingsSaved);
      setShowSettings(false);
    } else { setError(data.error || "Fout bij opslaan."); }
  }

  async function resetNumbers(userId) {
    const res = await fetch(`${API_URL}/admin/reset-numbers/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) { setSuccess("Nummers gereset"); setSelectedUser(null); }
    else { setError(data.error || "Reset mislukt."); }
  }

  async function approveUser(userId) {
    const res = await fetch(`${API_URL}/admin/approve-user/${userId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) { setSuccess("Goedgekeurd"); setUsers(u => u.map(u2 => u2.id === userId ? { ...u2, approved: true } : u2)); setSelectedUser(prev => prev ? { ...prev, approved: true } : null); }
    else { setError(data.error || "Fout."); }
  }

  async function toggleBlock(userId) {
    const res = await fetch(`${API_URL}/admin/toggle-block/${userId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) {
      setSuccess(data.blocked ? "Geblokkeerd" : "Gedeblokkeerd");
      setUsers(u => u.map(u2 => u2.id === userId ? { ...u2, blocked: data.blocked } : u2));
      setSelectedUser(prev => prev ? { ...prev, blocked: data.blocked } : null);
    } else { setError(data.error || "Fout."); }
  }

  async function setRole(userId, role) {
    setError(""); setSuccess("");
    const res = await fetch(`${API_URL}/admin/set-role`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, role })
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Rol aangepast"); setUsers(u => u.map(u2 => u2.id === userId ? { ...u2, role } : u2));
      setSelectedUser(prev => prev ? { ...prev, role } : null);
    } else { setError(data.error || "Fout bij aanpassen rol."); }
  }

  async function deleteUser(userId, name) {
    if (!window.confirm(t.confirmDelete(name))) return;
    const res = await fetch(`${API_URL}/admin/delete-user/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) { setSuccess("Gebruiker verwijderd"); setUsers(u => u.filter(u2 => u2.id !== userId)); setSelectedUser(null); }
    else { setError(data.error || "Verwijderen mislukt."); }
  }

  async function publishDraw(drawId) {
    setError(""); setSuccess("");
    const res = await fetch(`${API_URL}/admin/publish-draw/${drawId}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(lang === 'en' ? "Draw published" : lang === 'es' ? "Sorteo publicado" : "Trekking gepubliceerd");
      setDraws(prev => prev.map(d => d.id === drawId ? { ...d, published: true } : d));
    } else { setError(data.error || "Publiceren mislukt."); }
  }

  async function resetLotto() {
    const res = await fetch(`${API_URL}/admin/reset-lotto`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) { setSuccess(data.message); setShowResetConfirm(false); loadData(); }
    else { setError(data.error || "Reset mislukt."); }
  }

  function handleLogout() { localStorage.removeItem("lotto_token"); window.location.href = "/"; }

  function creditsClass(credits) {
    if (credits === 0) return "bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded font-bold text-xs";
    if (credits <= 2) return "bg-orange-100 text-orange-700 border border-orange-300 px-2 py-0.5 rounded font-bold text-xs";
    return "bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs";
  }

  const hasWinner = winnerInfo?.winners?.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-yellow-300 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="LottoLoJo" className="w-12 h-12 drop-shadow"/>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-green-900">{t.title}</h1>
              <p className="text-green-800 text-sm">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {["nl","en","es"].map(l => (
                <button key={l} onClick={() => changeLang(l)}
                  title={l.toUpperCase()}
                  className={`text-xl leading-none px-1.5 py-1 rounded transition-all ${lang === l ? 'ring-2 ring-green-700 bg-white/60' : 'opacity-60 hover:opacity-100'}`}>
                  {FLAGS[l]}
                </button>
              ))}
            </div>
            {/* Tandwiel instellingen */}
            <button onClick={() => { setSettingsForm({ creditPrice: settings.creditPrice, orgPercentage: Math.round(settings.orgPercentage * 100), currency }); setShowSettings(true); }}
              title={t.settingsTitle}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/70 hover:bg-white text-gray-600 hover:text-green-800 shadow transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 bg-white/80 hover:bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg shadow transition-all text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"/>
              </svg>
              {t.logout}
            </button>
          </div>
        </div>

        {/* Settings modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <h2 className="text-lg font-bold text-green-800 mb-4">{t.settingsTitle}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{t.settingsCreditPrice} ({sym})</label>
                  <input type="number" min="0.01" step="0.01" value={settingsForm.creditPrice}
                    onChange={e => setSettingsForm(f => ({ ...f, creditPrice: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{t.settingsOrgPct}</label>
                  <input type="number" min="0" max="100" step="1" value={settingsForm.orgPercentage}
                    onChange={e => setSettingsForm(f => ({ ...f, orgPercentage: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{t.settingsCurrency}</label>
                  <select value={settingsForm.currency}
                    onChange={e => setSettingsForm(f => ({ ...f, currency: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    {Object.entries(CURRENCIES).map(([code, c]) => (
                      <option key={code} value={code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={saveSettings} disabled={settingsLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-60">
                  {settingsLoading ? t.saving : t.settingsSave}
                </button>
                <button onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm">
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback */}
        {error && <div className="bg-red-100 border border-red-300 text-red-700 font-semibold rounded-lg px-4 py-3 mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-300 text-green-800 font-semibold rounded-lg px-4 py-3 mb-4">{success}</div>}

        {/* Trekking invoeren */}
        <div className="bg-white/90 rounded-xl shadow-xl p-6 mb-5">
          <h2 className="text-lg font-bold text-green-800 mb-4">{t.drawSection}</h2>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end flex-wrap">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">{t.drawDateLabel}</label>
              <input type="date" value={drawDate} onChange={e => setDrawDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">{t.drawNumbersLabel}</label>
              <div className="flex gap-2 flex-wrap">
                {drawNumbers.map((n, i) => (
                  <input key={i} type="number" min={1} max={45} value={n}
                    onChange={e => { const u = [...drawNumbers]; u[i] = e.target.value; setDrawNumbers(u); }}
                    placeholder={`#${i+1}`}
                    className="border border-gray-300 rounded-lg px-2 py-2 w-14 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-400"/>
                ))}
              </div>
            </div>
            <button onClick={submitDraw} disabled={drawLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-60">
              {drawLoading ? t.saving : t.saveDraw}
            </button>
            <button onClick={fetchFromLotto} disabled={fetchLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-60 flex items-center gap-2">
              {fetchLoading ? t.fetching : t.fetchLotto}
            </button>
          </div>

          {draws.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">{t.recentDraws}</p>
              <div className="space-y-1">
                {draws.map(d => (
                  <div key={d.id} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-500 w-24 shrink-0">{new Date(d.drawDate).toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB")}</span>
                    <div className="flex gap-1">
                      {(Array.isArray(d.winningNumbers) ? d.winningNumbers : []).map((n, i) => (
                        <span key={i} className="w-7 h-7 rounded-full bg-yellow-300 border-2 border-yellow-500 flex items-center justify-center font-bold text-xs">{n}</span>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {!d.published && (
                        <button onClick={() => publishDraw(d.id)}
                          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all">
                          ▶ Publiceer
                        </button>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {d.published ? t.published : t.concept}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pot + Winnaar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-white/90 rounded-xl shadow-xl p-5">
            <h2 className="text-lg font-bold text-green-800 mb-2">{t.potSection}</h2>
            {potInfo ? (
              <div className="text-3xl font-extrabold text-green-700">
                {sym}{potInfo.potTotal.toFixed(2)}
              </div>
            ) : <p className="text-gray-500 text-sm">{t.loading}</p>}
          </div>

          <div className={`rounded-xl shadow-xl p-5 ${hasWinner ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-white/90'}`}>
            <h2 className="text-lg font-bold text-green-800 mb-2">{t.winnerSection}</h2>
            {hasWinner ? (() => {
              const pot = potInfo?.potTotal ?? 0;
              const winnerCount = winnerInfo.winners.length;
              const totalPayout = pot * (1 - settings.orgPercentage);
              const perWinner = (totalPayout / winnerCount).toFixed(2);
              const orgAmt = (pot * settings.orgPercentage).toFixed(2);
              const rowBg = ["bg-yellow-100/60", "bg-amber-50/80"];
              return (
                <div>
                  {winnerInfo.winners.map((w, i) => (
                    <div key={i}
                      className={`rounded-lg px-3 py-2 mb-1.5 ${rowBg[i % 2]}`}
                      style={{ boxShadow: "0 1px 4px 0 rgba(180,140,0,0.10)" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-yellow-800 text-base leading-tight">{w.userName}</p>
                        <span className="text-green-700 font-extrabold text-base whitespace-nowrap">€{perWinner}</span>
                      </div>
                      <p className="text-yellow-700 text-xs">{w.userEmail}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.winnerNumbers} {(Array.isArray(w.numbers) ? w.numbers : []).join(', ')}</p>
                    </div>
                  ))}
                  <div className="mt-3 pt-2 border-t border-yellow-200 text-xs text-yellow-900 font-semibold">
                    {t.winnerPayout(sym, totalPayout.toFixed(2), orgAmt, orgPct)}
                    {winnerCount > 1 && <span className="text-gray-500 font-normal ml-1">({winnerCount} winnaars)</span>}
                  </div>
                  <p className="text-xs text-orange-700 mt-1.5 font-semibold">{t.winnerContact}</p>
                </div>
              );
            })() : (
              <div>
                <p className="text-gray-500 text-sm mb-2">{t.noWinner}</p>
                {potInfo && potInfo.potTotal > 0 && (() => {
                  const pot = potInfo.potTotal;
                  const winnerAmt = (pot * (1 - settings.orgPercentage)).toFixed(2);
                  const orgAmt = (pot * settings.orgPercentage).toFixed(2);
                  return (
                    <p className="text-xs text-gray-600">
                      {t.winnerPayout(sym, winnerAmt, orgAmt, orgPct)}
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Reset Lotto */}
        {hasWinner && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-5">
            <h2 className="text-base font-bold text-red-700 mb-2">{t.resetSection}</h2>
            <p className="text-sm text-red-600 mb-3">{t.resetWarning}</p>
            {!showResetConfirm ? (
              <button onClick={() => setShowResetConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg text-sm transition-all">
                {t.resetBtn}
              </button>
            ) : (
              <div className="flex gap-3 items-center">
                <span className="text-sm font-semibold text-red-700">{t.confirmReset}</span>
                <button onClick={resetLotto} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-sm">{t.yesReset}</button>
                <button onClick={() => setShowResetConfirm(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-1.5 rounded-lg text-sm">{t.cancel}</button>
              </div>
            )}
          </div>
        )}

        {/* Gebruikerstabel */}
        {loading ? (
          <div className="bg-white/80 rounded-xl shadow-xl p-8 text-center text-green-800 font-semibold">{t.loading}</div>
        ) : (
          <div className="bg-white/90 rounded-xl shadow-xl overflow-hidden">
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">{t.colName}</th>
                    <th className="text-left px-4 py-3 font-semibold">{t.colEmail}</th>
                    <th className="text-left px-4 py-3 font-semibold">{t.colRole}</th>
                    <th className="text-left px-4 py-3 font-semibold">{t.colStatus}</th>
                    <th className="text-left px-4 py-3 font-semibold">{t.colCredits}</th>
                    <th className="text-left px-4 py-3 font-semibold">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const cr = u.profile?.creditsBalance ?? 0;
                    return (
                      <tr key={u.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-green-50'} ${u.blocked ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedUser(u)}
                            className="font-semibold text-green-700 hover:text-green-900 hover:underline text-left">
                            {u.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            {!u.approved && <span className="text-xs text-orange-600 font-semibold">{t.statusPending}</span>}
                            {u.blocked && <span className="text-xs text-red-600 font-semibold">{t.statusBlocked}</span>}
                            {u.approved && !u.blocked && <span className="text-xs text-green-600">{t.statusActive}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`${creditsClass(cr)} min-w-[2.5rem] text-center`}>{cr}</span>
                              <span className="text-xs text-gray-400 ml-1">{sym}</span>
                              <input type="number" min={0} step="0.01" value={euroInputs[u.id] ?? ''}
                                onChange={e => setEuroInputs({ ...euroInputs, [u.id]: e.target.value })}
                                placeholder="0.00"
                                className="border border-gray-300 rounded px-1.5 py-1 w-20 text-xs"/>
                              <button onClick={() => addCredits(u.id)}
                                className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">✓</button>
                            </div>
                            {parseFloat(euroInputs[u.id]) > 0 && (
                              <span className="text-xs text-blue-600 pl-1">
                                {t.creditsPreview(Math.floor(parseFloat(euroInputs[u.id]) / settings.creditPrice), sym, settings.creditPrice)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedUser(u)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded transition-all">
                            {t.actionsBtn}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden divide-y divide-gray-100">
              {users.map(u => {
                const cr = u.profile?.creditsBalance ?? 0;
                return (
                  <div key={u.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <button onClick={() => setSelectedUser(u)}
                        className="font-bold text-green-700 hover:underline">{u.name}</button>
                      <span className={creditsClass(cr)}>{cr} cr.</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{u.email}</p>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span>
                      {!u.approved && <span className="text-xs text-orange-600">{t.statusPendingShort}</span>}
                      {u.blocked && <span className="text-xs text-red-600">{t.statusBlockedShort}</span>}
                      <button onClick={() => setSelectedUser(u)}
                        className="ml-auto bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded">
                        {t.actionsBtn}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Gebruiker actie modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-green-800">{selectedUser.name}</h3>
                <p className="text-gray-500 text-sm">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="flex flex-col gap-2">
              {!selectedUser.approved && (
                <button onClick={() => approveUser(selectedUser.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg text-sm transition-all">
                  {t.approve}
                </button>
              )}
              <button onClick={() => toggleBlock(selectedUser.id)}
                className={`w-full ${selectedUser.blocked ? 'bg-green-100 hover:bg-green-200 text-green-800' : 'bg-orange-100 hover:bg-orange-200 text-orange-800'} font-semibold py-2 rounded-lg text-sm transition-all`}>
                {selectedUser.blocked ? t.unblock : t.block}
              </button>
              {selectedUser.role !== 'admin' && (
                <button onClick={() => setRole(selectedUser.id, 'admin')}
                  className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-2 rounded-lg text-sm transition-all">
                  {t.makeAdmin}
                </button>
              )}
              {selectedUser.role === 'admin' && selectedUser.email !== 'lottolojo@gmail.com' && (
                <button onClick={() => setRole(selectedUser.id, 'participant')}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 rounded-lg text-sm transition-all">
                  {t.makeParticipant}
                </button>
              )}
              <button onClick={() => { if (window.confirm(t.confirmResetNums(selectedUser.name))) resetNumbers(selectedUser.id); }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-sm transition-all">
                {t.resetNumbers}
              </button>
              <button onClick={() => deleteUser(selectedUser.id, selectedUser.name)}
                className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg text-sm transition-all mt-1">
                {t.deleteUser}
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">{t.creditsLabel}</p>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500 font-semibold">{sym}</span>
                <input type="number" min={0} step="0.01" value={euroInputs[selectedUser.id] ?? ''}
                  onChange={e => setEuroInputs({ ...euroInputs, [selectedUser.id]: e.target.value })}
                  placeholder="0.00"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                <button onClick={() => addCredits(selectedUser.id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-sm">
                  {t.addCreditsBtn}
                </button>
              </div>
              {(euroInputs[selectedUser.id] ?? 0) > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {t.creditsPreview(Math.floor(parseFloat(euroInputs[selectedUser.id]) / settings.creditPrice), sym, settings.creditPrice)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
