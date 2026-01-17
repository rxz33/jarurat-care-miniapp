const BASE = "http://localhost:8000";

async function req(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Request failed");
  return data;
}

export const api = {
  createSupport: (payload) =>
    req("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then((d) => d.item),

  listSupport: () => req("/api/support").then((d) => d.items),

  createVolunteer: (payload) =>
    req("/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then((d) => d.item),

  listVolunteers: () => req("/api/volunteers").then((d) => d.items),

  dashboardSummary: () => req("/api/dashboard/summary")
};
