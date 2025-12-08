import ws from "k6/ws";
import { sleep } from "k6";
import { Trend } from "k6/metrics";

// ▼ RTTを記録するメトリクス
export const ws_rtt = new Trend("ws_rtt");

// ▼ 負荷条件
export const options = {
  vus: 10,
  duration: "15s",
};

export default function () {
  const url = "ws://localhost:3001";
  const params = { timeout: 20000 };

  // 仮想ユーザ専用ID
  const clientId = `vu-${__VU}`;

  // 送信メッセージごとのタイムスタンプを保持
  const pending = {};

  ws.connect(url, params, function (socket) {

    socket.on("open", () => {
      console.log(`CONNECTED: ${clientId}`);

      // 1秒ごとに ping を送信
      socket.setInterval(() => {
        const now = Date.now();
        const msgId = `${clientId}-${now}-${Math.random()}`;

        const payload = {
          clientId,
          msgId,
          ts: now,
          type: "ping",
        };

        pending[msgId] = now;

        const jsonStr = JSON.stringify(payload);
        console.log("SEND:", jsonStr);
        socket.send(jsonStr);

      }, 1000);
    });

    // ▼ メッセージ受信時
    socket.on("message", (msg) => {
      console.log("RECV:", msg);

      let data;
      try {
        data = JSON.parse(msg);
      } catch (e) {
        return;
      }

      // 自分のメッセージかチェック
      if (data.clientId === clientId && data.msgId && pending[data.msgId]) {
        const sentTime = pending[data.msgId];
        const now = Date.now();
        const rttVal = now - sentTime; // RTT(ms)

        ws_rtt.add(rttVal);
        console.log(`RTT(${clientId}): ${rttVal} ms`);

        delete pending[data.msgId];
      }
    });

    socket.on("error", (e) => console.log("ERROR:", e));
    socket.on("close", () => console.log("DISCONNECTED:", clientId));

    socket.setTimeout(() => {
      socket.close();
    }, 14000);
  });

  sleep(1);
}
