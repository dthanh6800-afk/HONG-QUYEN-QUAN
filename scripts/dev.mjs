import { spawn } from "node:child_process";
const children = [
  spawn(process.execPath, ["--env-file=.env", "--watch", "server/index.js"], {
    stdio: "inherit",
  }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js"], {
    stdio: "inherit",
  }),
];
process.on("SIGINT", () => children.forEach((child) => child.kill()));
