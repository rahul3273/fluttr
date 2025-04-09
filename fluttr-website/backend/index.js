// backend/index.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// Optional: Uncomment and set up Firebase Admin SDK if needed
// const admin = require('firebase-admin');
// const serviceAccount = require('./firebase-adminsdk.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const users = {}; // { socketId: { gender, interests, ... } }
const matches = {}; // { socketId: matchedSocketId }

// Matchmaking function
function findMatch(socketId) {
  const currentUser = users[socketId];
  if (!currentUser) return null;

  for (let id in users) {
    if (
      id !== socketId &&
      !matches[id] &&
      !Object.values(matches).includes(id) &&
      users[id].gender !== currentUser.gender && // simple opposite-gender match
      users[id].interests.some((i) => currentUser.interests.includes(i)) // match interests
    ) {
      return id;
    }
  }
  return null;
}

io.on('connection', (socket) => {
  console.log('🔌 New socket connected:', socket.id);

  socket.on('join', (userData) => {
    users[socket.id] = userData;
    const matchId = findMatch(socket.id);
    if (matchId) {
      matches[socket.id] = matchId;
      matches[matchId] = socket.id;

      io.to(socket.id).emit('matchFound', { peerId: matchId });
      io.to(matchId).emit('matchFound', { peerId: socket.id });
    }
  });

  socket.on('sendMessage', ({ to, message }) => {
    io.to(to).emit('receiveMessage', {
      from: socket.id,
      message,
    });
  });

  socket.on('sendSignal', ({ to, signal }) => {
    io.to(to).emit('receiveSignal', { from: socket.id, signal });
  });

  socket.on('reportUser', (reportedSocketId) => {
    console.log(`⚠️ User ${reportedSocketId} reported by ${socket.id}`);
    io.to(reportedSocketId).emit('reported');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
    const partnerId = matches[socket.id];

    if (partnerId) {
      io.to(partnerId).emit('partnerDisconnected');
      delete matches[partnerId];
    }

    delete matches[socket.id];
    delete users[socket.id];
  });
});

app.get('/', (req, res) => {
  res.send('✅ Fluttr backend is running.');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
