import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminPanel({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setError("Kan gebruikers niet ophalen"));
  }, [token]);

  const setRole = async (userId, role) => {
    setError(""); setSuccess("");
    const res = await fetch(`${API_URL}/admin/set-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, role })
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Rol aangepast");
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    } else {
      setError(data.error || "Fout bij aanpassen rol");
    }
  };

  const setCredits = async (userId, credits) => {
    setError(""); setSuccess("");
    const res = await fetch(`${API_URL}/admin/set-credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, credits: Number(credits) })
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Credits aangepast");
      setUsers(users.map(u => u.id === userId ? { ...u, profile: { ...u.profile, creditsBalance: data.creditsBalance } } : u));
    } else {
      setError(data.error || "Fout bij aanpassen credits");
    }
  };

  if (loading) return <div>Gebruikers laden...</div>;
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Naam</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Credits</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.profile?.creditsBalance ?? 0}</td>
              <td>
                {u.role !== 'admin' && (
                  <button className="px-2 py-1 bg-blue-500 text-white rounded mr-2" onClick={() => setRole(u.id, 'admin')}>Maak admin</button>
                )}
                {u.role === 'admin' && u.email !== 'lottolojo@gmail.com' && (
                  <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2" onClick={() => setRole(u.id, 'participant')}>Maak deelnemer</button>
                )}
                <input type="number" min={0} defaultValue={u.profile?.creditsBalance ?? 0} style={{ width: 60 }}
                  onBlur={e => setCredits(u.id, e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
