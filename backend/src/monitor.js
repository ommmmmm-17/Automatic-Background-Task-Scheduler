import si from "systeminformation";
import os from "os";

let current = { cpu: 0, mem: 0, history: [] };

export function getStats() { return current; }

export function startMonitor() {
  const tick = async () => {
    try {
      const load = await si.currentLoad();
      const memInfo = await si.mem();
      const cpu = +load.currentLoad.toFixed(1);
      const mem = +((memInfo.active / memInfo.total) * 100).toFixed(1);
      current.cpu = cpu;
      current.mem = mem;
      current.history.push({ t: Date.now(), cpu, mem });
      if (current.history.length > 60) current.history.shift();
    } catch {
      // fallback
      const load = os.loadavg()[0] * 10;
      current.cpu = Math.min(100, +load.toFixed(1));
      const mem = +((1 - os.freemem() / os.totalmem()) * 100).toFixed(1);
      current.mem = mem;
      current.history.push({ t: Date.now(), cpu: current.cpu, mem });
      if (current.history.length > 60) current.history.shift();
    }
  };
  tick();
  setInterval(tick, 2000);
}
