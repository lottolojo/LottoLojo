import React, { useState } from "react";

export default function AuthModal({ open, onClose, type, onSubmit, language }) {
  const [phase, setPhase] = useState(type); // "login", "register", "verify2fa", "login2fa"
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    pincode: ""
  });
  const [info, setInfo] = useState("");

  if (!open) return null;

  const isLogin = phase === "login";
  const isRegister = phase === "register";
  const isVerify2fa = phase === "verify2fa";
  const isLogin2fa = phase === "login2fa";

  const labels = {
    nl: {
      login: "Inloggen",
      register: "Registreren",
      email: "E-mailadres",
      password: "Wachtwoord",
      name: "Naam",
      pincode: "Pincode (2FA)",
      submit: "Versturen",
      close: "Sluiten"
    },
    en: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      name: "Name",
      pincode: "Pincode (2FA)",
      submit: "Submit",
      close: "Close"
    },
    es: {
      login: "Iniciar sesión",
      register: "Registrarse",
      email: "Correo electrónico",
      password: "Contraseña",
      name: "Nombre",
      pincode: "Pin (2FA)",
      submit: "Enviar",
      close: "Cerrar"
    }
  };


  const l = labels[language] || labels.nl;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isRegister) {
      // Simuleer backend: stuur 2FA mail
      setInfo("Er is een verificatiecode naar je e-mail gestuurd.");
      setPhase("verify2fa");
    } else if (isLogin) {
      // Simuleer backend: tel pogingen
      if (form.email === "test@fail.com" || form.password === "fout") {
        // Simuleer fout wachtwoord
        const attempts = loginAttempts + 1;
        setLoginAttempts(attempts);
        setInfo("Ongeldige combinatie. Probeer opnieuw.");
        if (attempts >= 3) {
          setInfo("Te veel mislukte pogingen. Er is een code naar je e-mail gestuurd.");
          setPhase("login2fa");
        }
      } else {
        onSubmit(form);
      }
    } else if (isVerify2fa || isLogin2fa) {
      // Simuleer 2FA verificatie
      onSubmit(form);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xs relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-green-700"
          onClick={onClose}
          aria-label={l.close}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">
          {isLogin && l.login}
          {isRegister && l.register}
          {isVerify2fa && l.pincode}
          {isLogin2fa && l.pincode}
        </h2>
        {info && <div className="text-sm text-yellow-700 mb-2 text-center">{info}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isRegister && (
            <input
              type="text"
              name="name"
              placeholder={l.name}
              value={form.name}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            />
          )}
          {(isRegister || isLogin) && (
            <>
              <input
                type="email"
                name="email"
                placeholder={l.email}
                value={form.email}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="password"
                name="password"
                placeholder={l.password}
                value={form.password}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                required
              />
            </>
          )}
          {(isVerify2fa || isLogin2fa) && (
            <input
              type="text"
              name="pincode"
              placeholder={l.pincode}
              value={form.pincode}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
              maxLength={6}
            />
          )}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded mt-2"
          >
            {l.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
