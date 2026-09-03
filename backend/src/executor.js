import { exec } from "child_process";
import { db } from "./db.js";
import { nanoid } from "nanoid";

const running = new Set();
export function isRunning(taskId) { return running.has(taskId); }
export function runningCount() { return running.size; }

export async function executeTask(task, attempt = 1) {
  if (running.has(task.id)) return;
  running.add(task.id);
  const logId = nanoid(8);
  const startedAt = Date.now();
  const log = {
    id: logId, taskId: task.id, taskName: task.name,
    status: "Running", startedAt, finishedAt: null, durationMs: 0,
    attempt, output: "", error: "",
  };
  db.data.logs.unshift(log);
  if (db.data.logs.length > 500) db.data.logs.pop();
  await db.write();

  return new Promise((resolve) => {
    exec(task.command, { timeout: 60_000, windowsHide: true }, async (err, stdout, stderr) => {
      const finishedAt = Date.now();
      log.finishedAt = finishedAt;
      log.durationMs = finishedAt - startedAt;
      log.output = (stdout || "").slice(0, 4000);
      log.error = (stderr || "").slice(0, 2000);
      if (err) {
        log.status = "Failed";
        if (attempt < (task.retries || 1)) {
          await db.write();
          running.delete(task.id);
          setTimeout(() => executeTask(task, attempt + 1), 1500);
          return resolve();
        }
      } else {
        log.status = "Success";
      }
      await db.write();
      running.delete(task.id);
      resolve();
    });
  });
}
