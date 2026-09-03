import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import { startMonitor } from "./monitor.js";
import { startScheduler } from "./scheduler.js";
import routes from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", routes);

const PORT = process.env.PORT || 4000;

await initDb();
startMonitor();
startScheduler();

app.listen(PORT, () => {
  console.log(`\n🚀 ABTS backend running on http://localhost:${PORT}\n`);
});
