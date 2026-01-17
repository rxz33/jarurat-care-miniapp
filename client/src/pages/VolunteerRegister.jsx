import React, { useState } from "react";
import Card from "../components/Card";
import { api } from "../api";

const SKILLS = ["Counseling", "Content Writing", "Community Outreach", "Tech Support", "Data Entry", "Design"];

export default function VolunteerRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    state: "",
    email: "",
    skills: [],
    availabilityHoursPerWeek: "",
    motivation: ""
  });

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function toggleSkill(s) {
    setForm((p) => {
      const has = p.skills.includes(s);
      return { ...p, skills: has ? p.skills.filter((x) => x !== s) : [...p.skills, s] };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setDone(false);

    if (!form.fullName.trim() || !form.phone.trim() || !form.city.trim() || !form.state.trim()) {
      setError("Please fill required fields: Name, Phone, City, State.");
      return;
    }

    try {
      setLoading(true);
      await api.createVolunteer({
        ...form,
        availabilityHoursPerWeek: form.availabilityHoursPerWeek ? Number(form.availabilityHoursPerWeek) : null
      });
      setDone(true);
      setForm({
        fullName: "",
        phone: "",
        city: "",
        state: "",
        email: "",
        skills: [],
        availabilityHoursPerWeek: "",
        motivation: ""
      });
    } catch (err) {
      setError(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Volunteer Registration"
      subtitle="Collect volunteer details for Jarurat Care’s cancer care community support."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name *">
            <input className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </Field>
          <Field label="Phone *">
            <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field label="City *">
            <input className="input" value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field label="State *">
            <input className="input" value={form.state} onChange={(e) => update("state", e.target.value)} />
          </Field>
          <Field label="Email (optional)">
            <input className="input" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field label="Availability (hours/week)">
            <input
              type="number"
              className="input"
              value={form.availabilityHoursPerWeek}
              onChange={(e) => update("availabilityHoursPerWeek", e.target.value)}
            />
          </Field>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">Skills</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SKILLS.map((s) => {
              const active = form.skills.includes(s);
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className={`px-3 py-2 rounded-xl border text-sm ${
                    active ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Why do you want to volunteer? (optional)">
          <textarea className="input min-h-[110px]" value={form.motivation} onChange={(e) => update("motivation", e.target.value)} />
        </Field>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {done ? <p className="text-sm text-green-600">Thank you! Volunteer registration submitted.</p> : null}

        <button disabled={loading} className="btn">
          {loading ? "Submitting..." : "Submit Volunteer Registration"}
        </button>
      </form>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-800">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
