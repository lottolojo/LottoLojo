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
        setInfo("Succesvol ingelogd als admin!");
        onLogin && onLogin();
      } else if (res.ok) {
        setInfo("Je hebt geen admin-rechten.");
      } else {
        setInfo(data.error || "Ongeldige combinatie.");
      }
    } catch {
      setInfo("Netwerkfout.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300">
      <div className="bg-white rounded-xl shadow-2xl p-12 w-full max-w-2xl relative flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-green-800 text-center">
          {language === "nl" && "Admin login"}
          {language === "en" && "Admin login"}
          {language === "es" && "Acceso admin"}
        </h2>
        {info && <div className="text-base text-yellow-700 mb-4 text-center">{info}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-lg">
          <input
            type="email"
            name="email"
            placeholder={language === "nl" ? "E-mailadres" : language === "en" ? "Email address" : "Correo electrónico"}
            value={form.email}
            onChange={handleChange}
            className="border rounded px-4 py-3 text-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder={language === "nl" ? "Wachtwoord" : language === "en" ? "Password" : "Contraseña"}
            value={form.password}
            onChange={handleChange}
            className="border rounded px-4 py-3 text-lg"
            required
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded text-lg mt-2"
            disabled={loading}
          >
            {loading
              ? (language === "nl"
                  ? "Even wachten..."
                  : language === "en"
                  ? "Please wait..."
                  : "Espere...")
              : language === "nl"
              ? "Inloggen"
              : language === "en"
              ? "Login"
              : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
