import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://tictactyler.com");

function SocketTest() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    socket.on("testResponse", (data) => {
      setLastMessage(data);
      console.log("Received test response:", data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("testResponse");
    };
  }, []);

  const sendTestEvent = () => {
    console.log("Sending test event");
    socket.emit("test", "Hello from client!");
  };

  return (
    <div>
      <p>Connected: {"" + isConnected}</p>
      <p>Last message: {lastMessage || "-"}</p>
      <button onClick={sendTestEvent}>Send Test Event</button>
    </div>
  );
}

export default SocketTest;
