const base = "/api";
async function j(url, opts) {
  const r = await fetch(base + url, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json();
}
export const api = {
  tasks:  () => j("/tasks"),
  create: (t) => j("/tasks", { method: "POST", body: JSON.stringify(t) }),
  update: (id, t) => j(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(t) }),
  remove: (id) => j(`/tasks/${id}`, { method: "DELETE" }),
  run:    (id) => j(`/tasks/${id}/run`, { method: "POST" }),
  toggle: (id) => j(`/tasks/${id}/toggle`, { method: "POST" }),
  logs:   () => j("/logs"),
  stats:  () => j("/stats"),
  exportUrl: base + "/logs/export",
};
