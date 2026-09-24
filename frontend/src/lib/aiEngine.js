// Scripted "AI engine" for Architect 2.0. All content is mock/scripted (no LLM).
// Edit everything here to tweak the demo.

export function pickScript(prompt = "") {
  const p = prompt.toLowerCase();
  if (/(agent|support|chatbot|assistant|triage|rag|customer)/.test(p)) return "agent";
  if (/(landing|marketing|homepage|waitlist|pricing page|hero)/.test(p)) return "landing";
  if (/(dashboard|saas|analytics|crm|admin|metrics|revenue|tracker|internal)/.test(p)) return "saas";
  return "default";
}

export const SCRIPTS = {
  saas: {
    preview: "saas",
    intro:
      "I'll build a SaaS analytics dashboard. Here's my plan — review it, tweak anything, then approve to start the build.",
    plan: {
      Pages: ["Dashboard (KPIs + charts)", "Customers table", "Billing & plans", "Settings"],
      "Data model": ["customers (name, plan, mrr, status)", "invoices (amount, date, paid)", "events (type, ts)"],
      Integrations: ["Authentication (email + Google)", "Stripe billing", "Postgres database"],
      Agents: [],
    },
    steps: [
      { label: "Setting up project", ms: 1600, sub: ["Scaffolding Next.js app", "Installing dependencies"], files: 6 },
      { label: "Creating database", ms: 2200, sub: ["Creating tables: customers, invoices, events", "Seeding demo rows"], files: 3 },
      { label: "Designing pages", ms: 2600, sub: ["Dashboard layout", "Customers table", "Billing page"], files: 8, section: 0 },
      { label: "Building dashboard", ms: 2400, sub: ["Wiring KPI cards", "Revenue chart", "Recent activity"], files: 5, section: 1 },
      { label: "Wiring authentication", ms: 2000, sub: ["Email + Google sign-in", "Protected routes"], files: 4, section: 2 },
      { label: "Running checks", ms: 1800, sub: ["Type-check", "Lint", "Build passes"], files: 0 },
    ],
    filesChanged: { count: 26, added: 820, removed: 12 },
    suggestions: ["Add a customers table", "Connect Stripe billing", "Make it mobile friendly"],
    done: "Your dashboard is ready. I set up auth, a live revenue chart and a customers table with demo data. What next?",
  },
  landing: {
    preview: "landing",
    intro:
      "I'll build a clean marketing landing page. Here's the plan — approve it to start the build.",
    plan: {
      Pages: ["Hero", "Features", "Pricing", "FAQ", "Footer"],
      "Data model": ["waitlist (email, created_at)"],
      Integrations: ["Email capture (Resend)", "Analytics"],
      Agents: [],
    },
    steps: [
      { label: "Setting up project", ms: 1500, sub: ["Scaffolding React + Vite", "Installing Tailwind"], files: 5 },
      { label: "Designing pages", ms: 2600, sub: ["Hero section", "Feature grid", "Pricing tiers"], files: 7, section: 0 },
      { label: "Building sections", ms: 2400, sub: ["FAQ accordion", "Footer", "Responsive pass"], files: 4, section: 1 },
      { label: "Wiring email capture", ms: 1800, sub: ["Waitlist form", "Resend integration"], files: 3, section: 2 },
      { label: "Running checks", ms: 1600, sub: ["Lighthouse", "Build passes"], files: 0 },
    ],
    filesChanged: { count: 19, added: 540, removed: 4 },
    suggestions: ["Add a waitlist form", "Add testimonials", "Add dark mode"],
    done: "Your landing page is live in the preview — hero, features, pricing and an FAQ. Want to add a waitlist form?",
  },
  agent: {
    preview: "support",
    intro:
      "I'll build an AI support agent with retrieval over your docs and a couple of tools. Here's the plan.",
    plan: {
      Pages: ["Chat widget", "Admin: conversations", "Knowledge base"],
      "Data model": ["documents (title, body, embedding)", "conversations (messages, resolved)"],
      Integrations: ["OpenAI / Anthropic model", "Vector store"],
      Agents: ["Support agent (LangGraph)", "Tools: Web search, Database, Email"],
    },
    steps: [
      { label: "Setting up project", ms: 1500, sub: ["Scaffolding app", "Installing agent SDK"], files: 6 },
      { label: "Creating database", ms: 2000, sub: ["documents + embeddings", "conversations table"], files: 3 },
      { label: "Indexing knowledge base", ms: 2400, sub: ["Chunking docs", "Building vector index"], files: 2, section: 0 },
      { label: "Connecting agent", ms: 2600, sub: ["System prompt", "Tools: search, db, email", "Guardrails"], files: 5, section: 1 },
      { label: "Building chat UI", ms: 2000, sub: ["Streaming responses", "Sources panel"], files: 4, section: 2 },
      { label: "Running checks", ms: 1600, sub: ["Eval suite", "Latency test"], files: 0 },
    ],
    filesChanged: { count: 24, added: 760, removed: 8 },
    suggestions: ["Open the Agents playground", "Add a web search tool", "Set a fallback message"],
    done: "Your support agent is wired up with retrieval and tools. Open the Agents tab to try it in the playground.",
  },
  default: {
    preview: "default",
    intro: "Here's a plan for what you described. Review it and approve to start building.",
    plan: {
      Pages: ["Home", "Detail", "Settings"],
      "Data model": ["items (title, status, created_at)"],
      Integrations: ["Authentication", "Database"],
      Agents: [],
    },
    steps: [
      { label: "Setting up project", ms: 1600, sub: ["Scaffolding app", "Installing dependencies"], files: 6 },
      { label: "Creating database", ms: 2000, sub: ["Creating tables", "Seeding data"], files: 3 },
      { label: "Designing pages", ms: 2400, sub: ["Home", "Detail", "Settings"], files: 7, section: 0 },
      { label: "Building features", ms: 2200, sub: ["List + create", "Edit + delete"], files: 5, section: 1 },
      { label: "Wiring authentication", ms: 1800, sub: ["Sign-in", "Protected routes"], files: 4, section: 2 },
      { label: "Running checks", ms: 1600, sub: ["Type-check", "Build passes"], files: 0 },
    ],
    filesChanged: { count: 22, added: 640, removed: 6 },
    suggestions: ["Add login", "Make it mobile friendly", "Add a dashboard"],
    done: "Your app is ready in the preview. What would you like to change or add?",
  },
};

export function getScript(prompt) {
  return SCRIPTS[pickScript(prompt)];
}

// ---- Agent playground trace scripts ----
export function buildTrace(question = "") {
  const q = question.trim() || "How do I reset my password?";
  const steps = [
    {
      type: "llm", title: "Plan the response", model: "Claude Sonnet 4.6",
      input: `User: ${q}`,
      output: "The user needs account help. I should search the knowledge base before answering.",
      tokens: 214, latency: 640, cost: 0.0011,
    },
    {
      type: "retrieval", title: "Search knowledge base",
      input: `query: "${q}"`,
      output: "3 matches · 'Resetting your password' (0.92), 'Account security' (0.81), 'Login issues' (0.74)",
      tokens: 0, latency: 180, cost: 0.0,
    },
    {
      type: "tool", title: "get_account_status", tool: "Database",
      input: '{ "email": "user@acme.com" }',
      output: '{ "status": "active", "sso": false, "last_login": "2d ago" }',
      tokens: 0, latency: 90, cost: 0.0,
    },
    {
      type: "llm", title: "Compose answer", model: "Claude Sonnet 4.6",
      input: "context: 3 docs + account status",
      output: "Draft a concise, friendly step-by-step reset guide with a direct link.",
      tokens: 486, latency: 910, cost: 0.0026,
    },
  ];
  const answer =
    "Here's how to reset your password:\n\n1. Go to the sign-in page and choose **Forgot password**.\n2. Enter the email on your account — we'll send a secure link (valid 15 minutes).\n3. Open the link and set a new password.\n\nYour account is active and not using SSO, so the email reset will work. Want me to send the reset email now?";
  const totals = {
    tokens: steps.reduce((a, s) => a + s.tokens, 0),
    latency: steps.reduce((a, s) => a + s.latency, 0),
    cost: steps.reduce((a, s) => a + s.cost, 0),
  };
  return { steps, answer, totals };
}

// mock source files shown in the Code tab (Pro)
export const MOCK_FILES = [
  { path: "app/page.tsx", lang: "tsx", git: "M" },
  { path: "app/dashboard/page.tsx", lang: "tsx", git: "A" },
  { path: "components/RevenueChart.tsx", lang: "tsx", git: "A" },
  { path: "lib/db.ts", lang: "ts", git: "M" },
  { path: "app/api/customers/route.ts", lang: "ts", git: "A" },
];

export const MOCK_CODE = {
  "app/page.tsx": `export default function Home() {\n  return (\n    <main className="p-8">\n      <h1 className="text-2xl font-semibold">Northwind Analytics</h1>\n      <Dashboard />\n    </main>\n  );\n}`,
  "app/dashboard/page.tsx": `import { RevenueChart } from "@/components/RevenueChart";\n\nexport default function Dashboard() {\n  const { data } = useMetrics();\n  return (\n    <section className="grid gap-4 md:grid-cols-3">\n      <KpiCard label="MRR" value={data.mrr} />\n      <KpiCard label="Customers" value={data.customers} />\n      <RevenueChart series={data.series} />\n    </section>\n  );\n}`,
  "components/RevenueChart.tsx": `export function RevenueChart({ series }) {\n  return <LineChart data={series} x="month" y="revenue" />;\n}`,
  "lib/db.ts": `import { Pool } from "pg";\nexport const db = new Pool({ connectionString: process.env.DATABASE_URL });`,
  "app/api/customers/route.ts": `export async function GET() {\n  const rows = await db.query("select * from customers order by mrr desc");\n  return Response.json(rows);\n}`,
};

export const MOCK_TERMINAL_HELP = ["npm run dev", "npm test", "git status", "ls", "clear", "help"];

export function runTerminal(cmd) {
  const c = cmd.trim();
  if (c === "npm run dev") return ["> next dev", "  ▲ Next.js 14.2", "  - Local:  http://localhost:3000", "  ✓ Ready in 1.2s"];
  if (c === "npm test") return ["> jest", " PASS  tests/dashboard.test.tsx", " PASS  tests/api.test.ts", "Tests: 12 passed, 12 total"];
  if (c === "git status") return ["On branch chat/session-1", "Changes not staged for commit:", "  modified:   app/page.tsx", "  new file:   components/RevenueChart.tsx"];
  if (c === "ls") return ["app  components  lib  public  package.json  tsconfig.json"];
  if (c === "clear") return "__clear__";
  if (c === "help") return ["Available: " + MOCK_TERMINAL_HELP.join(", ")];
  if (!c) return [];
  return [`command not found: ${c}`, "Type 'help' for available commands."];
}

export function mockLogs() {
  return [
    { level: "info", ts: "12:04:01", msg: "Server listening on :3000" },
    { level: "info", ts: "12:04:01", msg: "Connected to Postgres" },
    { level: "info", ts: "12:04:02", msg: "GET / 200 in 42ms" },
    { level: "info", ts: "12:04:03", msg: "GET /dashboard 200 in 88ms" },
    { level: "warn", ts: "12:04:05", msg: "Slow query: select * from events (312ms)" },
    { level: "info", ts: "12:04:07", msg: "GET /api/customers 200 in 24ms" },
    { level: "error", ts: "12:04:12", msg: "Stripe webhook signature missing (ignored in preview)" },
    { level: "info", ts: "12:04:14", msg: "Hot reload: components/RevenueChart.tsx" },
  ];
}
