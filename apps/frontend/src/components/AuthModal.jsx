import React from "react";

export default function AuthModal({ open, onClose, type, onSubmit, language }) {
  if (!open) return null;

  const isLogin = type === "login";

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

  const [form, setForm] = React.useState({
    email: "",
    password: "",
    name: "",
    pincode: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
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
          {isLogin ? l.login : l.register}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isLogin && (
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
