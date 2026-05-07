import React, { useState } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'fff@ster-ai.com' && password === 'fff2026') {
      onLogin({ email, nom: 'FFF — Direction Compétitions Nationales' });
    } else {
      setErreur('Email ou mot de passe incorrect');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '400px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '24px', marginBottom: '4px' }}>Ster-AI</h1>
        <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px' }}>Plateforme d'automatisation par IA</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#444', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#444', marginBottom: '6px' }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {erreur && (
            <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '16px' }}>{erreur}</p>
          )}

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer' }}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;