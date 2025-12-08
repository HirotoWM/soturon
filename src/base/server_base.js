// src/base/server_base.js
// 最小のHTTPベースサーバ（/join, /send）
// 実験の共通インターフェースのイメージ用

const express = require('express');
const bodyParser = require('body-parser');
const { BASE_PORT } = require('../common/config');
const { log } = require('../common/logger');

const app = express();
app.use(bodyParser.json());

// 参加中クライアント（簡易管理）
let clients = [];

app.post('/join', (req, res) => {
  const clientId = Date.now().toString();
  clients.push(clientId);
  log('base_join', { clientId, total: clients.length });
  res.json({ clientId });
});

app.post('/send', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  log('base_send', { message });
  res.json({ ok: true });
});

app.listen(BASE_PORT, () => {
  log('base_start', { port: BASE_PORT });
  console.log(`Base server running on http://localhost:${BASE_PORT}`);
});
