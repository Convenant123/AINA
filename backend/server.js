const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const medecinRoutes = require('./routes/medecinRoutes');
const messageRoutes = require('./routes/messageRoutes');
const sysInfoRoutes = require('./routes/sysInfoRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(cors());
app.use(express.json());
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('join_medecin', (medecinId) => {
    socket.join(`medecin_${medecinId}`);
  });

  socket.on('join_patient', (patientId) => {
    socket.join(`patient_${patientId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/medecin', medecinRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sysinfo', sysInfoRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur AINA démarré sur le port ${PORT}`);
});
