import { useState } from "react";
import "./CustomizePipeline.css";

const DEFAULT_STAGES = [
  { id: 1, name: "Checkout & Install", desc: "actions/checkout@v3 · npm ci", enabled: true, time: "~30s" },
  { id: 2, name: "Lint", desc: "ESLint · npm run lint", enabled: true, time: "~20s" },
  { id: 3, name: "Test", desc: "Jest · npm test -- --coverage", enabled: true, time: "~60s" },
  { id: 4, name: "Build", desc: "npm run build", enabled: true, time: "~90s" },
  { id: 5, name: "Docker Build & Push", desc: "Dockerfile · push to ghcr.io", enabled: true, time: "~2min" },
  { id: 6, name: "Deploy", desc: "SSH into server · pull latest image", enabled: false, time: "~1min" },
];

const CI_PLATFORMS = ["GitHub Actions", "GitLab CI", "Jenkins", "CircleCI"];
const BRANCHES = ["main", "develop", "staging", "master", "feature/*"];

const INTEGRATION_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    color: "gray",
    features: ["GitHub Actions only", "Up to 3 pipelines", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12/mo",
    color: "purple",
    features: ["All CI platforms", "Unlimited pipelines", "Custom stages", "Priority support"],
  },
  {
    id: "team",
    name: "Team",
    price: "$39/mo",
    color: "teal",
    features: ["Everything in Pro", "Team collaboration", "Pipeline history", "API access"],
  },
];

function CustomizePipeline({ onApply, setCurrentStep }) {
  const [activeTab, setActiveTab] = useState("stages");
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [platform, setPlatform] = useState("GitHub Actions");
  const [branches, setBranches] = useState(["main"]);
  const [envVars, setEnvVars] = useState([{ key: "NODE_ENV", value: "production" }]);
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvVal, setNewEnvVal] = useState("");
  const [customStage, setCustomStage] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [applied, setApplied] = useState(false);

  // ── Stage helpers ────────────────────────────────────
  const toggleStage = (id) =>
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );

  const removeStage = (id) =>
    setStages((prev) => prev.filter((s) => s.id !== id));

  const addCustomStage = () => {
    if (!customStage.trim()) return;
    setStages((prev) => [
      ...prev,
      { id: Date.now(), name: customStage, desc: "Custom stage", enabled: true, time: "~1min" },
    ]);
    setCustomStage("");
  };

  // ── Branch helpers ───────────────────────────────────
  const toggleBranch = (b) =>
    setBranches((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );

  // ── Env var helpers ──────────────────────────────────
  const addEnvVar = () => {
    if (!newEnvKey.trim()) return;
    setEnvVars((prev) => [...prev, { key: newEnvKey, value: newEnvVal }]);
    setNewEnvKey("");
    setNewEnvVal("");
  };
  const removeEnvVar = (idx) =>
    setEnvVars((prev) => prev.filter((_, i) => i !== idx));

  // ── Apply ────────────────────────────────────────────
  const handleApply = () => {

    setApplied(true);

    setTimeout(() => {
      setApplied(false);

      // GO TO IMPLEMENTATION PAGE
      setCurrentStep(6);

    }, 1200);

    if (onApply) {
      onApply({
        stages,
        platform,
        branches,
        envVars,
        plan: selectedPlan,
      });
    }
  };

  const tabs = [
    { id: "stages", label: "⊞ Stages" },
    { id: "triggers", label: "⌥ Triggers" },
    { id: "env", label: "⊟ Env Vars" },
    { id: "integration", label: "★ Integration" },
  ];

  return (
    <div className="cp-wrapper">
      <div className="cp-header">
        <div>
          <h2 className="cp-title">Customize Pipeline</h2>
          <p className="cp-subtitle">Modify stages, triggers, and environment settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="cp-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`cp-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Stages Tab ── */}
      {activeTab === "stages" && (
        <div className="cp-section">
          <p className="cp-hint">Toggle stages on/off or remove them. Add custom stages below.</p>

          <div className="stage-list">
            {stages.map((stage) => (
              <div key={stage.id} className={`stage-row ${stage.enabled ? "" : "disabled"}`}>
                <button
                  className={`toggle-btn ${stage.enabled ? "on" : "off"}`}
                  onClick={() => toggleStage(stage.id)}
                  title={stage.enabled ? "Disable" : "Enable"}
                >
                  {stage.enabled ? "●" : "○"}
                </button>
                <div className="stage-info">
                  <span className="stage-name">{stage.name}</span>
                  <span className="stage-desc">{stage.desc}</span>
                </div>
                <span className="stage-time">{stage.time}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeStage(stage.id)}
                  title="Remove stage"
                >✕</button>
              </div>
            ))}
          </div>

          <div className="add-stage-row">
            <input
              type="text"
              placeholder="Add custom stage name..."
              value={customStage}
              onChange={(e) => setCustomStage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomStage()}
            />
            <button className="add-btn" onClick={addCustomStage}>+ Add Stage</button>
          </div>
        </div>
      )}

      {/* ── Triggers Tab ── */}
      {activeTab === "triggers" && (
        <div className="cp-section">
          <div className="cp-field">
            <label className="cp-label">CI / CD Platform</label>
            <div className="platform-grid">
              {CI_PLATFORMS.map((p) => (
                <button
                  key={p}
                  className={`platform-btn ${platform === p ? "active" : ""}`}
                  onClick={() => setPlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-label">Branch Triggers</label>
            <p className="cp-hint">Pipeline runs when you push to these branches.</p>
            <div className="branch-chips">
              {BRANCHES.map((b) => (
                <button
                  key={b}
                  className={`branch-chip ${branches.includes(b) ? "active" : ""}`}
                  onClick={() => toggleBranch(b)}
                >
                  {b}
                </button>
              ))}
            </div>
            <p className="cp-hint" style={{ marginTop: "8px" }}>
              Selected: <strong>{branches.join(", ") || "none"}</strong>
            </p>
          </div>
        </div>
      )}

      {/* ── Env Vars Tab ── */}
      {activeTab === "env" && (
        <div className="cp-section">
          <p className="cp-hint">These will be injected as secrets in your pipeline YAML.</p>

          <div className="env-list">
            {envVars.map((ev, i) => (
              <div key={i} className="env-row">
                <span className="env-key">{ev.key}</span>
                <span className="env-eq">=</span>
                <span className="env-val">{ev.value || "••••••"}</span>
                <button className="remove-btn" onClick={() => removeEnvVar(i)}>✕</button>
              </div>
            ))}
          </div>

          <div className="add-env-row">
            <input
              type="text"
              placeholder="KEY"
              value={newEnvKey}
              onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
              className="env-key-input"
            />
            <span className="env-eq">=</span>
            <input
              type="text"
              placeholder="value"
              value={newEnvVal}
              onChange={(e) => setNewEnvVal(e.target.value)}
              className="env-val-input"
            />
            <button className="add-btn" onClick={addEnvVar}>+ Add</button>
          </div>
        </div>
      )}

      {/* ── Integration Plans Tab ── */}
      {activeTab === "integration" && (
        <div className="cp-section">
          <p className="cp-hint">Choose an integration plan to unlock more CI platforms and features.</p>
          <div className="plans-grid">
            {INTEGRATION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card plan-${plan.color} ${selectedPlan === plan.id ? "selected" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="plan-top">
                  <span className="plan-name">{plan.name}</span>
                  <span className="plan-price">{plan.price}</span>
                </div>
                <ul className="plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}><span className="plan-check">✔</span> {f}</li>
                  ))}
                </ul>
                <div className="plan-select-indicator">
                  {selectedPlan === plan.id ? "✔ Selected" : "Select"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Apply */}
      <div className="cp-footer">
        <span className="cp-footer-hint">
          {stages.filter((s) => s.enabled).length} stages active · {platform} · {branches.join(", ")}
        </span>
        <button
          className={`cp-apply-btn ${applied ? "applied" : ""}`}
          onClick={handleApply}
        >
          {applied ? "Applied!" : "Apply Changes"}
        </button>
      </div>
    </div>
  );
}

export default CustomizePipeline;
