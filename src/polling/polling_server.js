// src/polling/polling_server.js
const express = require("express");
const bodyParser = require("body-parser");
const { POLLING_PORT } = require("../common/config"); // なければ 3003 を直書きでもOK
const { log } = require("../common/logger");

const app = express();
app.use(bodyParser.json());

// RTT測定用のエンドポイント
app.post("/poll", (req, res) => {
  const { clientId, msgId, ts } = req.body || {};

  const serverTs = Date.now();

  const payload = {
    clientId,
    msgId,
    ts,        // クライアントが送ってきたタイムスタンプ
    serverTs,  // サーバ側で処理した時刻（必要なら後で使える）
    type: "pong",
  };

  log("polling_request", payload);
  console.log("POLL REQ:", payload);

  res.json(payload);
});

app.listen(POLLING_PORT, () => {
  console.log(
    `Polling RTT server running on http://localhost:${POLLING_PORT}/poll`
  );
});
