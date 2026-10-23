const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const PID_FILE = path.join(__dirname, ".server.pid");
const PORT = 5000;
const DOCS_DIR = path.resolve(__dirname, "../../doc/_build/html");

function waitForServer(url, retries = 20, delay = 300) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http
        .get(url, () => resolve())
        .on("error", () => {
          if (retries-- > 0) setTimeout(attempt, delay);
          else reject(new Error(`Server at ${url} did not start in time`));
        });
    };
    attempt();
  });
}

module.exports = async function setup() {
  const server = spawn(
    "python3",
    ["-m", "http.server", String(PORT), "--directory", DOCS_DIR],
    { stdio: "ignore", detached: false },
  );
  fs.writeFileSync(PID_FILE, String(server.pid));
  await waitForServer(`http://localhost:${PORT}`);
};
