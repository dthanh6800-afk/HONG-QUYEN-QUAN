import EmbeddedPostgres from "embedded-postgres";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
const envPath = resolve(".env");
if (!existsSync(envPath)) {
  const password = randomBytes(24).toString("base64url");
  const dbPassword = randomBytes(24).toString("base64url");
  writeFileSync(
    envPath,
    `DATABASE_URL=postgresql://tea:${dbPassword}@localhost:54329/tea\nPORT=3000\nHOST=127.0.0.1\nADMIN_EMAIL=admin@example.com\nADMIN_PASSWORD=${password}\n`,
  );
  console.log(
    "Created .env with random local credentials. Open .env to view your admin login.",
  );
}
process.loadEnvFile(envPath);
const url = new URL(process.env.DATABASE_URL);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || url.port !== "54329")
  throw new Error(
    "db:local only manages localhost:54329. Use your external PostgreSQL service for other URLs.",
  );
const pg = new EmbeddedPostgres({
  databaseDir: resolve(".postgres"),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  port: 54329,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (message) => console.error(String(message)),
});
if (!existsSync(resolve(".postgres/PG_VERSION"))) await pg.initialise();
else
  console.log(
    "Reusing PostgreSQL " +
      readFileSync(resolve(".postgres/PG_VERSION"), "utf8").trim(),
  );
await pg.start();
const client = pg.getPgClient();
await client.connect();
const database = decodeURIComponent(url.pathname.slice(1));
if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(database))
  throw new Error("Invalid local database name");
if (
  !(
    await client.query("SELECT 1 FROM pg_database WHERE datname=$1", [database])
  ).rowCount
)
  await pg.createDatabase(database);
await client.end();
console.log(
  "Local PostgreSQL ready on 127.0.0.1:54329. Keep this terminal open.",
);
const keepAlive = setInterval(() => {}, 60000);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    clearInterval(keepAlive);
    await pg.stop();
    process.exit(0);
  });
