import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function AddTaskModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "", command: "", priority: "Medium",
    scheduleType: "interval", interval: 10000, cron: "", retries: 1,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.command.trim()) return;
    if (form.scheduleType === "interval" && (!form.interval || form.interval < 500)) return;
    if (form.scheduleType === "cron" && !form.cron.trim()) return;
    onSubmit(form);
    setForm({ ...form, name: "", command: "" });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
            onClick={(e) => e.stopPropagation()} onSubmit={submit}
            className="glass rounded-2xl p-6 w-full max-w-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Task</h2>
              <button type="button" onClick={onClose} className="btn-ghost !p-1.5"><X size={18}/></button>
            </div>

            <Field label="Name">
              <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Backup database" />
            </Field>
            <Field label="Command">
              <input className="input font-mono" value={form.command} onChange={(e) => set("command", e.target.value)} placeholder="echo hello" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority">
                <select className="input" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </Field>
              <Field label="Retries">
                <input type="number" min={1} max={5} className="input" value={form.retries} onChange={(e) => set("retries", +e.target.value)} />
              </Field>
            </div>
            <Field label="Schedule type">
              <div className="flex gap-2">
                {["interval","cron"].map((s) => (
                  <button type="button" key={s} onClick={() => set("scheduleType", s)}
                    className={`btn ${form.scheduleType === s ? "bg-brand-600 text-white" : "btn-ghost"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            {form.scheduleType === "interval" ? (
              <Field label="Interval (ms)">
                <input type="number" className="input" value={form.interval} onChange={(e) => set("interval", +e.target.value)} />
              </Field>
            ) : (
              <Field label="Cron expression">
                <input className="input font-mono" placeholder="*/30 * * * * *" value={form.cron} onChange={(e) => set("cron", e.target.value)} />
              </Field>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn-primary">Create task</button>
            </div>

            <style>{`
              .input{ width:100%; padding:.55rem .75rem; border-radius:.75rem;
                background: rgba(148,163,184,.08); border:1px solid rgba(148,163,184,.2);
                outline:none; transition: border .15s; }
              .input:focus{ border-color:#5b8def; }
            `}</style>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
