import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function ResourceChart({ history = [] }) {
  const data = history.map((h) => ({
    time: new Date(h.t).toLocaleTimeString().slice(0,8),
    CPU: h.cpu, Memory: h.mem,
  }));
  return (
    <div className="glass rounded-2xl p-5 h-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Live Resource Usage</h3>
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-brand-500 inline-block"/>CPU</span>
          <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Memory</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cpu" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#5b8def" stopOpacity={0.6}/>
              <stop offset="100%" stopColor="#5b8def" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="mem" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "none", borderRadius: 12, color: "#fff" }} />
          <Area type="monotone" dataKey="CPU" stroke="#5b8def" fill="url(#cpu)" strokeWidth={2} />
          <Area type="monotone" dataKey="Memory" stroke="#10b981" fill="url(#mem)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
