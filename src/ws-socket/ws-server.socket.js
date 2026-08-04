import { WebSocket, WebSocketServer } from "ws";

export function sendJson(socket, payload) {
  if(socket.readyState !== WebSocket.OPEN) {
    return; // Socket is not open, do not send
  }

  socket.send(JSON.stringify(payload));
}

// it will be used to broadcast messages to all connected clients
export function broadcast(wss, payload) {
  for(const client of wss.clients) {
    if(client.readyState !== WebSocket.OPEN) {
      continue; // skip clients that are not open
    }
    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024, // 1MB
  });

  wss.on("connection", (socket) => {
    sendJson(socket, { type: "welcome" });

    socket.on("error", console.error);
  });

  function broadcastMatchCreated(match) {
    broadcast(wss, {
      type: "match_created",
      data: match,
    });
  }

  return { broadcastMatchCreated };
}
