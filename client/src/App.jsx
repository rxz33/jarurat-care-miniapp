import React, { useState } from "react";
import Navbar from "./components/Navbar";
import SupportRequest from "./pages/SupportRequest";
import VolunteerRegister from "./pages/VolunteerRegister";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [page, setPage] = useState("support");

  return (
    <div className="min-h-screen">
      <Navbar page={page} setPage={setPage} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {page === "support" ? <SupportRequest /> : null}
        {page === "volunteer" ? <VolunteerRegister /> : null}
        {page === "dashboard" ? <Dashboard /> : null}
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-10 text-xs text-slate-500">
        Built as a concept-level prototype for NGO intake + automation (no medical advice).
      </footer>
    </div>
  );
}
