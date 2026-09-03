import { useEffect, useState, useRef } from "react";
export function usePolling(fn, ms = 2000) {
  const [data, setData] = useState(null);
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try { const v = await ref.current(); if (alive) setData(v); } catch {}
    };
    tick();
    const id = setInterval(tick, ms);
    return () => { alive = false; clearInterval(id); };
  }, [ms]);
  return data;
}
