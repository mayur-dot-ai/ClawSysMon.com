const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

function getOpenClawStatus() {
  return new Promise((resolve) => {
    exec('pgrep -f "openclaw" | head -1', (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve({ online: false, pid: null });
      } else {
        resolve({ online: true, pid: stdout.trim() });
      }
    });
  });
}

app.get("/api/status", async (req, res) => {
  const status = await getOpenClawStatus();
  res.json(status);
});

app.post("/api/revive", (req, res) => {
  exec("openclaw gateway restart", (error) => {
    if (error) {
      res.status(500).json({ error: "Failed to restart", details: error.message });
    } else {
      res.json({ success: true, message: "OpenClaw restart initiated" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`ClawSysMon Core running on port ${PORT}`);
});