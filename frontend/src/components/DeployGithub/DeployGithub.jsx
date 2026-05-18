import { useState } from "react";
import "./DeployGithub.css";

export default function DeployGithub({ setCurrentStep, generatedPipeline, githubToken }) {

    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("ci/auto-pipeline");
    const [baseBranch, setBaseBranch] = useState("main");
    const [commitMsg, setCommitMsg] = useState("chore: add AI-generated CI/CD pipeline");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState({
        branch: "idle",
        push: "idle",
    });

    const addLog = (msg, type = "info") => {
        const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
        setLogs(prev => [...prev, { time, msg, type }]);
    };

    const handleDeploy = async () => {

        if (!repo || !branch || !githubToken) {
            addLog("Missing repo, branch, or GitHub token.", "error");
            return;
        }

        setLoading(true);
        setLogs([]);

        // =========================================
        // STEP 1 → CREATE / CHECK BRANCH
        // =========================================

        addLog(`Checking branch: ${branch}`, "info");

        setStatus(s => ({
            ...s,
            branch: "loading"
        }));

        try {

            const branchRes = await fetch(
                "http://127.0.0.1:8000/manage-branch/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token: githubToken,
                        repo,
                        branch,
                        base_branch: baseBranch
                    }),
                }
            );

            const branchData = await branchRes.json();

            if (branchData.status === "error") {
                throw new Error(branchData.message);
            }

            addLog(
                branchData.status === "created"
                    ? `Branch created from ${baseBranch} (SHA: ${branchData.sha?.slice(0, 7)})`
                    : `Branch already exists (SHA: ${branchData.sha?.slice(0, 7)})`,
                "success"
            );

            setStatus(s => ({
                ...s,
                branch: "done"
            }));

        } catch (e) {

            addLog(`Branch error: ${e.message}`, "error");

            setStatus(s => ({
                ...s,
                branch: "error"
            }));

            setLoading(false);

            return;
        }

        // =========================================
        // STEP 2 → PUSH YAML
        // =========================================

        addLog(
            "Pushing .github/workflows/smart-pipeline.yml",
            "info"
        );

        setStatus(s => ({
            ...s,
            push: "loading"
        }));

        try {

            const pushRes = await fetch(
                "http://127.0.0.1:8000/push-yaml/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token: githubToken,
                        repo,
                        branch,
                        yaml_content: generatedPipeline,
                        commit_message: commitMsg,
                    }),
                }
            );

            const pushData = await pushRes.json();

            if (pushData.status === "error") {
                throw new Error(pushData.message);
            }

            addLog(
                `Pipeline pushed successfully (commit: ${pushData.commit_sha?.slice(0, 7)})`,
                "success"
            );

            addLog(
                `GitHub URL: ${pushData.github_url}`,
                "success"
            );

            setStatus(s => ({
                ...s,
                push: "done"
            }));

        } catch (e) {

            addLog(`Push error: ${e.message}`, "error");

            setStatus(s => ({
                ...s,
                push: "error"
            }));

            setLoading(false);

            return;
        }

        // =========================================
        // DONE
        // =========================================

        setLoading(false);

        addLog(
            "Deployment complete!",
            "success"
        );
    };

    const statusDot = (key) => ({
        idle: "dot-gray",
        loading: "dot-amber",
        done: "dot-green",
        error: "dot-red",
    }[status[key]] || "dot-gray");

    const statusLabel = (key) => ({
        idle: "waiting",
        loading: "in progress...",
        done: "done",
        error: "failed",
    }[status[key]]);

    return (
        <div className="deploy-page">
            <div className="deploy-container">

                {/* HERO */}
                <div className="hero-section">
                    <div className="hero-tag">Step 6 of 6</div>
                    <h1 className="page-title">Deploy to <span>GitHub</span></h1>
                    <p className="page-subtitle">
                        Push your generated YAML, manage branches, and trigger your workflow automatically.
                    </p>
                </div>

                {/* REPO CONFIG */}
                <div className="deploy-card">
                    <div className="card-title">
                        🔗 Repository config
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label>Repository (owner/repo)</label>
                            <input
                                type="text"
                                placeholder="myorg/my-app"
                                value={repo}
                                onChange={e => setRepo(e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label>Target branch</label>
                            <input
                                type="text"
                                value={branch}
                                onChange={e => setBranch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label>Base branch (create from)</label>
                            <input
                                type="text"
                                value={baseBranch}
                                onChange={e => setBaseBranch(e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label>Commit message</label>
                            <input
                                type="text"
                                value={commitMsg}
                                onChange={e => setCommitMsg(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="commit-preview">
                        → .github/workflows/smart-pipeline.yml
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="deploy-card">
                    <div className="card-title">⚡ Automation actions</div>
                    <div className="action-grid">
                        <div className="action-item active">
                            <div className="action-icon">⬆</div>
                            <div className="action-name">Push YAML</div>
                            <div className="action-desc">Commit to .github/workflows/</div>
                        </div>
                        <div className="action-item active">
                            <div className="action-icon">⎇</div>
                            <div className="action-name">Create branch</div>
                            <div className="action-desc">Auto-create if not found</div>
                        </div>

                    </div>

                    {/* LOGS */}
                    {logs.length > 0 && (
                        <div className="log-box">
                            {logs.map((l, i) => (
                                <div key={i} className="log-line">
                                    <span className="log-time">{l.time}</span>
                                    <span className={`log-${l.type}`}>
                                        {l.type === "success" ? "✓ " : l.type === "error" ? "✗ " : "→ "}
                                        {l.msg}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* STATUS */}
                <div className="deploy-card">
                    <div className="card-title">📋 Deployment status</div>
                    {[
                        { key: "branch", label: "Branch ready", val: status.branch === "done" ? branch : statusLabel("branch") },
                        { key: "push", label: "YAML pushed", val: statusLabel("push") },

                    ].map(row => (
                        <div key={row.key} className="status-row">
                            <div className={`dot ${statusDot(row.key)}`} />
                            <span className="status-label">{row.label}</span>
                            <span className="status-val">{row.val}</span>
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="deploy-footer">
                    <button className="back-btn" onClick={() => setCurrentStep(5)}>← Back</button>
                    <button
                        className="deploy-btn"
                        onClick={handleDeploy}
                        disabled={loading}
                    >
                        {loading ? "Deploying..." : "🚀 Deploy to GitHub"}
                    </button>
                </div>

            </div>
        </div>
    );
}