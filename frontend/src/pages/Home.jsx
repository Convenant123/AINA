import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  title: { fontSize: 48, fontWeight: 'bold', margin: 0 },
  subtitle: { fontSize: 18, opacity: 0.9, marginTop: 10, marginBottom: 40, textAlign: 'center', maxWidth: 500 },
  row: { display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  card: { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '40px 30px', borderRadius: 16, textAlign: 'center', minWidth: 200, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', transition: 'transform 0.2s' },
  btn: { background: '#fff', color: '#764ba2', border: 'none', padding: '12px 28px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 16, marginTop: 30 },
};

export default function Home({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>AINA</h1>
        <p style={styles.subtitle}>Application d'Information et de Navigation pour l'Aide à la santé à Madagascar</p>
        <p style={{ opacity: 0.8 }}><i className="fas fa-sign-in-alt" style={{ marginRight: 8 }} />Veuillez vous connecter ou créer un compte pour continuer</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}><i className="fas fa-home" style={{ marginRight: 12 }} />Bienvenue, {user.prenom || user.nom}</h1>
      <p style={styles.subtitle}><i className="fas fa-tachometer-alt" style={{ marginRight: 8 }} />Tableau de bord {user.role === 'patient' ? 'Patient' : 'Médecin'}</p>
      <div style={styles.row}>
        {user.role === 'patient' && (
          <div style={styles.card} onClick={() => navigate('/patient')}>
            <div style={{ fontSize: 36, marginBottom: 12 }}><i className="fas fa-hospital-user" /></div>
            <h3>Espace Patient</h3>
            <p style={{ fontSize: 14, opacity: 0.8 }}>Hôpitaux, pharmacies, alertes, rendez-vous</p>
          </div>
        )}
        {user.role === 'medecin' && (
          <div style={styles.card} onClick={() => navigate('/medecin')}>
            <div style={{ fontSize: 36, marginBottom: 12 }}><i className="fas fa-user-md" /></div>
            <h3>Espace Médecin</h3>
            <p style={{ fontSize: 14, opacity: 0.8 }}>Patients, rendez-vous, parcours de soins</p>
          </div>
        )}
        <div style={styles.card} onClick={() => navigate('/messagerie')}>
          <div style={{ fontSize: 36, marginBottom: 12 }}><i className="fas fa-comments" /></div>
          <h3>Messagerie</h3>
          <p style={{ fontSize: 14, opacity: 0.8 }}>Échangez avec votre médecin ou patient</p>
        </div>
      </div>
      <button style={styles.btn} onClick={handleLogout}><i className="fas fa-sign-out-alt" style={{ marginRight: 8 }} />Déconnexion</button>
    </div>
  );
}
