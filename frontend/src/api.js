const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
export const api = {
  login: (email, password) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({email,password})
    }).then(r=>r.json()),
  events: (token) =>
    fetch(`${BASE}/events`, {headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()),
  alerts: (token) =>
    fetch(`${BASE}/alerts`, {headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()),
  ws: () => new WebSocket((BASE.replace("http","ws")) + "/ws"),
};
