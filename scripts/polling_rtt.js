// scripts/polling_rtt.js
import http from "k6/http";
import { sleep } from "k6";
import { Trend } from "k6/metrics";

// HTTP Polling の往復遅延(RTT)を記録するメトリクス
export const polling_rtt = new Trend("polling_rtt");

// 負荷プロファイル（まずは軽め）
export const options = {
  vus: 10,
  duration: "15s",
};

export default function () {
  const url = "http://localhost:3003/poll"; // ポート番号はサーバ側と合わせる

  const clientId = `vu-${__VU}`;
  const now = Date.now();
  const msgId = `${clientId}-${now}-${Math.random()}`;

  const body = JSON.stringify({
    clientId,
    msgId,
    ts: now,
    type: "ping",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // RTT = リクエスト送信前〜レスポンス受信後までの時間
  const start = Date.now();
  const res = http.post(url, body, params);
  const end = Date.now();

  const rtt = end - start;
  polling_rtt.add(rtt);

  console.log(
    `POLLING RTT client=${clientId}, status=${res.status}, rtt=${rtt} ms`
  );

  // 1秒に1回リクエストするくらいのイメージ
  sleep(1);
}
