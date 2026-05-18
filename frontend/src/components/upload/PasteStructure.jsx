import { useState } from "react";

const SAMPLE = `my-project/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Dashboard.jsx
│   │   └── PipelineCard.jsx
│   ├── pages/
│   │   ├── index.jsx
│   │   └── results.jsx
│   └── api/
│       ├── generate.js
│       └── detect.js
├── app.js
├── server.js
├── public/
│   └── assets/
├── package.json
├── .env.example
├── Dockerfile
└── docker-compose.yml`;

function PasteStructure({ onAnalyze }) {
  const [text, setText] = useState("");

  const handleAnalyze = () => {
    if (!text.trim()) return;
    onAnalyze({
      source: "paste",
      structure: text,
      filesScanned: text.split("\n").length,
      technologies: ["React.js", "Node.js", "Docker"],
      stages: [
        { name: "Checkout & Install", desc: "npm ci",           time: "~30s"  },
        { name: "Lint",               desc: "npm run lint",     time: "~20s"  },
        { name: "Build",              desc: "npm run build",    time: "~90s"  },
        { name: "Docker Build & Push",desc: "push to ghcr.io", time: "~2min" },
      ],
    });
  };

  return (
    <div className="paste-structure-wrapper">
      <div className="textarea-wrap">
        <textarea
          placeholder="Paste your project structure here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="textarea-toolbar">
          <button className="sample-btn" onClick={() => setText(SAMPLE)}>
            ✦ Load sample
          </button>
          <span className="char-count">{text.length} chars</span>
        </div>
      </div>

      <button
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={!text.trim()}
      >
         Analyze Structure
      </button>
    </div>
  );
}

export default PasteStructure;
