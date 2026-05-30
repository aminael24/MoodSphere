import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL = "http://localhost:5000";

export function getSocket() {
  const token = localStorage.getItem("ms_token");

  if (!token) {
    console.warn("Socket non connecté : aucun token trouvé");
    return null;
  }

  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Socket connecté :", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket déconnecté :", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Erreur Socket.IO :", error.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}