import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

export default function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    if (!isVerified) return;
    const s = io('http://localhost:5000');
    setSocket(s);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;
      s.emit('join', {});
    });

    s.on('offer', handleOffer);
    s.on('answer', handleAnswer);
    s.on('ice-candidate', handleNewICECandidate);

    return () => {
      s.disconnect();
      if (peerRef.current) peerRef.current.close();
    };
  }, [isVerified]);

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peer.onicecandidate = e => {
      if (e.candidate) socket.emit('ice-candidate', { to: socket.id, candidate: e.candidate });
    };

    peer.ontrack = e => {
      setRemoteStream(e.streams[0]);
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    peerRef.current = peer;
    return peer;
  };

  const handleOffer = async (offer) => {
    const peer = createPeer();
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('answer', { to: socket.id, answer });
  };

  const handleAnswer = async (answer) => {
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleNewICECandidate = async (candidate) => {
    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  };

  const startNextChat = () => {
    if (peerRef.current) peerRef.current.close();
    socket.emit('join', {});
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">🔞 Fluttr is 18+ Only</h1>
        <p className="mb-4">You must be 18 years or older to use this site.</p>
        <button
          onClick={() => setIsVerified(true)}
          className="px-4 py-2 bg-pink-600 rounded-full"
        >
          I am 18 or older
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Fluttr 💕</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <video ref={localVideoRef} autoPlay muted className="rounded-lg w-full h-64 bg-black" />
        <video ref={remoteVideoRef} autoPlay className="rounded-lg w-full h-64 bg-black" />
      </div>
      <button onClick={startNextChat} className="mt-4 px-4 py-2 bg-pink-500 rounded-full hover:bg-pink-600">Next</button>
    </div>
  );
}
