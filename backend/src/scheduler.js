import cron from "node-cron";
import { db } from "./db.js";
import { executeTask, isRunning } from "./executor.js";
import { getStats } from "./monitor.js";

// Priority weight
const PRIO = { High: 0, Medium: 1, Low: 2 };

// Round-robin pointer per priority bucket
const rrIndex = { High: 0, Medium: 0, Low: 0 };

const cronJobs = new Map();   // taskId -> cron job
const intervalTimers = new Map(); // taskId -> timer
const pendingQueue = []; // taskIds awaiting dispatch (smart scheduling)

function enqueue(taskId) {
  if (!pendingQueue.includes(taskId)) pendingQueue.push(taskId);
}

function depsSatisfied(task) {
  if (!task.deps || task.deps.length === 0) return true;
  // last log per dep must be Success
  for (const depId of task.deps) {
    const log = db.data.logs.find((l) => l.taskId === depId);
    if (!log || log.status !== "Success") return false;
  }
  return true;
}

// Smart dispatcher — Priority + Round Robin + resource awareness
async function dispatcher() {
  const { cpu } = getStats();
  if (pendingQueue.length === 0) return;

  // Group by priority
  const buckets = { High: [], Medium: [], Low: [] };
  for (const id of pendingQueue) {
    const task = db.data.tasks.find((t) => t.id === id);
    if (task && !task.paused) buckets[task.priority]?.push(task);
  }

  const order = ["High", "Medium", "Low"];
  for (const p of order) {
    const bucket = buckets[p];
    if (bucket.length === 0) continue;

    // Resource-aware throttling
    if (p === "Low" && cpu > 75) continue;          // defer Low under load
    if (p === "Medium" && cpu > 90) continue;

    // Round Robin within bucket
    rrIndex[p] = rrIndex[p] % bucket.length;
    const task = bucket[rrIndex[p]];
    rrIndex[p]++;

    if (!depsSatisfied(task) || isRunning(task.id)) continue;

    // remove from pending and execute
    const idx = pendingQueue.indexOf(task.id);
    if (idx >= 0) pendingQueue.splice(idx, 1);
    executeTask(task);
    return; // one dispatch per tick keeps fairness
  }

  // System idle? drain Low backlog faster
  if (cpu < 25 && pendingQueue.length > 0) {
    const id = pendingQueue.shift();
    const t = db.data.tasks.find((x) => x.id === id);
    if (t && !t.paused && depsSatisfied(t) && !isRunning(t.id)) executeTask(t);
  }
}

export function unscheduleTask(taskId) {
  if (cronJobs.has(taskId)) { cronJobs.get(taskId).stop(); cronJobs.delete(taskId); }
  if (intervalTimers.has(taskId)) { clearInterval(intervalTimers.get(taskId)); intervalTimers.delete(taskId); }
}

export function scheduleTask(task) {
  unscheduleTask(task.id);
  if (task.paused) return;
  if (task.scheduleType === "cron" && task.cron) {
    if (!cron.validate(task.cron)) return;
    const job = cron.schedule(task.cron, () => enqueue(task.id));
    cronJobs.set(task.id, job);
  } else if (task.scheduleType === "interval" && task.interval > 0) {
    const t = setInterval(() => enqueue(task.id), task.interval);
    intervalTimers.set(task.id, t);
  }
}

export function startScheduler() {
  for (const t of db.data.tasks) scheduleTask(t);
  setInterval(dispatcher, 1000);
}

export function runNow(taskId) { enqueue(taskId); }
export function getPending() { return [...pendingQueue]; }
