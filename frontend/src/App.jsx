import {useEffect, useRef, useState} from "react";
import {api} from "./api";

export default function App(){
  const [token,setToken]=useState(null);
  const [email,setEmail]=useState("admin@example.com");
  const [pass,setPass]=useState("admin123");
  const [events,setEvents]=useState([]);
  const [alerts,setAlerts]=useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wsRef = useRef(null);

  const login = async ()=>{
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email,pass);
      if(res.access_token){ 
        setToken(res.access_token); 
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(!token) return;
    (async ()=>{
      try {
        setEvents(await api.events(token));
        setAlerts(await api.alerts(token));
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    })();

    // WS for live alerts
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

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if(!token){
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            🛡️ Secure File Monitor
          </div>
          <div style={{
            color: '#6b7280',
            marginBottom: '32px',
            fontSize: '14px'
          }}>
            Monitor and protect your file system
          </div>
          
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <input 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="Email address"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <input 
              value={pass} 
              onChange={e=>setPass(e.target.value)} 
              type="password" 
              placeholder="Password"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button 
            onClick={login}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <strong>Demo Credentials:</strong><br/>
            admin@example.com / admin123<br/>
            user@example.com / password123
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            🛡️ Secure File Monitor
          </div>
          <div style={{
            background: '#10b981',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            LIVE
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Welcome, {email}
          </div>
          <button 
            onClick={() => setToken(null)}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          {/* Live Alerts Section */}
          <section style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                🚨 Live Alerts
              </div>
              <div style={{
                background: '#dc2626',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {alerts.length}
              </div>
            </div>
            
            {alerts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No alerts at the moment
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.map((alert, i) => (
                  <div key={i} style={{
                    padding: '16px',
                    border: `2px solid ${getSeverityColor(alert.severity)}`,
                    borderRadius: '8px',
                    background: `${getSeverityColor(alert.severity)}10`,
                    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '14px'
                      }}>
                        {alert.rule?.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div style={{
                        background: getSeverityColor(alert.severity),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {alert.severity}
                      </div>
                    </div>
                    <div style={{
                      color: '#6b7280',
                      fontSize: '13px',
                      marginBottom: '4px'
                    }}>
                      {alert.actor_email}
                    </div>
                    <div style={{
                      color: '#9ca3af',
                      fontSize: '12px'
                    }}>
                      {formatDate(alert.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Events Section */}
          <section style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                📊 Recent Events
              </div>
              <div style={{
                background: '#3b82f6',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {events.length}
              </div>
            </div>
            
            {events.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No events recorded
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.map((event, i) => (
                  <div key={i} style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: '#fafafa',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }} onMouseEnter={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.transform = 'translateY(-1px)';
                  }} onMouseLeave={(e) => {
                    e.target.style.background = '#fafafa';
                    e.target.style.transform = 'translateY(0)';
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '14px',
                        textTransform: 'capitalize'
                      }}>
                        {event.action}
                      </div>
                      <div style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {formatBytes(event.bytes)}
                      </div>
                    </div>
                    <div style={{
                      color: '#6b7280',
                      fontSize: '13px',
                      marginBottom: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {event.resource}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        color: '#9ca3af',
                        fontSize: '12px'
                      }}>
                        {event.actor_email}
                      </div>
                      <div style={{
                        color: '#9ca3af',
                        fontSize: '12px'
                      }}>
                        {formatDate(event.occurred_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
