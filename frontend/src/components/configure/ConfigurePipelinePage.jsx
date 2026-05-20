import { useState } from "react";
import "./ConfigurePipelinePage.css";

const API_URL = "https://gen-autopipeline.onrender.com";

export default function ConfigurePipelinePage({
  setCurrentStep,
  setGeneratedPipeline,
}) {

  const tools = [
    "GitHub Actions",
    "GitLab CI",
    "Jenkins",
    "Azure DevOps",
  ];

  const environments = [
    "Development",
    "Staging",
    "Production",
  ];

  const scans = [
    "SAST",
    "Dependency Scan",
    "Docker Scan",
    "Secret Detection",
  ];

  const [selectedTool, setSelectedTool] = useState("GitHub Actions");

  const [selectedEnvs, setSelectedEnvs] = useState([
    "Development",
  ]);

  const [selectedScans, setSelectedScans] = useState([
    "SAST",
    "Dependency Scan",
  ]);

  const [deployTarget, setDeployTarget] = useState(
    "AWS ECS / EC2"
  );

  const [branchStrategy, setBranchStrategy] =
    useState("GitFlow");

  const [registry, setRegistry] = useState(
    "GitHub Container Registry"
  );

  const [advancedOptions, setAdvancedOptions] =
    useState({
      caching: true,
      parallel: true,
      slack: false,
    });

  const toggleEnv = (env) => {
    setSelectedEnvs((prev) =>
      prev.includes(env)
        ? prev.filter((e) => e !== env)
        : [...prev, env]
    );
  };

  const toggleScan = (scan) => {
    setSelectedScans((prev) =>
      prev.includes(scan)
        ? prev.filter((s) => s !== scan)
        : [...prev, scan]
    );
  };

  const toggleAdvanced = (key) => {
    setAdvancedOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGenerate = async () => {

    try {

      const response = await fetch(
        `${API_URL}/generate-pipeline/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            ci_cd: selectedTool,
            environments: selectedEnvs,
            deployment: deployTarget,
            security: selectedScans,
            branchStrategy,
            registry,
            advancedOptions,
          }),
        }
      );

      const data = await response.json();

      setGeneratedPipeline(data.pipeline_yaml);

      setCurrentStep(4);

    } catch (error) {

      console.log("API ERROR:", error);

      alert("Backend connection failed");

    }
  };

  return (
    <div className="configure-page">

      <div className="configure-container">

        {/* HERO */}
        <div className="hero-section">

          <div className="hero-tag">
            Smart CI/CD Builder
          </div>

          <h1 className="page-title">
            Configure Your
            <span> Deployment Pipeline</span>
          </h1>

          <p className="page-subtitle">
            Create production-ready CI/CD workflows
            with integrated security scanning and
            scalable deployment automation.
          </p>

        </div>

        {/* DASHBOARD GRID */}
        <div className="dashboard-grid">

          {/* LEFT PANEL */}
          <div className="left-panel">

            {/* CI/CD PLATFORM */}
            <div className="glass-card">

              <div className="card-header">
                <h3>CI/CD Platform</h3>
                <p>
                  Select your preferred automation tool
                </p>
              </div>

              <div className="button-grid">

                {tools.map((tool) => (

                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className={`tool-btn ${selectedTool === tool
                      ? "selected"
                      : ""
                      }`}
                  >
                    {tool}
                  </button>

                ))}

              </div>

            </div>

            {/* ENVIRONMENTS */}
            <div className="glass-card">

              <div className="card-header">
                <h3>Environments</h3>
                <p>Choose deployment stages</p>
              </div>

              <div className="button-grid">

                {environments.map((env) => (

                  <button
                    key={env}
                    onClick={() => toggleEnv(env)}
                    className={`tool-btn ${selectedEnvs.includes(env)
                      ? "selected"
                      : ""
                      }`}
                  >
                    {env}
                  </button>

                ))}

              </div>

            </div>

            {/* SECURITY */}
            <div className="glass-card">

              <div className="card-header">
                <h3>Security Scanning</h3>
                <p>
                  Enable automated security validations
                </p>
              </div>

              <div className="scan-grid">

                {scans.map((scan) => (

                  <button
                    key={scan}
                    onClick={() => toggleScan(scan)}
                    className={`scan-card ${selectedScans.includes(scan)
                      ? "scan-selected"
                      : ""
                      }`}
                  >
                    {scan}
                  </button>

                ))}

              </div>

            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">

            {/* DEPLOYMENT SETTINGS */}
            <div className="glass-card settings-card">

              <div className="card-header">
                <h3>Deployment Settings</h3>

                <p>
                  Configure infrastructure and
                  deployment strategy
                </p>
              </div>

              <div className="form-group">

                <label>Deployment Target</label>

                <select
                  value={deployTarget}
                  onChange={(e) =>
                    setDeployTarget(e.target.value)
                  }
                >
                  <option>AWS ECS / EC2</option>
                  <option>Kubernetes</option>
                  <option>Docker Swarm</option>
                  <option>Vercel</option>
                </select>

              </div>

              <div className="form-group">

                <label>Branch Strategy</label>

                <select
                  value={branchStrategy}
                  onChange={(e) =>
                    setBranchStrategy(e.target.value)
                  }
                >
                  <option>GitFlow</option>
                  <option>Trunk Based</option>
                  <option>Feature Branch</option>
                </select>

              </div>

              <div className="form-group">

                <label>Container Registry</label>

                <select
                  value={registry}
                  onChange={(e) =>
                    setRegistry(e.target.value)
                  }
                >
                  <option>
                    GitHub Container Registry
                  </option>

                  <option>Docker Hub</option>

                  <option>AWS ECR</option>
                </select>

              </div>

            </div>

            {/* ADVANCED */}
            <div className="glass-card advanced-card">

              <div className="card-header">

                <h3>Advanced Configuration</h3>

                <p>
                  Optimize workflow performance and
                  notifications
                </p>

              </div>

              <div className="advanced-options">

                {[
                  {
                    key: "caching",
                    label: "Enable caching",
                  },
                  {
                    key: "parallel",
                    label: "Parallel execution",
                  },
                  {
                    key: "slack",
                    label: "Slack notifications",
                  },
                ].map(({ key, label }) => (

                  <div
                    key={key}
                    className="toggle-row"
                  >

                    <span>{label}</span>

                    <button
                      onClick={() =>
                        toggleAdvanced(key)
                      }
                      className={`toggle-switch ${advancedOptions[key]
                        ? "toggle-on"
                        : ""
                        }`}
                    >
                      <span className="toggle-circle"></span>
                    </button>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="footer-buttons">

          <button
            onClick={handleGenerate}
            className="generate-btn"
          >
            Generate Pipeline
          </button>

        </div>

      </div>

    </div>
  );
}