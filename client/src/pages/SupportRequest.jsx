import React, { useState } from "react";
import Card from "../components/Card";
import Tag from "../components/Tag";
import { api } from "../api";

const NEEDS = [
  "Caregiver Mentorship",
  "Hospital Partner Connect",
  "Financial Guidance",
  "Medicine Support",
  "Awareness & Prevention Guidance",
  "General Support"
];

export default function SupportRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    state: "",
    age: "",
    patientRelation: "Self",
    preferredContact: "WhatsApp",
    cancerType: "",
    stage: "",
    needs: [],
    symptoms: "",
    message: ""
  });

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function toggleNeed(n) {
    setForm((p) => {
      const has = p.needs.includes(n);
      return { ...p, needs: has ? p.needs.filter((x) => x !== n) : [...p.needs, n] };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setCreated(null);

    if (!form.fullName.trim() || !form.phone.trim() || !form.city.trim() || !form.state.trim()) {
      setError("Please fill required fields: Name, Phone, City, State.");
      return;
    }

    try {
      setLoading(true);

      // IMPORTANT: avoid 422 by sending correct types
      const payload = {
        ...form,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        age: form.age === "" ? null : Number(form.age),
        needs: Array.isArray(form.needs) ? form.needs : []
      };

      const item = await api.createSupport(payload);
      setCreated(item);

      setForm({
        fullName: "",
        phone: "",
        city: "",
        state: "",
        age: "",
        patientRelation: "Self",
        preferredContact: "WhatsApp",
        cancerType: "",
        stage: "",
        needs: [],
        symptoms: "",
        message: ""
      });
    } catch (err) {
      setError(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Patient / Caregiver Support Request">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name *">
              <input
                className="input"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </Field>

            <Field label="Phone *">
              <input
                className="input"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </Field>

            <Field label="City *">
              <input
                className="input"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </Field>

            <Field label="State *">
              <input
                className="input"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </Field>

            <Field label="Age">
              <input
                type="number"
                className="input"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
            </Field>

            <Field label="Relation to Patient">
              <select
                className="input"
                value={form.patientRelation}
                onChange={(e) => update("patientRelation", e.target.value)}
              >
                <option>Self</option>
                <option>Caregiver</option>
                <option>Family Member</option>
                <option>Friend</option>
              </select>
            </Field>

            <Field label="Preferred Contact">
              <select
                className="input"
                value={form.preferredContact}
                onChange={(e) => update("preferredContact", e.target.value)}
              >
                <option>WhatsApp</option>
                <option>Call</option>
                <option>Email</option>
              </select>
            </Field>

            <Field label="Cancer Type (optional)">
              <input
                className="input"
                value={form.cancerType}
                onChange={(e) => update("cancerType", e.target.value)}
                placeholder="e.g., Breast, Lung"
              />
            </Field>

            <Field label="Stage (optional)">
              <input
                className="input"
                value={form.stage}
                onChange={(e) => update("stage", e.target.value)}
                placeholder="e.g., Stage 2"
              />
            </Field>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">Needs</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {NEEDS.map((n) => {
                const active = form.needs.includes(n);
                return (
                  <button
                    type="button"
                    key={n}
                    onClick={() => toggleNeed(n)}
                    className={`px-3 py-2 rounded-xl border text-sm ${
                      active
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Symptoms / Situation (optional)">
            <textarea
              className="input min-h-[90px]"
              value={form.symptoms}
              onChange={(e) => update("symptoms", e.target.value)}
            />
          </Field>

          <Field label="Message (optional)">
            <textarea
              className="input min-h-[90px]"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
            />
          </Field>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button disabled={loading} className="btn">
            {loading ? "Submitting..." : "Submit Request"}
          </button>

          <p className="text-xs text-slate-500">
            Concept demo only. No medical advice is provided.
          </p>
        </form>
      </Card>

      <Card title="Automation Output (for NGO staff)">
        {!created ? (
          <p className="text-sm text-slate-600">Submit a request to see auto-generated output here.</p>
        ) : (
          <div className="space-y-4">
            {/* AI status */}
            <div className="flex flex-wrap items-center gap-2">
              <Tag kind={created.urgency === "High" ? "high" : created.urgency === "Medium" ? "medium" : "low"}>
                Urgency: {created.urgency}
              </Tag>

              <Tag>{created.department}</Tag>
              <Tag>{created.nextAction}</Tag>

              {created.aiEnabled ? (
                <Tag>AI: {created.aiProvider || "groq"}</Tag>
              ) : (
                <Tag>AI: fallback</Tag>
              )}
            </div>

            {/* Groq AI Staff Summary */}
            {created.staffSummary ? (
              <div>
                <p className="text-sm font-semibold text-slate-900">AI Staff Summary</p>
                <p className="mt-2 text-sm text-slate-700">{created.staffSummary}</p>
              </div>
            ) : null}

            {/* Follow-up Questions */}
            {Array.isArray(created.followUpQuestions) && created.followUpQuestions.length ? (
              <div>
                <p className="text-sm font-semibold text-slate-900">AI Follow-up Questions</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                  {created.followUpQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Auto reply draft */}
            {created.autoReplyDraft ? (
              <div>
                <p className="text-sm font-semibold text-slate-900">AI Auto-Reply Draft</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs bg-slate-50 border rounded-xl p-3 text-slate-800">
                  {created.autoReplyDraft}
                </pre>
              </div>
            ) : null}

            {/* Original rule-based detailed summary */}
            <div>
              <p className="text-sm font-semibold text-slate-900">Detailed Case Summary</p>
              <pre className="mt-2 whitespace-pre-wrap text-xs bg-slate-50 border rounded-xl p-3 text-slate-800">
                {created.summaryText}
              </pre>
            </div>
          </div>
        )}
      </Card>
    </div>
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
