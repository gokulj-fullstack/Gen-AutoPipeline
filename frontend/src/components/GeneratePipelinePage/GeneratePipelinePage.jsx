import { useState } from "react";
import "./GeneratePipelinePage.css";

export default function GeneratePipelinePage({
  setCurrentStep,
  generatedPipeline,
}) {

  const tabs = [
    "Pipeline",
    "Explanation",
  ];

  const [activeTab, setActiveTab] =
    useState("Pipeline");

  const [copied, setCopied] =
    useState(false);

  const [downloaded, setDownloaded] =
    useState(false);

  /* =========================
     COPY YAML
  ========================= */

  const handleCopy = () => {

    navigator.clipboard.writeText(
      generatedPipeline
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  /* =========================
     DOWNLOAD YAML
  ========================= */

  const handleDownload = () => {

    const blob = new Blob(
      [generatedPipeline],
      {
        type: "text/yaml",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "smart-pipeline.yml";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    setDownloaded(true);

    setTimeout(() => {
      setDownloaded(false);
    }, 2000);
  };

  return (
    <div className="generate-page">

      <div className="generate-container">

        {/* HERO */}
        <div className="hero-section">

          <div className="hero-tag">
            Step 4 of 6
          </div>

          <h1 className="page-title">
            Generated <span>Pipeline</span>
          </h1>

          <p className="page-subtitle">
            Your intelligent CI/CD workflow has been
            generated successfully from your
            selected configuration.
          </p>

        </div>

        {/* MAIN CARD */}
        <div className="gen-card">

          {/* TOPBAR */}
          <div className="gen-topbar">

            <div className="gen-title-group">

              <span className="gen-bolt">
                ⚡
              </span>

              <strong>
                Generated YAML Pipeline
              </strong>

            </div>

            <div className="gen-actions">

              {/* COPY */}
              <button
                className="action-btn"
                onClick={handleCopy}
              >
                {copied
                  ? "✓ Copied!"
                  : "⧉ Copy"}
              </button>

              {/* DOWNLOAD */}
              <button
                className="action-btn"
                onClick={handleDownload}
              >
                {downloaded
                  ? "✓ Downloaded!"
                  : "↓ Download"}
              </button>

            </div>

          </div>

          {/* TABS */}
          <div className="gen-tabs">

            {tabs.map((tab) => (

              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`gen-tab ${activeTab === tab
                    ? "gen-tab-active"
                    : ""
                  }`}
              >
                {tab}
              </button>

            ))}

          </div>

          {/* CODE / EXPLANATION */}
          <div className="code-wrapper">

            <pre className="code-block">

              <code>

                {activeTab === "Pipeline"

                  ? generatedPipeline

                  : `This CI/CD workflow was generated automatically based on your selected environments, deployment strategy, registry provider, security scans, and advanced DevOps configurations.

The generated workflow includes:

• Automated Build & Test stages
• Security scanning
• Docker image publishing
• Environment deployments
• Branch-based triggers
• Registry integration
• CI/CD optimization

You can now:
1. Copy the YAML
2. Download the pipeline
3. Customize stages
4. Deploy directly into your repository
5. Continue to implementation planning

This pipeline is compatible with enterprise-grade DevOps workflows.`}

              </code>

            </pre>

          </div>

          {/* FOOTER */}
          <div className="gen-footer">

            <button
              className="back-btn"
              onClick={() =>
                setCurrentStep(2)
              }
            >
              ← Back
            </button>

            <button
              className="next-btn"
              onClick={() =>
                setCurrentStep(5)
              }
            >
              Customize Pipeline →
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}