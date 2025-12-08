// src/ws/ws_server.js
const http = require("http");
const WebSocket = require("ws");
const { WS_PORT } = require("../common/config");
const { log } = require("../common/logger");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  log("ws_connect", {});

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch (e) {
      console.log("SERVER RECV (INVALID JSON):", msg.toString());
      return;
    }

    console.log("SERVER RECV JSON:", data);

    // RTT用に必要最低限の項目をそのまま返す
    const payload = {
      clientId: data.clientId,
      msgId: data.msgId,
      ts: data.ts,
      type: "pong",
    };

    const jsonStr = JSON.stringify(payload);

    console.log("SERVER SEND:", jsonStr);
    ws.send(jsonStr);
  });

  ws.on("close", () => {
    log("ws_disconnect", {});
  });

  ws.on("error", (err) => {
    log("ws_error", { error: err.message });
  });
});

server.listen(WS_PORT, () => {
  console.log(`WebSocket RTT server running on ws://localhost:${WS_PORT}`);
});
