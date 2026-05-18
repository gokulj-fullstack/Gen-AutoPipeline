require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ── Health check ──────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", model: "llama-3.1-8b-instant" }));

// ── Verify API Key ───────────────────────────────────────────
app.post("/api/verify-key", async (req, res) => {
  const apiKey = req.body.apiKey || req.headers["x-groq-api-key"] || process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(400).json({ error: "API key is required" });

  try {
    const groq = new Groq({ apiKey });
    // Simple fast call to verify key
    await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 5,
    });
    res.json({ success: true, message: "Groq API key is valid" });
  } catch (err) {
    res.status(401).json({ error: "Invalid Groq API key: " + (err.message || "Unknown error") });
  }
});

// ── Stack detector helper (deterministic, fast) ───────────────
function detectStack(input = "") {
  const src = input.toLowerCase();
  const stack = {};

  if (/package\.json|node_modules|\.jsx?|\.tsx?|next\.config|react|express/.test(src)) {
    stack.language = "Node.js";
    stack.framework = /react|next/.test(src) ? "React / Next.js" : /express/.test(src) ? "Express" : "Node.js";
    stack.packageMgr = /yarn\.lock/.test(src) ? "yarn" : "npm";
    stack.testFw = /jest|vitest/.test(src) ? "Jest" : /mocha/.test(src) ? "Mocha" : "Jest";
    stack.linter = /eslint/.test(src) ? "ESLint" : "none";
  } else if (/pom\.xml|\.java|spring|maven|gradle/.test(src)) {
    stack.language = "Java";
    stack.framework = /spring/.test(src) ? "Spring Boot" : "Java";
    stack.packageMgr = /gradle/.test(src) ? "gradle" : "mvn";
    stack.testFw = "JUnit";
    stack.linter = /checkstyle/.test(src) ? "Checkstyle" : "none";
  } else if (/requirements\.txt|setup\.py|pyproject\.toml|\.py|django|flask|fastapi/.test(src)) {
    stack.language = "Python";
    stack.framework = /django/.test(src) ? "Django" : /fastapi/.test(src) ? "FastAPI" : /flask/.test(src) ? "Flask" : "Python";
    stack.packageMgr = "pip";
    stack.testFw = "pytest";
    stack.linter = /flake8|pylint/.test(src) ? "Flake8" : "none";
  } else if (/go\.mod|\.go/.test(src)) {
    stack.language = "Go";
    stack.framework = "Go";
    stack.packageMgr = "go mod";
    stack.testFw = "go test";
    stack.linter = "golangci-lint";
  } else {
    // default
    stack.language = "Node.js";
    stack.framework = "Node.js";
    stack.packageMgr = "npm";
    stack.testFw = "Jest";
    stack.linter = "ESLint";
  }

  stack.docker = /dockerfile|docker-compose/.test(src);
  stack.iac    = /terraform/.test(src) ? "Terraform" : /helm/.test(src) ? "Helm" : /ansible/.test(src) ? "Ansible" : null;
  return stack;
}

// ── /api/detect ───────────────────────────────────────────────
app.post("/api/detect", (req, res) => {
  const { projectInput } = req.body;
  if (!projectInput) return res.status(400).json({ error: "projectInput is required" });
  const stack = detectStack(projectInput);
  res.json({ stack });
});

// ── /api/generate ─────────────────────────────────────────────
app.post("/api/generate", async (req, res) => {
  const {
    projectInput = "",
    stack: clientStack,
    deployTarget = "aws",
    branchStrategy = "gitflow",
    environments = ["dev", "staging", "prod"],
    security = ["sast", "deps"],
    registry = "ghcr",
    ciTools = ["jenkins", "github-actions"],
  } = req.body;

  const apiKey = req.headers["x-groq-api-key"] || process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(400).json({ error: "Groq API key is required. Set X-Groq-Api-Key header or GROQ_API_KEY env var." });

  const stack = clientStack || detectStack(projectInput);
  const groq = new Groq({ apiKey });

  const systemPrompt = `You are an expert DevOps engineer specialising in CI/CD pipelines.
You generate production-ready, well-commented pipeline code.
Respond ONLY with the pipeline code — no markdown fences, no prose, no extra explanation.
When asked for two pipelines, separate them with exactly: ===GITHUB_ACTIONS===`;

  const userPrompt = `Generate CI/CD pipeline code for the following project.

Stack:
- Language: ${stack.language}
- Framework: ${stack.framework}
- Package manager: ${stack.packageMgr}
- Test framework: ${stack.testFw}
- Linter: ${stack.linter || "none"}
- Docker: ${stack.docker ? "Yes (Dockerfile present)" : "No"}
- IaC: ${stack.iac || "none"}

Config:
- Deploy target: ${deployTarget}
- Branch strategy: ${branchStrategy}
- Environments: ${environments.join(", ")}
- Security stages: ${security.join(", ")}
- Container registry: ${registry}
- CI/CD tools requested: ${ciTools.join(", ")}

Requirements:
1. If "jenkins" is in CI/CD tools: write a complete declarative Jenkinsfile first.
2. If "github-actions" is in CI/CD tools: write a complete GitHub Actions YAML next.
3. Separate the two with exactly: ===GITHUB_ACTIONS===
4. Include: checkout, install, lint (if applicable), test, security scan, docker build+push, deploy per environment.
5. Use branch conditions for environment-specific deploys.
6. Add manual approval gate before production deploy.
7. Include proper comments explaining each stage.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.2,
    });

    const full = completion.choices[0]?.message?.content || "";
    const parts = full.split("===GITHUB_ACTIONS===");

    res.json({
      jenkins:       ciTools.includes("jenkins")        ? (parts[0] || "").trim() : null,
      githubActions: ciTools.includes("github-actions") ? (parts[1] || "").trim() : null,
      stack,
      usage: completion.usage,
    });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: err.message || "Groq API error" });
  }
});

// ── /api/customize ────────────────────────────────────────────
app.post("/api/customize", async (req, res) => {
  const { pipeline, instruction, tool } = req.body;
  const apiKey = req.headers["x-groq-api-key"] || process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(400).json({ error: "Groq API key required." });
  if (!pipeline || !instruction) return res.status(400).json({ error: "pipeline and instruction are required." });

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: `You are a CI/CD expert. The user has a ${tool || "CI/CD"} pipeline and wants to modify it. Apply their instruction and return ONLY the complete updated pipeline code — no markdown fences, no prose.` },
        { role: "user",   content: `Here is the current pipeline:\n\n${pipeline}\n\nInstruction: ${instruction}` },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    res.json({ pipeline: completion.choices[0]?.message?.content?.trim() || "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── /api/plan ────────────────────────────────────────────────
app.post("/api/plan", async (req, res) => {
  const { stack, deployTarget, registry, ciTools, security } = req.body;
  const apiKey = req.headers["x-groq-api-key"] || process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(400).json({ error: "API key required." });

  const groq = new Groq({ apiKey });

  const prompt = `You are a DevOps Architect. Generate a technical integration plan for this project.
Stack: ${JSON.stringify(stack)}
Target: ${deployTarget}
Registry: ${registry}
CI Tools: ${JSON.stringify(ciTools)}
Security: ${JSON.stringify(security)}

Respond ONLY with a JSON object in this exact format:
{
  "secrets": [ {"key": "NAME", "desc": "explanation", "cat": "API|CLOUD|REGISTRY|SECURITY"} ],
  "steps": [ {"title": "Action", "text": "Details"} ]
}
Include specific secrets for ${deployTarget}, ${registry}, and ${stack.language}. Limit to 5-6 critical secrets and 4 key steps.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });
    res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅  PipeGen backend running on http://localhost:${PORT}`));
