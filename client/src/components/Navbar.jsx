import React from "react";

export default function Navbar({ page, setPage }) {
  const tabs = [
    { key: "support", label: "Support Request" },
    { key: "volunteer", label: "Volunteer Registration" },
    { key: "dashboard", label: "Dashboard" }
  ];

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jarurat Care – Mini Healthcare Support</h1>
          <p className="text-sm text-slate-600">
          </p>
        </div>

        <nav className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setPage(t.key)}
              className={`px-4 py-2 rounded-xl border text-sm ${
                page === t.key ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
