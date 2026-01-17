import React from "react";

export default function Tag({ kind = "neutral", children }) {
  const map = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-green-100 text-green-700 border-green-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border ${map[kind] || map.neutral}`}>
      {children}
    </span>
  );
}
