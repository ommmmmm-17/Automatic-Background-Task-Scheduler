import { Play, Pause, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const prioColor = {
  High: "bg-rose-500/15 text-rose-500",
  Medium: "bg-amber-500/15 text-amber-500",
  Low: "bg-emerald-500/15 text-emerald-500",
};

export default function TaskTable({ tasks, logs, onRun, onToggle, onDelete }) {
  const lastStatus = (id) => logs.find((l) => l.taskId === id)?.status || "Idle";
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/60 dark:border-white/5">
        <div className="col-span-3">Task</div>
        <div className="col-span-3">Command</div>
        <div className="col-span-1">Priority</div>
        <div className="col-span-2">Schedule</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      <AnimatePresence>
        {tasks.map((t) => {
          const status = lastStatus(t.id);
          return (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-12 gap-3 items-center px-5 py-3 border-b border-slate-200/40 dark:border-white/5 hover:bg-slate-100/40 dark:hover:bg-white/[0.02]">
              <div className="col-span-3">
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-slate-500">{t.paused ? "Paused" : "Active"} · retries {t.retries}</div>
              </div>
              <div className="col-span-3 font-mono text-xs truncate text-slate-500">{t.command}</div>
              <div className="col-span-1"><span className={`chip ${prioColor[t.priority]}`}>{t.priority}</span></div>
              <div className="col-span-2 text-xs text-slate-500">
                {t.scheduleType === "cron" ? <code>{t.cron}</code> : <>every {t.interval}ms</>}
              </div>
              <div className="col-span-1">
                <span className={`chip ${status === "Success" ? "bg-emerald-500/15 text-emerald-500" : status === "Failed" ? "bg-rose-500/15 text-rose-500" : status === "Running" ? "bg-brand-500/15 text-brand-500" : "bg-slate-500/15 text-slate-400"}`}>
                  {status}
                </span>
              </div>
              <div className="col-span-2 flex justify-end gap-1.5">
                <button className="btn-ghost !p-2" title="Run now" onClick={() => onRun(t)}><Play size={15}/></button>
                <button className="btn-ghost !p-2" title="Pause/Resume" onClick={() => onToggle(t)}><Pause size={15}/></button>
                <button className="btn-ghost !p-2 text-rose-500" title="Delete" onClick={() => onDelete(t)}><Trash2 size={15}/></button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {tasks.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-400">No tasks match your filters.</div>
      )}
    </div>
  );
}
