// src/common/logger.js
// 実験結果用に機械可読なログを出すシンプルロガー

function log(type, detail = {}) {
  const ts = new Date().toISOString();
  const record = { ts, type, ...detail };
  console.log(JSON.stringify(record));
}

module.exports = { log };
