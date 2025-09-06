// server.mjs
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { connect } from "net";          // for TCP
import path from "path";
import { fileURLToPath } from "url";
import { SerialPort } from "serialport"; // for serial
import {
  MavLinkPacketSplitter,
  MavLinkPacketParser,
  minimal,
  common,
  ardupilotmega,
} from "node-mavlink";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HTTP + WebSocket setup
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;
httpServer.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
function broadcastJSON(obj) {
  // Convert BigInt to string
  const msg = JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

// MAVLink registry
const REGISTRY = { ...minimal.REGISTRY, ...common.REGISTRY, ...ardupilotmega.REGISTRY };


// 1️⃣ TCP example
const tcpClient = connect({ host: "127.0.0.1", port: 5762 });
tcpClient.on("connect", () => console.log("✅ TCP connected"));



// MAVLink parser setup
const reader = tcpClient.pipe(new MavLinkPacketSplitter()).pipe(new MavLinkPacketParser());

// Handle decoded MAVLink packets
reader.on("data", (packet) => {
  const clazz = REGISTRY[packet.header.msgid];
  if (!clazz) return;

  const data = packet.protocol.data(packet.payload, clazz);
  //console.log("Received packet:", data);

  broadcastJSON({ type: "mavlink", payload: data });
});
