// scripts/sse_latency.js
import sse from "k6/x/sse";
import { Trend } from "k6/metrics";

export const sse_latency = new Trend("sse_latency");

// 負荷プロファイル（まずは軽め）
export const options = {
  vus: 10,
  duration: "15s",
};

export default function () {
  const url = "http://localhost:3002/events"; // SSE サーバのURL
  const params = {
    headers: {
      Accept: "text/event-stream",
    },
  };

  // この VU が何個イベントを見るか
  const MAX_EVENTS = 10;
  let count = 0;

  // SSE 接続を張ってイベントを受信
  const res = sse.open(url, params, function (client) {
    client.on("open", function () {
      console.log("SSE connected");
    });

    client.on("event", function (event) {
      // event.data はサーバで JSON.stringify した文字列
      try {
        const data = JSON.parse(event.data);
        if (data && data.ts) {
          const now = Date.now();
          const delay = now - data.ts; // 片方向の遅延

          sse_latency.add(delay);
          console.log(`SSE event seq=${data.seq}, latency=${delay} ms`);

          count++;
          if (count >= MAX_EVENTS) {
            client.close(); // このVUはここで終了
          }
        }
      } catch (e) {
        console.log("Invalid SSE data:", event.data);
      }
    });

    client.on("error", function (e) {
      console.log("SSE error:", e.error());
      client.close();
    });
  });

  // 接続エラーなど
  if (!res) {
    console.log("SSE connection failed");
  }
}
