import React, { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    // listen to `offer` event from client (actually from server)
    socket.on("offer", async (clientSDP) => {
      await peer.current.setRemoteDescription(clientSDP);

      // create an answer and send the answer to client
      const sdp = await peer.createAnswer();
      await peer.current.setLocalDescription(sdp);
      socket.emit("answer", peer.current.localDescription);
    });

    /** Exchange ice candidate */
    peer.current.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        // send the candidate to client
        socket.emit("icecandidate", event.candidate);
      }
    });
    socket.on("icecandidate", async (candidate) => {
      // get candidate from client
      await peer.current.addIceCandidate(new RTCIceCandidate(candidate));
    });
  }, [socket]);
  return (
    <div>
      {stream && <ReactPlayer url={stream} playing controls={false} muted />}
    </div>
  );
}
