import ws from "k6/ws";
import { check, sleep } from "k6";

export const options = {
  vus: 10,          // 仮想ユーザ数（まずは10）
  duration: "10s",  // テスト時間
};

export default function () {
  const url = "ws://localhost:3001";  // あなたのWSサーバ
  const params = { timeout: 20000 };

  ws.connect(url, params, function (socket) {
    socket.on("open", function () {
      console.log("connected");
      socket.send("hello from k6 client");
    });

    socket.on("message", function (msg) {
      console.log("received:", msg);
      check(msg, {
        "echo received": (v) => v.length > 0,
      });
    });

    socket.on("close", () => console.log("disconnected"));

    socket.on("error", (e) => console.error("error:", e));

    // メッセージを何度か送ってみる
    socket.setInterval(() => {
      socket.send("ping");
    }, 1000);

    // 仮想ユーザが何秒生きるか
    socket.setTimeout(() => {
      socket.close();
    }, 5000);
  });

  sleep(1);
}
