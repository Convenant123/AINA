import React, { useState, useEffect, useRef } from 'react';
import { messageApi, medecinApi, patientApi } from '../services/api';

const styles = {
  container: { maxWidth: 900, margin: '0 auto', padding: 20, display: 'flex', gap: 20, height: 'calc(100vh - 100px)' },
  sidebar: { width: 280, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  main: { flex: 1, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: 16, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 16 },
  contactItem: { padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', transition: 'background 0.2s' },
  contactItemActive: { padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', background: '#e7f3ff', fontWeight: 600 },
  chatHeader: { padding: 16, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 16 },
  messages: { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 },
  msgSent: { alignSelf: 'flex-end', background: '#0d6efd', color: '#fff', padding: '10px 14px', borderRadius: '12px 12px 4px 12px', maxWidth: '70%' },
  msgReceived: { alignSelf: 'flex-start', background: '#f0f0f0', color: '#333', padding: '10px 14px', borderRadius: '12px 12px 12px 4px', maxWidth: '70%' },
  inputArea: { padding: 16, borderTop: '1px solid #eee', display: 'flex', gap: 8 },
  input: { flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 },
  sendBtn: { background: '#0d6efd', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  formCard: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20, margin: 16 },
  formInput: { width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 5, marginBottom: 10, boxSizing: 'border-box' },
  formTextarea: { width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 5, marginBottom: 10, boxSizing: 'border-box', minHeight: 80, resize: 'vertical' },
  formBtn: { background: '#0d6efd', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
};

export default function MessagingPage({ user }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [formData, setFormData] = useState({ sujet: '', message: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    try {
      if (user.role === 'medecin') {
        const { data: patients } = await medecinApi.getPatients();
        setContacts(patients);
      } else {
        const { data: rendezVous } = await patientApi.getRendezVous();
        const medecins = rendezVous
          .filter(rv => rv.medecin_id)
          .map(rv => ({
            id: rv.medecin_id,
            nom: rv.medecin_nom,
            prenom: rv.medecin_prenom,
            specialite: rv.specialite,
          }));
        const unique = medecins.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
        setContacts(unique);
      }
    } catch {
      setContacts([]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      const { data } = await messageApi.conversation(contact.id);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedContact?.id) return;
    try {
      await messageApi.send({
        destinataire_id: selectedContact.id,
        contenu: text,
      });
      setMessages([...messages, {
        contenu: text,
        patient_id: user.role === 'patient' ? user.id : selectedContact.id,
        medecin_id: user.role === 'medecin' ? user.id : selectedContact.id,
        date_envoi: new Date().toISOString(),
      }]);
      setText('');
    } catch {}
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sujet || !formData.message) return alert('Veuillez remplir tous les champs');
    try {
      if (contacts.length > 0) {
        await messageApi.send({
          destinataire_id: contacts[0].id,
          contenu: `[${formData.sujet}] ${formData.message}`,
        });
        alert('Message envoyé');
        setFormData({ sujet: '', message: '' });
        loadContacts();
      }
    } catch {}
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <i className="fas fa-comments" style={{ marginRight: 8 }} />
          {user.role === 'patient' ? 'Nouveau message' : 'Conversations'}
        </div>
        {user.role === 'patient' && contacts.length === 0 && (
          <div style={styles.formCard}>
            <form onSubmit={handleFormSubmit}>
              <input style={styles.formInput} placeholder="Sujet" value={formData.sujet} onChange={e => setFormData({ ...formData, sujet: e.target.value })} />
              <textarea style={styles.formTextarea} placeholder="Votre message..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
              <button type="submit" style={styles.formBtn}>
                <i className="fas fa-paper-plane" style={{ marginRight: 6 }} /> Envoyer
              </button>
            </form>
          </div>
        )}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {contacts.map((c) => {
            const name = `${c.prenom || ''} ${c.nom || ''}`.trim() || 'Contact';
            return (
              <div key={c.id} style={selectedContact?.id === c.id ? styles.contactItemActive : styles.contactItem} onClick={() => selectContact(c)}>
                <i className="fas fa-user-circle" style={{ marginRight: 8, color: '#667eea' }} />
                {name}
                <br /><span style={{ fontSize: 12, color: '#999', marginLeft: 22 }}>{c.specialite || c.telephone || ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.main}>
        {selectedContact ? (
          <>
            <div style={styles.chatHeader}>
              <i className="fas fa-user-circle" style={{ marginRight: 8, color: '#667eea' }} />
              {selectedContact.prenom} {selectedContact.nom}
            </div>
            <div style={styles.messages}>
              {messages.length === 0 && <p style={{ color: '#999', textAlign: 'center', marginTop: 40 }}><i className="fas fa-inbox" style={{ marginRight: 6 }} />Aucun message. Commencez la conversation.</p>}
              {messages.map((m, i) => {
                const isMine = (user.role === 'patient' && m.patient_id === user.id) ||
                              (user.role === 'medecin' && m.medecin_id === user.id);
                return (
                  <div key={i} style={isMine ? styles.msgSent : styles.msgReceived}>
                    <div>{m.contenu}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                      {new Date(m.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputArea}>
              <input style={styles.input} value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Votre message..." />
              <button style={styles.sendBtn} onClick={sendMessage}>
                <i className="fas fa-paper-plane" style={{ marginRight: 6 }} /> Envoyer
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
            <i className="fas fa-comment-dots" style={{ fontSize: 48, opacity: 0.3, marginRight: 16 }} />
            <span>Sélectionnez un contact pour commencer à discuter</span>
          </div>
        )}
      </div>
    </div>
  );
}
