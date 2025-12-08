# 📡 Communication Benchmark System  
WebSocket / SSE / HTTP Polling — 3方式の通信遅延とスケーラビリティを比較する計測環境

## 📘 概要
本リポジトリは、以下の 3 種類のリアルタイム通信方式を **統一アプリケーション上で比較・計測するためのベンチマーク環境**です。

- **WebSocket (双方向通信)**
- **Server-Sent Events / SSE (片方向 push 通信)**
- **HTTP Polling (周期リクエストによる疑似リアルタイム通信)**

すべて Node.js で実装し、負荷試験には **k6** を使用しています。

---

## 🎓 研究目的（卒業研究）
リアルタイム通信において一般的には「WebSocket が最も優れている」と語られるが、  
**用途や負荷条件によって最適な通信方式は異なるのではないか？**  
という疑問に基づき、以下を科学的に評価する。

### 🔍 評価項目
- **RTT（往復遅延）**
- **接続安定性 / メッセージロス**
- **スループット**
- **スケーラビリティ（接続数増加時の劣化度）**
- **コスト（トラフィック量）**

本研究では、  
**「用途ごとに最適な通信方式を選定するための客観的指標」を示すこと**  
を目的とする。

---

## 🛠 実装されている通信方式

### 1. WebSocket（ws）
双方向で低遅延。ゲーム・チャット向け。

- 送受信 JSON メッセージ  
- RTT 測定のため msgId と timestamp(ts) をエコーバック  
- k6 で高頻度の ping/pong を送信して遅延計測

### 2. SSE（Server-Sent Events）
サーバ → クライアントの片方向。疎な通知・ストリーミング向け。

- EventSource を用いたイベント push  
- RTT は片方向遅延（実質 latency 測定）

### 3. HTTP Polling
一定周期でサーバを叩く最もシンプルな方式。

- 揮発的・非リアルタイム用途では依然重要  
- RTT は request → response の往復時間

---

## 📁 ディレクトリ構成

```text
soturon/
├── scripts/            # k6 の負荷試験スクリプト
│   ├── ws_rtt.js       # WebSocket RTT測定
│   ├── sse_latency.js  # SSE latency測定
│   ├── polling_rtt.js  # Polling RTT測定
│   └── ...
│
├── src/
│   ├── common/         # ロガー・設定
│   ├── ws/             # WebSocket サーバ
│   ├── sse/            # SSE サーバ
│   └── polling/        # Polling サーバ
│
├── tests/
│   ├── ws_client.html
│   ├── sse_client.html
│   └── polling_client.html
│
├── package.json
├── package-lock.json
└── .gitignore
