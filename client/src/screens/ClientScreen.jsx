import React, { useCallback, useEffect, useRef } from "react";
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
      peer.current.setLocalDescription(sdp).then(() => {
        socket.emit("offer", peer.current.localDescription);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSocketAnswer = useCallback(async (adminSDP) => {
    peer.current.setRemoteDescription(adminSDP);
  }, []);

  const handleSocketIceCandidate = useCallback(async (candidate) => {
    // get candidate from admin
    await peer.current.addIceCandidate(new RTCIceCandidate(candidate));
  }, []);

  const handlePeerIceCandidate = useCallback(
    (event) => {
      if (event.candidate) {
        // send the candidate to admin
        socket.emit("icecandidate", event.candidate);
      }
    },
    [socket]
  );

  useEffect(() => {
    // listen to `answer` event
    socket.on("answer", handleSocketAnswer);
    socket.on("icecandidate", handleSocketIceCandidate);

    /** Exchange ice candidate */
    peer.current.addEventListener("icecandidate", handlePeerIceCandidate);

    return () => {
      socket.off("answer", handleSocketAnswer);
      socket.off("icecandidate", handleSocketIceCandidate);
    };
  }, [
    socket,
    handleSocketAnswer,
    handleSocketIceCandidate,
    handlePeerIceCandidate,
  ]);

  return (
    <div>
      <button onClick={handleStreamButton}>Stream</button>
    </div>
  );
}
