import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, accent = "from-brand-500 to-indigo-500", suffix = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 relative overflow-hidden"
    >
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <Icon size={18} className="text-slate-400" />
      </div>
      <div className="mt-3 text-3xl font-bold tabular-nums">
        {value}<span className="text-base font-medium text-slate-400 ml-1">{suffix}</span>
      </div>
    </motion.div>
  );
}
