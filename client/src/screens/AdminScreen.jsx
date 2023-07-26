import React, { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player";

export default function AdminScreen() {
  const [stream, setStream] = useState();
  const socket = io("http://192.168.1.77:5500");

  const peer = useRef(new RTCPeerConnection());

  useEffect(() => {
    peer.current.addEventListener("track", (track) => {
      setStream(track.streams[0]);
    });
  }, []);

  const handleSocketOffer = useCallback(
    async (clientSDP) => {
      await peer.current.setRemoteDescription(clientSDP);

      // create an answer and send the answer to client
      const sdp = await peer.current.createAnswer();
      await peer.current.setLocalDescription(sdp);
      socket.emit("answer", peer.current.localDescription);
    },
    [socket]
  );

  const handlePeerIceCandidate = useCallback(
    (event) => {
      if (event.candidate) {
        // send the candidate to client
        socket.emit("icecandidate", event.candidate);
      }
    },
    [socket]
  );

  const handleSocketIceCandidate = useCallback(async (candidate) => {
    // get candidate from client
    await peer.current.addIceCandidate(new RTCIceCandidate(candidate));
  }, []);

  useEffect(() => {
    // listen to `offer` event from client (actually from server)
    socket.on("offer", handleSocketOffer);
    socket.on("icecandidate", handleSocketIceCandidate);

    /** Exchange ice candidate */
    peer.current.addEventListener("icecandidate", handlePeerIceCandidate);

    return () => {
      socket.off("offer", handleSocketOffer);
      socket.off("icecandidate", handleSocketIceCandidate);
    };
  }, [
    socket,
    handleSocketOffer,
    handleSocketIceCandidate,
    handlePeerIceCandidate,
  ]);
  return (
    <div>
      {stream && <ReactPlayer url={stream} playing controls={false} muted />}
    </div>
  );
}
