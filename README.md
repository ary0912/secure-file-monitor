import {useEffect, useRef, useState} from "react";
import {api} from "./api";

export default function App(){
  const [token,setToken]=useState(null);
  const [email,setEmail]=useState("admin@corp.com");
  const [pass,setPass]=useState("adminpass");
  const [events,setEvents]=useState([]);
  const [alerts,setAlerts]=useState([]);
  const wsRef = useRef(null);

  const login = async ()=>{
    const res = await api.login(email,pass);
    if(res.access_token){ setToken(res.access_token); }
    else alert("Login failed");
  };

  useEffect(()=>{
    if(!token) return;
    (async ()=>{
      setEvents(await api.events(token));
      setAlerts(await api.alerts(token));
    })();

    const ws = api.ws();
    wsRef.current = ws;
    ws.onmessage = (m)=>{
      try{
        const msg = JSON.parse(m.data);
        if(msg.type === "ALERT_CREATED"){
          setAlerts(a=>[msg.payload, ...a]);
        }
      }catch(_) {}
    };
    return ()=> ws.close();
  },[token]);

  if(!token){
    return (
      <div style={{maxWidth:420, margin:"60px auto", fontFamily:"system-ui"}}>
        <h2>Secure File Monitor</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
        <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="password" />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, padding:24, fontFamily:"system-ui"}}>
      <section>
        <h3>Live Alerts</h3>
        <ul>
          {alerts.map((a,i)=>(
            <li key={i}>
              <b>{(a.rule||a.payload?.rule) ?? "alert"}</b>
              {" — "}{a.actor_email||a.payload?.actor_email}{" — "}{a.severity||a.payload?.severity}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Recent Events</h3>
        <ul>
          {events.map(e=>(
            <li key={e.id}>
              {e.occurred_at} — {e.actor_email} — {e.action} — {e.resource} — {e.bytes}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
