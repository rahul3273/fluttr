let waitingUser = null;

const handleMatching = (io, socket) => {
  if (waitingUser) {
    const roomId = `${waitingUser.id}-${socket.id}`;
    socket.join(roomId);
    waitingUser.join(roomId);

    // Notify both users
    socket.emit('matched', { roomId, peerId: waitingUser.id });
    waitingUser.emit('matched', { roomId, peerId: socket.id });

    waitingUser = null; // reset
  } else {
    waitingUser = socket;
  }

  // Forward signaling data for WebRTC
  socket.on('signal', ({ roomId, data }) => {
    socket.to(roomId).emit('signal', { data, from: socket.id });
  });
};

module.exports = { handleMatching };
