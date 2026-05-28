import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import Home from './pages/Home';
import PatientPage from './pages/PatientPage';
import DoctorPage from './pages/DoctorPage';
import MessagingPage from './pages/MessagingPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/medecin" element={user?.role === 'medecin' ? <DoctorPage user={user} /> : <Navigate to="/" />} />
        <Route path="/patient" element={user?.role === 'patient' ? <PatientPage user={user} /> : <Navigate to="/" />} />
        <Route path="/messagerie" element={user ? <MessagingPage user={user} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
