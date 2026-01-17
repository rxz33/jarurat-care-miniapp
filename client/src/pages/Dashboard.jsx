import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import Tag from "../components/Tag";
import { api } from "../api";

export default function Dashboard() {
  const [support, setSupport] = useState([]);
  const [vols, setVols] = useState([]);
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const [s, v, sum] = await Promise.all([api.listSupport(), api.listVolunteers(), api.dashboardSummary()]);
      setSupport(s);
      setVols(v);
      setSummary(sum);
    } catch {
      setErr("Backend not reachable. Start FastAPI on port 8000.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      {err ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{err}</div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Totals" subtitle="Quick view for coordinators">
          {!summary ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Support Requests</span><b>{summary.totals.supportRequests}</b></div>
              <div className="flex justify-between"><span>Volunteers</span><b>{summary.totals.volunteers}</b></div>
            </div>
          )}
        </Card>

        <Card title="Urgency Breakdown" subtitle="Auto-triage counts">
          {!summary ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Tag kind="high">High: {summary.urgencyCounts.High || 0}</Tag>
              <Tag kind="medium">Medium: {summary.urgencyCounts.Medium || 0}</Tag>
              <Tag kind="low">Low: {summary.urgencyCounts.Low || 0}</Tag>
            </div>
          )}
        </Card>

        <Card title="Departments" subtitle="Suggested routing">
          {!summary ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : (
            <div className="space-y-2 text-sm">
              {Object.entries(summary.departmentCounts).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span><b>{v}</b>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Latest Support Requests"
        subtitle="View auto-summary (concept-level internal dashboard)."
        right={<button className="px-4 py-2 rounded-xl border bg-white text-sm hover:bg-slate-50" onClick={load}>Refresh</button>}
      >
        {support.length === 0 ? (
          <p className="text-sm text-slate-600">No support requests yet.</p>
        ) : (
          <div className="space-y-4">
            {support.slice(0, 8).map((x) => (
              <div key={x.id} className="border rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{x.fullName}</p>
                    <p className="text-sm text-slate-600">{x.city}, {x.state}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Tag kind={x.urgency === "High" ? "high" : x.urgency === "Medium" ? "medium" : "low"}>
                      {x.urgency}
                    </Tag>
                    <Tag>{x.department}</Tag>
                    <Tag>{x.nextAction}</Tag>
                  </div>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-slate-800">View auto-summary</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs bg-slate-50 border rounded-xl p-3 text-slate-800">
                    {x.summaryText}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Latest Volunteers" subtitle="Recent volunteer signups">
        {vols.length === 0 ? (
          <p className="text-sm text-slate-600">No volunteers yet.</p>
        ) : (
          <div className="space-y-3">
            {vols.slice(0, 8).map((v) => (
              <div key={v.id} className="border rounded-2xl p-4">
                <p className="font-semibold text-slate-900">{v.fullName}</p>
                <p className="text-sm text-slate-600">{v.city}, {v.state} • {v.phone}</p>
                {v.skills?.length ? <p className="text-xs text-slate-600 mt-2">Skills: {v.skills.join(", ")}</p> : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
