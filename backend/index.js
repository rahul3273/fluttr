const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

let waitingUser = null;

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  if (waitingUser) {
    // Match the current user with the waiting user
    socket.partnerId = waitingUser.id;
    waitingUser.partnerId = socket.id;

    socket.emit('match-found', { partnerId: waitingUser.id });
    waitingUser.emit('match-found', { partnerId: socket.id });

    waitingUser = null; // Reset queue
  } else {
    // No one to match with yet
    waitingUser = socket;
  }

  socket.on('offer', ({ offer, to }) => {
    io.to(to).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ answer, to }) => {
    io.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('candidate', ({ candidate, to }) => {
    io.to(to).emit('candidate', { candidate, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);

    // Clean up if user was waiting
    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }

    // Inform partner if matched
    if (socket.partnerId) {
      io.to(socket.partnerId).emit('partner-disconnected');
    }
  });
});

server.listen(5000, () => {
  console.log('🚀 Backend running at http://localhost:5000');
});
