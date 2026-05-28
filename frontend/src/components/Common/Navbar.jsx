import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/api';

const styles = {
  nav: { background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 },
  logo: { fontSize: 22, fontWeight: 'bold', color: '#667eea', cursor: 'pointer' },
  links: { display: 'flex', gap: 16, alignItems: 'center' },
  link: { cursor: 'pointer', color: '#333', textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  btn: { background: '#667eea', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnOutline: { background: 'transparent', color: '#667eea', border: '2px solid #667eea', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', borderRadius: 12, padding: 30, width: 400, maxWidth: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, marginBottom: 12, boxSizing: 'border-box', fontSize: 14 },
  select: { width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, marginBottom: 12, boxSizing: 'border-box', fontSize: 14, background: '#fff' },
  submitBtn: { width: '100%', background: '#667eea', color: '#fff', border: 'none', padding: 12, borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 15, marginTop: 8 },
  tabRow: { display: 'flex', marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' },
  tab: { flex: 1, padding: '10px 0', textAlign: 'center', cursor: 'pointer', fontSize: 14, fontWeight: 500, background: '#f8f9fa' },
  tabActive: { flex: 1, padding: '10px 0', textAlign: 'center', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: '#667eea', color: '#fff' },
  switchText: { textAlign: 'center', fontSize: 13, color: '#667eea', cursor: 'pointer', marginTop: 12 },
};

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginRole, setLoginRole] = useState('patient');
  const [registerRole, setRegisterRole] = useState('patient');
  const [loginData, setLoginData] = useState({ email: '', mot_de_passe: '' });
  const [registerData, setRegisterData] = useState({ nom: '', prenom: '', email: '', telephone: '', specialite: '', carte_professionnelle: '', mot_de_passe: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const fn = loginRole === 'patient' ? auth.loginPatient : auth.loginMedecin;
      const { data } = await fn(loginData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setShowLogin(false);
      setLoginData({ email: '', mot_de_passe: '' });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const fn = registerRole === 'patient' ? auth.registerPatient : auth.registerMedecin;
      const { data } = await fn(registerData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setShowRegister(false);
      setRegisterData({ nom: '', prenom: '', email: '', telephone: '', specialite: '', carte_professionnelle: '', mot_de_passe: '' });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur d\'inscription');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigate('/')}>AINA</div>
        <div style={styles.links}>
          {user && (
            <>
              <span style={styles.link} onClick={() => navigate('/messagerie')}>Messagerie</span>
              {user.role === 'patient' && <span style={styles.link} onClick={() => navigate('/patient')}>Patient</span>}
              {user.role === 'medecin' && <span style={styles.link} onClick={() => navigate('/medecin')}>Médecin</span>}
              <span style={{ color: '#666', fontSize: 13 }}>{user.prenom || user.nom}</span>
              <button style={styles.btnOutline} onClick={handleLogout}>Déconnexion</button>
            </>
          )}
          {!user && (
            <>
              <button style={styles.btnOutline} onClick={() => setShowLogin(true)}>Connexion</button>
              <button style={styles.btn} onClick={() => setShowRegister(true)}>Inscription</button>
            </>
          )}
        </div>
      </nav>

      {showLogin && (
        <div style={styles.modalOverlay} onClick={() => setShowLogin(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Connexion</h2>
            <div style={styles.tabRow}>
              <div style={loginRole === 'patient' ? styles.tabActive : styles.tab} onClick={() => setLoginRole('patient')}>Patient</div>
              <div style={loginRole === 'medecin' ? styles.tabActive : styles.tab} onClick={() => setLoginRole('medecin')}>Médecin</div>
            </div>
            <form onSubmit={handleLogin}>
              <input style={styles.input} placeholder="Email" type="email" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
              <input style={styles.input} placeholder="Mot de passe" type="password" value={loginData.mot_de_passe} onChange={e => setLoginData({ ...loginData, mot_de_passe: e.target.value })} required />
              <button type="submit" style={styles.submitBtn}>Se connecter</button>
            </form>
            <div style={styles.switchText} onClick={() => { setShowLogin(false); setShowRegister(true); }}>Pas de compte ? S'inscrire</div>
          </div>
        </div>
      )}

      {showRegister && (
        <div style={styles.modalOverlay} onClick={() => setShowRegister(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Inscription</h2>
            <div style={styles.tabRow}>
              <div style={registerRole === 'patient' ? styles.tabActive : styles.tab} onClick={() => setRegisterRole('patient')}>Patient</div>
              <div style={registerRole === 'medecin' ? styles.tabActive : styles.tab} onClick={() => setRegisterRole('medecin')}>Médecin</div>
            </div>
            <form onSubmit={handleRegister}>
              <input style={styles.input} placeholder="Nom" value={registerData.nom} onChange={e => setRegisterData({ ...registerData, nom: e.target.value })} required />
              <input style={styles.input} placeholder="Prénom" value={registerData.prenom} onChange={e => setRegisterData({ ...registerData, prenom: e.target.value })} required />
              <input style={styles.input} placeholder="Email" type="email" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} required />
              <input style={styles.input} placeholder="Téléphone" value={registerData.telephone} onChange={e => setRegisterData({ ...registerData, telephone: e.target.value })} />
              {registerRole === 'medecin' && (
                <>
                  <input style={styles.input} placeholder="Spécialité" value={registerData.specialite} onChange={e => setRegisterData({ ...registerData, specialite: e.target.value })} />
                  <input style={styles.input} placeholder="Carte professionnelle" value={registerData.carte_professionnelle} onChange={e => setRegisterData({ ...registerData, carte_professionnelle: e.target.value })} />
                </>
              )}
              <input style={styles.input} placeholder="Mot de passe" type="password" value={registerData.mot_de_passe} onChange={e => setRegisterData({ ...registerData, mot_de_passe: e.target.value })} required />
              <button type="submit" style={styles.submitBtn}>S'inscrire</button>
            </form>
            <div style={styles.switchText} onClick={() => { setShowRegister(false); setShowLogin(true); }}>Déjà un compte ? Se connecter</div>
          </div>
        </div>
      )}
    </>
  );
}
