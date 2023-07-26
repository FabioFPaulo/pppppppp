import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function ClientScreen() {
  const socket = io("http://192.168.1.77:5500");

  const peer = useRef(new RTCPeerConnection());

  const handleStreamButton = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true,
        preferCurrentTab: true,
      });

      peer.current.addTrack(stream.getVideoTracks()[0], stream);

      const sdp = await peer.current.createOffer();
      await peer.current.setLocalDescription(sdp);
      socket.emit("offer", peer.current.localDescription);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // listen to `answer` event
    socket.on("answer", async (adminSDP) => {
      peer.current.setRemoteDescription(adminSDP);
    });

    /** Exchange ice candidate */
    peer.current.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        // send the candidate to admin
        socket.emit("icecandidate", event.candidate);
      }
    });
    socket.on("icecandidate", async (candidate) => {
      // get candidate from admin
      await peer.current.addIceCandidate(new RTCIceCandidate(candidate));
    });
  }, [socket]);

  return (
    <div>
      <button onClick={handleStreamButton}>Stream</button>
    </div>
  );
}
