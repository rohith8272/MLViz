
# MAVLink WebSocket Server

This project creates a WebSocket server using **Express** and **WS** to communicate with MAVLink-enabled devices over a serial connection/TCP/UDP.

## Setup

1. Initialize the project:
   ```bash
   npm init -y
   npm install --save node-mavlink serialport
   npm install express ws
   npm start
   ```

---

2. **Add Scripts in `package.json`**
Open `package.json` and add:
```json
"scripts": {
  "start": "node server.js"
}
```