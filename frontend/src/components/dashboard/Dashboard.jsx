import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadTabs from "../upload/UploadTabs";
import "./Dashboard.css";

function Dashboard({ setCurrentStep }) {

  const [result, setResult] = useState(null);

  const [githubConnected, setGithubConnected] =
    useState(false);

  // =========================
  // GITHUB CONNECT
  // =========================

  const connectGithub = () => {

    // Replace with your backend OAuth URL later
    // Example:
    // window.location.href =
    // "http://127.0.0.1:8000/auth/github/";

    setGithubConnected(true);

    alert(
      "GitHub Connected Successfully"
    );
  };

  // =========================
  // ANALYZE PROJECT
  // =========================

  const handleAnalyze = async (data) => {

    try {

      if (data.source !== "github") {
        setResult({
          ...data,
          pipelineYaml: data.pipelineYaml || "# AI Generated Pipeline\n\n# (Mock pipeline for folder/paste upload)\nname: AI Pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm install\n      - run: npm test",
        });
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/github-analyze/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            github_url: data.url,
          }),
        }
      );

      const backendData =
        await response.json();

      console.log(backendData);

      setResult({

        source: "github",

        url: data.url,

        filesScanned:
          backendData.files_scanned,

        technologies:
          backendData.technologies,

        stages: [
          {
            name:
              "Install Dependencies",

            desc:
              "Install project packages",

            time: "30s",
          },
          {
            name:
              "Run Tests",

            desc:
              "Execute automated tests",

            time: "1m",
          },
          {
            name:
              "Build Project",

            desc:
              "Production build process",

            time: "2m",
          },
          {
            name:
              "Security Scan",

            desc:
              "Scan vulnerabilities",

            time: "45s",
          },
          {
            name:
              "Deploy",

            desc:
              "Deploy to cloud infrastructure",

            time: "45s",
          },
        ],

        files:
          backendData.files,

        pipelineYaml:
          backendData.pipeline_yaml,
      });

    } catch (error) {

      console.error(
        "API ERROR:",
        error
      );
    }
  };

  // =========================
  // RESET
  // =========================

  const handleReset = () => {
    setResult(null);
  };

  // =========================
  // STRUCTURE
  // =========================

  const getStructureText = () => {

    if (!result) return "";

    if (result.source === "paste") {
      return result.structure;
    }

    if (result.source === "github") {
      return `Repository: ${result.url}`;
    }

    if (result.source === "folder") {

      return result.files
        .map((f) => f.name || f)
        .join("\n");
    }

    return "";
  };

  // =========================
  // UI
  // =========================

  return (

    <div className="dashboard">

      {/* HERO */}

      <div className="dashboard-header">

        <motion.div
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >

          <div className="header-badge">

            <span className="pulse-dot" />

            AI-Powered DevOps

          </div>

          <h1>
            AI Pipeline Generator
          </h1>

          <p>
            Upload your project and
            generate intelligent
            CI/CD pipelines instantly.
          </p>

        </motion.div>

        {/* GITHUB BUTTON */}

        <motion.button
          className={`connect-btn ${githubConnected
            ? "connected"
            : ""
            }`}
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
          onClick={connectGithub}
        >

          <span className="github-icon">
            {githubConnected
              ? "✓"
              : "⚡"}
          </span>

          {githubConnected
            ? "GitHub Connected"
            : "Connect GitHub"}

        </motion.button>

      </div>

      {/* UPLOAD */}

      <AnimatePresence>

        {!result && (

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.4,
            }}
          >

            <UploadTabs
              onAnalyze={handleAnalyze}
            />

          </motion.div>
        )}

      </AnimatePresence>

      {/* RESULT */}

      <AnimatePresence>

        {result && (

          <motion.div
            className="result-section"
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >

            {/* METRICS */}

            <div className="metrics-grid">

              {[
                {
                  label:
                    "Files scanned",

                  val:
                    result.filesScanned,
                },

                {
                  label:
                    "Technologies",

                  val:
                    `${result.technologies.length} found`,
                },

                {
                  label:
                    "Pipeline stages",

                  val:
                    result.stages.length,
                },

                {
                  label:
                    "Est. run time",

                  val:
                    "~4 min",
                },

              ].map((m) => (

                <div
                  className="metric-card"
                  key={m.label}
                >

                  <span className="metric-label">
                    {m.label}
                  </span>

                  <span className="metric-val">
                    {m.val}
                  </span>

                </div>
              ))}

            </div>

            {/* GRID */}

            <div className="preview-grid">

              {/* STRUCTURE */}

              <motion.div
                className="structure-card"
                initial={{
                  opacity: 0,
                  x: -40,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                }}
              >

                <div className="card-header">

                  <h2>
                    Project Structure
                  </h2>

                  <span className="card-badge">
                    detected
                  </span>

                </div>

                <pre>
                  {getStructureText()}
                </pre>

              </motion.div>

              {/* AI DETECTION */}

              <motion.div
                className="ai-card"
                initial={{
                  opacity: 0,
                  x: 40,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                }}
              >

                <div className="card-header">

                  <h2>
                    AI Detection
                  </h2>

                  <span className="card-badge success">

                    {
                      result.technologies
                        .length
                    }{" "}
                    found

                  </span>

                </div>

                <div className="stack-list">

                  {result.technologies.map(
                    (tech, i) => (

                      <motion.div
                        key={tech}
                        className="stack-item"
                        initial={{
                          opacity: 0,
                          x: 20,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            0.2 +
                            i * 0.08,
                        }}
                        whileHover={{
                          x: 5,
                        }}
                      >

                        <span className="stack-check">
                          ✔
                        </span>

                        <span className="stack-label">
                          {tech}
                        </span>

                        <span className="stack-arrow">
                          →
                        </span>

                      </motion.div>
                    )
                  )}

                </div>

              </motion.div>

            </div>

            {/* STAGES */}

            <motion.div
              className="stages-card"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
            >

              <div className="card-header">

                <h2>
                  Pipeline Stages
                </h2>

              </div>

              {result.stages.map(
                (stage, i) => (

                  <div
                    key={i}
                    className="stage-row"
                  >

                    <span className="stage-num">
                      {i + 1}
                    </span>

                    <div className="stage-info">

                      <span className="stage-name">
                        {stage.name}
                      </span>

                      <span className="stage-desc">
                        {stage.desc}
                      </span>

                    </div>

                    <span className="stage-time">
                      {stage.time}
                    </span>

                  </div>
                )
              )}

            </motion.div>

            {/* ACTION BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "20px",
                justifyContent:
                  "center",
                marginTop: "30px",
                flexWrap: "wrap",
              }}
            >

              {/* RESET */}

              <motion.button
                className="generate-btn"
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={handleReset}
              >

                <span className="btn-icon">
                  ↩
                </span>

                Analyze Another Project

              </motion.button>

              {/* NEXT */}

              <motion.button
                className="generate-btn"
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() =>
                  setCurrentStep(2)
                }
              >

                Next: Configure →

              </motion.button>

            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* FOOTER HINT */}

      {!result && (

        <motion.p
          className="hint-text"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
          }}
        >

          Paste a GitHub URL,
          upload a folder,
          or paste your file tree —
          then hit Analyze.

        </motion.p>
      )}

    </div>
  );
}

export default Dashboard;