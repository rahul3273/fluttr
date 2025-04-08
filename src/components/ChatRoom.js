import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function ChatRoom({ config }) {
  const localRef = useRef();
  const remoteRef = useRef();
  const peerRef = useRef(new RTCPeerConnection());

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localRef.current.srcObject = stream;
      peerRef.current.addStream(stream);

      peerRef.current.ontrack = (event) => {
        remoteRef.current.srcObject = event.streams[0];
      };

      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) socket.emit('candidate', event.candidate);
      };

      peerRef.current.createOffer().then((offer) => {
        peerRef.current.setLocalDescription(offer);
        socket.emit('offer', offer);
      });
    });

    socket.on('offer', async (offer) => {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit('answer', answer);
    });

    socket.on('answer', (answer) => {
      peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('candidate', (candidate) => {
      peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });
  }, []);

  const handleSkip = () => {
    window.location.reload();
  };

  const handleReport = () => {
    alert('User reported.');
  };

  return (
    <div>
      <h2>You're chatting with a stranger!</h2>
      <video ref={localRef} autoPlay muted width="300" />
      <video ref={remoteRef} autoPlay width="300" />
      <br />
      <button onClick={handleSkip}>Skip</button>
      <button onClick={handleReport}>Report</button>
    </div>
  );
}

export default ChatRoom;
