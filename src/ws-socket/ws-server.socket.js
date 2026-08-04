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
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    sendJson(socket, { type: "welcome" });

    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    })
  }, 3000);

  wss.on("close", () => {
    clearInterval(interval);
  });


  function broadcastMatchCreated(match) {
    broadcast(wss, {
      type: "match_created",
      data: match,
    });
  }

  return { broadcastMatchCreated };
}
