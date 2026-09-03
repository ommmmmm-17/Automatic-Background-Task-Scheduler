import { useMemo, useState } from "react";
import { Plus, Search, Download, Activity, Cpu, MemoryStick, ListChecks, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import StatCard from "./components/StatCard.jsx";
import ResourceChart from "./components/ResourceChart.jsx";
import TaskTable from "./components/TaskTable.jsx";
import AddTaskModal from "./components/AddTaskModal.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { usePolling } from "./hooks/usePolling.js";
import { api } from "./api.js";

export default function App() {
  const stats = usePolling(api.stats, 2000) || { history: [], cpu: 0, mem: 0, totalTasks: 0, runningTasks: 0, failedTasks: 0 };
  const tasks = usePolling(api.tasks, 3000) || [];
  const logs  = usePolling(api.logs, 3000) || [];

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [prio, setPrio] = useState("All");
  const [status, setStatus] = useState("All");

  const lastStatus = (id) => logs.find((l) => l.taskId === id)?.status || "Idle";

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (q && !(`${t.name} ${t.command}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (prio !== "All" && t.priority !== prio) return false;
      if (status !== "All" && lastStatus(t.id) !== status) return false;
      return true;
    });
  }, [tasks, q, prio, status, logs]);

  const create = async (form) => {
    try { await api.create(form); toast.success("Task created"); setOpen(false); }
    catch (e) { toast.error(e.message); }
  };

  const aiSuggest = () => {
    if (stats.cpu > 75) return "⚠️  CPU is busy — defer Low-priority tasks until load drops.";
    if (stats.cpu < 20 && (stats.pending || 0) > 0) return "💡  System is idle — great moment to drain backlog.";
    if (stats.failedTasks > stats.successTasks) return "🔁  More failures than successes — increase retries or check commands.";
    return "✅  Healthy load. Scheduler running optimally.";
  };

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/60 dark:bg-[#0b1020]/60 border-b border-slate-200/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 grid place-items-center shadow-glow">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold leading-tight">ABTS</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Task Scheduler</div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/60 dark:bg-white/[0.04] w-72">
            <Search size={15} className="text-slate-400"/>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search tasks…" className="bg-transparent outline-none text-sm w-full" />
          </div>
          <a href={api.exportUrl} className="btn-ghost"><Download size={16}/>CSV</a>
          <ThemeToggle />
          <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16}/>New task</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Hero / AI tip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-brand-500 grid place-items-center">
            <Sparkles size={18} className="text-white"/>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">Smart Scheduler Insight</div>
            <div className="font-medium">{aiSuggest()}</div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={ListChecks} label="Total tasks" value={stats.totalTasks} />
          <StatCard icon={Activity}   label="Running"     value={stats.runningTasks} accent="from-emerald-400 to-teal-500"/>
          <StatCard icon={AlertTriangle} label="Failed"   value={stats.failedTasks} accent="from-rose-400 to-pink-500"/>
          <StatCard icon={Cpu}        label="CPU"         value={stats.cpu} suffix="%" accent="from-brand-500 to-indigo-500"/>
          <StatCard icon={MemoryStick}label="Memory"      value={stats.mem} suffix="%" accent="from-amber-400 to-orange-500"/>
        </div>

        <ResourceChart history={stats.history} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold mr-auto">Tasks</h2>
          <Select label="Priority" value={prio} setValue={setPrio} options={["All","High","Medium","Low"]} />
          <Select label="Status"   value={status} setValue={setStatus} options={["All","Success","Failed","Running","Idle"]} />
        </div>

        <TaskTable
          tasks={filtered} logs={logs}
          onRun={async (t) => { await api.run(t.id); toast.success(`Queued: ${t.name}`); }}
          onToggle={async (t) => { const r = await api.toggle(t.id); toast.message(r.paused ? "Paused" : "Resumed"); }}
          onDelete={async (t) => { await api.remove(t.id); toast.success(`Deleted ${t.name}`); }}
        />

        {/* Logs */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Execution history</h3>
            <span className="text-xs text-slate-400">last {logs.length} runs</span>
          </div>
          <div className="max-h-80 overflow-auto divide-y divide-slate-200/40 dark:divide-white/5">
            {logs.map((l) => (
              <div key={l.id} className="py-2 flex items-center gap-3 text-sm">
                <span className={`chip ${l.status === "Success" ? "bg-emerald-500/15 text-emerald-500" : l.status === "Failed" ? "bg-rose-500/15 text-rose-500" : "bg-brand-500/15 text-brand-500"}`}>
                  {l.status}
                </span>
                <span className="font-medium w-48 truncate">{l.taskName}</span>
                <span className="text-xs text-slate-500">{new Date(l.startedAt).toLocaleTimeString()}</span>
                <span className="text-xs text-slate-400">{l.durationMs}ms</span>
                <span className="text-xs text-slate-400 truncate flex-1 font-mono">{(l.output || l.error).slice(0,120)}</span>
              </div>
            ))}
            {logs.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No runs yet.</div>}
          </div>
        </div>

        <footer className="py-6 text-center text-xs text-slate-400">
          ABTS · Demonstrates Priority + Round-Robin + Resource-aware scheduling · {new Date().getFullYear()}
        </footer>
      </main>

      <AddTaskModal open={open} onClose={() => setOpen(false)} onSubmit={create} />
    </div>
  );
}

function Select({ label, value, setValue, options }) {
  return (
    <label className="text-sm flex items-center gap-2">
      <span className="text-slate-500 text-xs">{label}</span>
      <select value={value} onChange={(e)=>setValue(e.target.value)}
        className="bg-slate-200/60 dark:bg-white/[0.05] rounded-lg px-2 py-1.5 text-sm outline-none border border-transparent focus:border-brand-500">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
