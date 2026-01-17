import React from "react";

export default function Card({ title, subtitle, children, right }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-600 mt-1">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
