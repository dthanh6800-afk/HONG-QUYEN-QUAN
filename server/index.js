import { app } from "./app.js";
import { pool } from "./db.js";
if (!process.env.DATABASE_URL)
  throw new Error(
    "Missing DATABASE_URL. Copy .env.example to .env and configure PostgreSQL.",
  );
await pool.query("SELECT 1");
const server = app.listen(
  Number(process.env.PORT || 3000),
  process.env.HOST || "127.0.0.1",
  () => console.log("Website: http://localhost:" + (process.env.PORT || 3000)),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await pool.end();
      process.exit(0);
    }),
  );
