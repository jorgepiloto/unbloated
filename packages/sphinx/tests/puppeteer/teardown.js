const fs = require("fs");
const path = require("path");

const PID_FILE = path.join(__dirname, ".server.pid");

module.exports = async function teardown() {
  if (fs.existsSync(PID_FILE)) {
    const pid = parseInt(fs.readFileSync(PID_FILE, "utf8"), 10);
    try {
      process.kill(pid);
    } catch (_) {}
    fs.unlinkSync(PID_FILE);
  }
};
