// src/sse/sse_server.js
const http = require("http");
const { SSE_PORT } = require("../common/config"); // なければ 3002 などを直書きでもOK
const { log } = require("../common/logger");

const clients = new Set();

const server = http.createServer((req, res) => {
  if (req.url === "/events") {
    // SSE 接続確立
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    clients.add(res);
    log("sse_connect", { total: clients.size });
    console.log("SSE client connected, total:", clients.size);

    // 接続確認用イベント
    res.write(`event: init\ndata: "connected"\n\n`);

    // 接続クローズ時
    req.on("close", () => {
      clients.delete(res);
      log("sse_disconnect", { total: clients.size });
      console.log("SSE client disconnected, total:", clients.size);
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

// 1秒ごとに全クライアントへイベント送信
let seq = 0;
setInterval(() => {
  if (clients.size === 0) return;

  const payload = {
    ts: Date.now(), // サーバ送信時刻
    seq: ++seq,     // 通し番号
    type: "tick",
  };
  const data = JSON.stringify(payload);

  for (const client of clients) {
    client.write(`event: msg\ndata: ${data}\n\n`);
  }

  log("sse_broadcast", { seq, clients: clients.size });
}, 1000);

server.listen(SSE_PORT, () => {
  console.log(`SSE latency server running on http://localhost:${SSE_PORT}/events`);
});
