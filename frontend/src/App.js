import React, { useState, useEffect } from 'react';
import Login from './Login';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, sans-serif; }

  .app {
    display: flex;
    height: 100vh;
    background: #f7f7f7;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  .sidebar {
    width: 220px;
    flex-shrink: 0;
    background: #ffffff;
    border-right: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
    padding: 16px 0;
  }

  .sidebar-logo {
    padding: 0 16px 16px;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 8px;
  }

  .logo-text {
    font-size: 15px;
    font-weight: 600;
    color: #111;
    letter-spacing: -0.3px;
  }

  .logo-sub {
    font-size: 11px;
    color: #999;
    margin-top: 2px;
  }

  .sidebar-section {
    padding: 4px 8px;
    margin-bottom: 4px;
  }

  .sidebar-label {
    font-size: 10px;
    font-weight: 500;
    color: #bbb;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 0 8px;
    margin-bottom: 2px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: #666;
    transition: all 0.1s;
    user-select: none;
  }

  .nav-item:hover { background: #f5f5f5; color: #111; }
  .nav-item.active { background: #f0f0f0; color: #111; font-weight: 500; }

  .nav-count {
    margin-left: auto;
    font-size: 11px;
    color: #999;
    background: #f0f0f0;
    border-radius: 10px;
    padding: 1px 6px;
  }

  .nav-count-red { background: #FEE2E2; color: #B91C1C; }

  .sidebar-bottom {
    margin-top: auto;
    padding: 12px 16px;
    border-top: 1px solid #e8e8e8;
  }

  .user-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #EEF2FF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    color: #4F46E5;
    flex-shrink: 0;
  }

  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 12px; color: #333; font-weight: 500; }

  .btn-logout {
    font-size: 11px;
    color: #999;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    padding: 0;
    transition: color 0.1s;
  }

  .btn-logout:hover { color: #333; }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .topbar {
    height: 50px;
    border-bottom: 1px solid #e8e8e8;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 24px;
    gap: 12px;
    flex-shrink: 0;
  }

  .page-title {
    font-size: 13px;
    font-weight: 500;
    color: #111;
    flex: 1;
  }

  .filter-pills {
    display: flex;
    gap: 4px;
  }

  .pill {
    font-size: 11px;
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid #e8e8e8;
    background: transparent;
    color: #666;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.1s;
  }

  .pill:hover { border-color: #ccc; color: #111; }
  .pill.active { background: #111; color: #fff; border-color: transparent; }

  .btn-recap {
    font-size: 12px;
    padding: 6px 14px;
    border-radius: 6px;
    border: none;
    background: #5E6AD2;
    color: #fff;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    transition: opacity 0.1s;
  }

  .btn-recap:hover { opacity: 0.85; }
  .btn-recap:disabled { opacity: 0.5; cursor: not-allowed; }

  .stats-bar {
    display: flex;
    padding: 14px 24px;
    border-bottom: 1px solid #e8e8e8;
    background: #fff;
    flex-shrink: 0;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-right: 24px;
    margin-right: 24px;
    border-right: 1px solid #e8e8e8;
    cursor: pointer;
  }

  .stat-item:last-child { border-right: none; padding-right: 0; margin-right: 0; }

  .stat-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .stat-num {
    font-size: 20px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.5px;
  }

  .stat-lbl {
    font-size: 10px;
    color: #999;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .list-container {
    flex: 1;
    overflow-y: auto;
    background: #f7f7f7;
    padding: 8px 0;
  }

  .list-header {
    display: grid;
    grid-template-columns: 1fr 160px 100px 90px;
    padding: 6px 24px;
    margin-bottom: 2px;
  }

  .list-header span {
    font-size: 10px;
    font-weight: 500;
    color: #bbb;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 160px 100px 90px;
    padding: 10px 24px;
    align-items: center;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.1s;
  }

  .row:hover { background: #fafafa; }

  .row-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .status-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 9px;
    font-weight: 700;
  }

  .si-red { background: #FEE2E2; color: #B91C1C; border: 1.5px solid #F87171; }
  .si-amber { background: #FEF3C7; color: #92400E; border: 1.5px solid #FCD34D; }
  .si-green { background: #DCFCE7; color: #166534; border: 1.5px solid #4ADE80; }
  .si-gray { background: #F3F4F6; color: #6B7280; border: 1.5px solid #D1D5DB; }

  .row-title {
    font-size: 13px;
    color: #111;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  .row-motif {
    font-size: 12px;
    color: #777;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 16px;
  }

  .row-tag {
    font-size: 10px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 20px;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .tag-red { background: #FEE2E2; color: #B91C1C; }
  .tag-amber { background: #FEF3C7; color: #92400E; }
  .tag-green { background: #DCFCE7; color: #166534; }
  .tag-gray { background: #F3F4F6; color: #6B7280; }

  .row-action {
    font-size: 11px;
    color: #999;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .state-box {
    margin: 24px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    padding: 40px;
    text-align: center;
  }

  .state-title { font-size: 14px; font-weight: 500; color: #333; margin-bottom: 4px; }
  .state-sub { font-size: 13px; color: #999; margin-top: 4px; }

  .error-box {
    margin: 24px;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 10px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .error-text { font-size: 13px; color: #B91C1C; }

  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #111;
    color: #fff;
    font-size: 13px;
    padding: 10px 18px;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

function Dashboard({ utilisateur, onLogout }) {
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("tous");
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('https://ster-ai-production.up.railway.app/drive/analyser-tout')
      .then(res => res.json())
      .then(data => {
        if (data.error) setErreur(data.error);
        else setResultats(data.resultats);
        setLoading(false);
      })
      .catch(() => {
        setErreur("Impossible de contacter le backend");
        setLoading(false);
      });
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const envoyerRecap = () => {
    setEnvoi(true);
    fetch('https://ster-ai-production.up.railway.app/envoyer-recap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinataire: 'louislhertere@gmail.com',
        resultats: resultats
      })
    })
      .then(res => res.json())
      .then(() => { showToast('Recap envoye par email'); setEnvoi(false); })
      .catch(() => { showToast("Erreur lors de l'envoi"); setEnvoi(false); });
  };

  const matchsFiltres = resultats.filter(m => filtre === "tous" || m.priorite === filtre);
  const nbRouge = resultats.filter(m => m.priorite === "rouge").length;
  const nbJaune = resultats.filter(m => m.priorite === "jaune").length;
  const nbVert = resultats.filter(m => m.priorite === "vert").length;
  const nbGris = resultats.filter(m => m.priorite === "gris").length;

  const initiales = utilisateur.nom
    ? utilisateur.nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-text">Ster-AI</div>
            <div className="logo-sub">FFF - Arbitrage</div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Vue</div>
            <div className={`nav-item ${filtre === 'tous' ? 'active' : ''}`} onClick={() => setFiltre('tous')}>
              <span>Tous les rapports</span>
              {!loading && <span className="nav-count">{resultats.length}</span>}
            </div>
            <div className={`nav-item ${filtre === 'rouge' ? 'active' : ''}`} onClick={() => setFiltre('rouge')}>
              <span>Prioritaires</span>
              {!loading && nbRouge > 0 && <span className="nav-count nav-count-red">{nbRouge}</span>}
            </div>
            <div className={`nav-item ${filtre === 'jaune' ? 'active' : ''}`} onClick={() => setFiltre('jaune')}>
              <span>A verifier</span>
              {!loading && <span className="nav-count">{nbJaune}</span>}
            </div>
            <div className={`nav-item ${filtre === 'vert' ? 'active' : ''}`} onClick={() => setFiltre('vert')}>
              <span>RAS</span>
              {!loading && <span className="nav-count">{nbVert}</span>}
            </div>
            <div className={`nav-item ${filtre === 'gris' ? 'active' : ''}`} onClick={() => setFiltre('gris')}>
              <span>Rapport manquant</span>
              {!loading && <span className="nav-count">{nbGris}</span>}
            </div>
          </div>

          <div className="sidebar-section" style={{ marginTop: '8px' }}>
            <div className="sidebar-label">Competitions</div>
            <div className="nav-item">National 1</div>
            <div className="nav-item">National 2</div>
            <div className="nav-item">National 3</div>
          </div>

          <div className="sidebar-bottom">
            <div className="user-row">
              <div className="avatar">{initiales}</div>
              <div className="user-info">
                <div className="user-name">{utilisateur.nom}</div>
                <button className="btn-logout" onClick={onLogout}>Deconnexion</button>
              </div>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="topbar">
            <div className="page-title">Rapports - Semaine {getWeekNumber()}</div>
            <div className="filter-pills">
              {['tous', 'rouge', 'jaune', 'vert', 'gris'].map(f => (
                <button
                  key={f}
                  className={`pill ${filtre === f ? 'active' : ''}`}
                  onClick={() => setFiltre(f)}
                >
                  {f === 'tous' ? 'Tous' : f === 'rouge' ? 'Prioritaire' : f === 'jaune' ? 'A verifier' : f === 'vert' ? 'RAS' : 'Manquant'}
                </button>
              ))}
            </div>
            <button className="btn-recap" onClick={envoyerRecap} disabled={envoi || loading}>
              {envoi ? 'Envoi...' : 'Envoyer recap'}
            </button>
          </div>

          {!loading && !erreur && (
            <div className="stats-bar">
              <div className="stat-item" onClick={() => setFiltre('rouge')}>
                <div className="stat-dot" style={{ background: '#EF4444' }} />
                <div>
                  <div className="stat-num" style={{ color: '#B91C1C' }}>{nbRouge}</div>
                  <div className="stat-lbl">Prioritaires</div>
                </div>
              </div>
              <div className="stat-item" onClick={() => setFiltre('jaune')}>
                <div className="stat-dot" style={{ background: '#F59E0B' }} />
                <div>
                  <div className="stat-num" style={{ color: '#92400E' }}>{nbJaune}</div>
                  <div className="stat-lbl">A verifier</div>
                </div>
              </div>
              <div className="stat-item" onClick={() => setFiltre('vert')}>
                <div className="stat-dot" style={{ background: '#22C55E' }} />
                <div>
                  <div className="stat-num" style={{ color: '#166534' }}>{nbVert}</div>
                  <div className="stat-lbl">RAS</div>
                </div>
              </div>
              <div className="stat-item" onClick={() => setFiltre('gris')}>
                <div className="stat-dot" style={{ background: '#9CA3AF' }} />
                <div>
                  <div className="stat-num" style={{ color: '#6B7280' }}>{nbGris}</div>
                  <div className="stat-lbl">Manquant</div>
                </div>
              </div>
              <div className="stat-item" onClick={() => setFiltre('tous')}>
                <div className="stat-dot" style={{ background: '#D1D5DB' }} />
                <div>
                  <div className="stat-num" style={{ color: '#111' }}>{resultats.length}</div>
                  <div className="stat-lbl">Total</div>
                </div>
              </div>
            </div>
          )}

          <div className="list-container">
            {loading && (
              <div className="state-box">
                <div className="state-title">Analyse en cours...</div>
                <div className="state-sub">Claude lit les rapports depuis Google Drive</div>
              </div>
            )}

            {erreur && (
              <div className="error-box">
                <span className="error-text">Erreur : {erreur}</span>
              </div>
            )}

            {!loading && !erreur && (
              <>
                <div className="list-header">
                  <span>Match</span>
                  <span>Motif</span>
                  <span>Statut</span>
                  <span style={{ textAlign: 'right' }}>Action</span>
                </div>

                {matchsFiltres.length === 0 && (
                  <div className="state-box">
                    <div className="state-title">Aucun rapport dans cette categorie</div>
                  </div>
                )}

                {matchsFiltres.map((m, i) => {
                  const priorite = m.priorite || 'gris';
                  const tagClass = priorite === 'rouge' ? 'tag-red' : priorite === 'vert' ? 'tag-green' : priorite === 'gris' ? 'tag-gray' : 'tag-amber';
                  const siClass = priorite === 'rouge' ? 'si-red' : priorite === 'vert' ? 'si-green' : priorite === 'gris' ? 'si-gray' : 'si-amber';
                  const label = priorite === 'rouge' ? 'Prioritaire' : priorite === 'vert' ? 'RAS' : priorite === 'gris' ? 'Manquant' : 'A verifier';
                  const icon = priorite === 'rouge' ? '!' : priorite === 'vert' ? 'v' : priorite === 'gris' ? '?' : '~';

                  return (
                    <div key={i} className="row">
                      <div className="row-left">
                        <div className={`status-icon ${siClass}`}>{icon}</div>
                        <div className="row-title">{m.match}</div>
                      </div>
                      <div className="row-motif">{m.motif}</div>
                      <div><span className={`row-tag ${tagClass}`}>{label}</span></div>
                      <div className="row-action" title={m.action}>{m.action}</div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function App() {
  const [utilisateur, setUtilisateur] = useState(null);
  const handleLogin = (user) => setUtilisateur(user);
  const handleLogout = () => setUtilisateur(null);

  if (!utilisateur) return <Login onLogin={handleLogin} />;
  return <Dashboard utilisateur={utilisateur} onLogout={handleLogout} />;
}

export default App;