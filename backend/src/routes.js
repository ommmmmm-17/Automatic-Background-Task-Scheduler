import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "./db.js";
import { scheduleTask, unscheduleTask, runNow, getPending } from "./scheduler.js";
import { getStats } from "./monitor.js";
import { runningCount } from "./executor.js";

const r = Router();

r.get("/tasks", (req, res) => res.json(db.data.tasks));

r.post("/tasks", async (req, res) => {
  const t = {
    id: nanoid(8),
    name: req.body.name?.trim() || "Untitled",
    command: req.body.command || "",
    priority: ["Low","Medium","High"].includes(req.body.priority) ? req.body.priority : "Medium",
    scheduleType: req.body.scheduleType === "cron" ? "cron" : "interval",
    interval: Number(req.body.interval) || 0,
    cron: req.body.cron || "",
    retries: Math.max(1, Math.min(5, Number(req.body.retries) || 1)),
    deps: Array.isArray(req.body.deps) ? req.body.deps : [],
    paused: false,
    createdAt: Date.now(),
  };
  db.data.tasks.push(t);
  await db.write();
  scheduleTask(t);
  res.json(t);
});

r.put("/tasks/:id", async (req, res) => {
  const t = db.data.tasks.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "not found" });
  Object.assign(t, req.body);
  await db.write();
  scheduleTask(t);
  res.json(t);
});

r.delete("/tasks/:id", async (req, res) => {
  unscheduleTask(req.params.id);
  db.data.tasks = db.data.tasks.filter((x) => x.id !== req.params.id);
  await db.write();
  res.json({ ok: true });
});

r.post("/tasks/:id/run", (req, res) => { runNow(req.params.id); res.json({ ok: true }); });

r.post("/tasks/:id/toggle", async (req, res) => {
  const t = db.data.tasks.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "not found" });
  t.paused = !t.paused;
  await db.write();
  scheduleTask(t);
  res.json(t);
});

r.get("/logs", (req, res) => res.json(db.data.logs.slice(0, 200)));

r.get("/logs/export", (req, res) => {
  const rows = [["id","taskName","status","startedAt","finishedAt","durationMs","attempt"]];
  for (const l of db.data.logs) {
    rows.push([l.id, l.taskName, l.status, new Date(l.startedAt).toISOString(),
               l.finishedAt ? new Date(l.finishedAt).toISOString() : "", l.durationMs, l.attempt]);
  }
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=abts-logs.csv");
  res.send(rows.map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n"));
});

r.get("/stats", (req, res) => {
  const stats = getStats();
  const tasks = db.data.tasks;
  const logs = db.data.logs;
  res.json({
    cpu: stats.cpu, mem: stats.mem, history: stats.history,
    totalTasks: tasks.length,
    runningTasks: runningCount(),
    failedTasks: logs.filter((l) => l.status === "Failed").length,
    successTasks: logs.filter((l) => l.status === "Success").length,
    pending: getPending().length,
  });
});

export default r;
