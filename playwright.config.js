import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(".tools/browsers"))
  process.env.PLAYWRIGHT_BROWSERS_PATH = resolve(".tools/browsers");
export default defineConfig({
  testDir: "./tests/browser",
  use: { baseURL: "http://127.0.0.1:3000", screenshot: "only-on-failure" },
  workers: 1,
  reporter: "list",
});
