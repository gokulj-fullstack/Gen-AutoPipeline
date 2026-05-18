import { useState } from "react";

function GithubInput({ onAnalyze }) {
  const [url, setUrl]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState("");

  const STEPS = [
    "Fetching repository...",
    "Reading file tree...",
    "Detecting stack...",
    "Generating pipeline...",
    "Done!",
  ];

  const isValid = (val) =>
    /^https?:\/\/(www\.)?github\.com\/[\w\-.]+\/[\w\-.]+/.test(val.trim());

  const handleAnalyze = async () => {
    setError("");
    if (!url.trim()) {
      setError("Please enter a GitHub URL.");
      return;
    }
    if (!isValid(url)) {
      setError("Enter a valid GitHub URL — e.g. https://github.com/user/repo");
      return;
    }

    setLoading(true);

    for (let i = 0; i < STEPS.length; i++) {
      setStep(STEPS[i]);
      await new Promise((r) => setTimeout(r, 900));
    }

    // TODO: replace mock with real API call
    // const res = await fetch("/api/generate", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ url }),
    // });
    // const data = await res.json();
    // onAnalyze(data);

    onAnalyze({
      source: "github",
      url,
      filesScanned: 47,
      technologies: ["React.js", "Node.js 18", "Docker", "MongoDB", "Jest", "ESLint"],
      stages: [
        { name: "Checkout & Install", desc: "actions/checkout@v3 · npm ci",          time: "~30s"  },
        { name: "Lint",               desc: "ESLint detected · npm run lint",         time: "~20s"  },
        { name: "Test",               desc: "Jest detected · npm test -- --coverage", time: "~60s"  },
        { name: "Build",              desc: "npm run build",                           time: "~90s"  },
        { name: "Docker Build & Push",desc: "Dockerfile detected · push to ghcr.io", time: "~2min" },
      ],
    });

    setLoading(false);
  };

  return (
    <div className="github-input-wrapper">
      <div className="github-input-row">
        <div className="github-input-wrap">
          <span className="input-icon">⌥</span>
          <input
            type="text"
            placeholder="https://github.com/username/repository"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            disabled={loading}
          />
        </div>
        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error && <p className="input-error">⚠ {error}</p>}

      {loading && (
        <div className="loading-wrap">
          <div className="loading-bar">
            <div className="loading-fill" />
          </div>
          <p className="loading-step">{step}</p>
        </div>
      )}
    </div>
  );
}

export default GithubInput;
