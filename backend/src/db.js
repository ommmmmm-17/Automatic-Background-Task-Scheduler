import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const adapter = new JSONFile(path.join(dataDir, "db.json"));
export const db = new Low(adapter, { tasks: [], logs: [] });

export async function initDb() {
  await db.read();
  db.data ||= { tasks: [], logs: [] };
  if (db.data.tasks.length === 0) {
    db.data.tasks = [
      {
        id: "seed-1", name: "Echo Hello", command: "echo Hello from ABTS",
        priority: "Low", scheduleType: "interval", interval: 10000,
        cron: "", retries: 1, deps: [], paused: false, createdAt: Date.now(),
      },
      {
        id: "seed-2", name: "Disk Usage", command: process.platform === "win32" ? "wmic logicaldisk get size,freespace,caption" : "df -h",
        priority: "Medium", scheduleType: "cron", interval: 0,
        cron: "*/30 * * * * *", retries: 2, deps: [], paused: false, createdAt: Date.now(),
      },
      {
        id: "seed-3", name: "Date Stamp", command: process.platform === "win32" ? "echo %date% %time%" : "date",
        priority: "High", scheduleType: "interval", interval: 5000,
        cron: "", retries: 1, deps: [], paused: false, createdAt: Date.now(),
      },
    ];
    await db.write();
  }
}
