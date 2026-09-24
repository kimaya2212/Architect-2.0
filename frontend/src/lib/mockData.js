// Central seed/mock data for Architect 2.0 (edit here to tweak scripted content)

export const PROJECT_TYPES = [
  { value: "web", label: "Web app" },
  { value: "agent", label: "Agent" },
  { value: "fullstack", label: "Full-stack" },
  { value: "mobile", label: "Mobile web" },
];

export const FRAMEWORKS = {
  web: ["Auto", "React", "Next.js", "Vue"],
  fullstack: ["Auto", "Next.js", "React", "Python/FastAPI"],
  mobile: ["Auto", "React", "Next.js"],
  agent: ["Auto", "LangGraph", "CrewAI", "OpenAI Agents SDK", "Claude Agent SDK", "AutoGen", "Custom"],
};

export const MODELS = [
  "Claude Sonnet 4.6",
  "GPT-5.4",
  "Gemini 3.1 Pro",
  "Claude Haiku 4.5",
  "GPT-5.4 Mini",
];

export const FRAMEWORK_TONE = {
  React: "info",
  "Next.js": "neutral",
  Vue: "success",
  "Python/FastAPI": "warning",
  LangGraph: "accent",
  CrewAI: "accent",
  Auto: "outline",
};

export const PLACEHOLDERS = [
  "A dashboard to track my SaaS revenue and churn…",
  "A support agent that answers questions from our docs…",
  "A landing page for a productivity app with pricing…",
  "An internal tool to manage customer onboarding…",
  "A booking app for a small yoga studio…",
];

export const SUGGESTIONS = [
  "Build a SaaS analytics dashboard",
  "Create an AI customer support agent",
  "Design a landing page for a fintech app",
  "Internal tool to track job applicants",
  "A CRM with contacts and deals",
  "A blog with markdown and comments",
];

export const EXAMPLE_PROMPTS = [
  "A dashboard for a coffee subscription business with orders, customers and MRR charts.",
  "An AI agent that triages support tickets and drafts replies from our help center.",
  "A clean landing page for a note-taking app with pricing tiers and an FAQ.",
];

export const ENTRY_CARDS = [
  { key: "import", title: "Import a project", desc: "GitHub, a .zip, or a public URL", icon: "GitBranch" },
  { key: "template", title: "Start from template", desc: "SaaS, agents, internal tools", icon: "LayoutTemplate" },
  { key: "agent", title: "Build an agent", desc: "LangGraph, CrewAI and more", icon: "Bot" },
];

export const TEMPLATES = [
  { id: "t1", name: "SaaS Dashboard", tag: "SaaS", desc: "Auth, billing, charts and a customers table.", accent: "emerald" },
  { id: "t2", name: "Support Agent", tag: "Agents", desc: "RAG over your docs with tool calls and traces.", accent: "violet" },
  { id: "t3", name: "Landing Page", tag: "Landing pages", desc: "Hero, features, pricing and FAQ.", accent: "blue" },
  { id: "t4", name: "Applicant Tracker", tag: "Internal tools", desc: "Kanban pipeline for hiring.", accent: "amber" },
  { id: "t5", name: "Storefront", tag: "E-commerce", desc: "Products, cart and checkout.", accent: "rose" },
  { id: "t6", name: "Research Agent", tag: "Agents", desc: "Multi-step web research with citations.", accent: "cyan" },
];

export const FRAMEWORK_LOGOS = ["LangGraph", "CrewAI", "OpenAI Agents SDK", "Claude Agent SDK", "AutoGen", "Vercel AI SDK"];

export const ONBOARD_GOALS = [
  { key: "product", title: "Build a product", desc: "Ship a real app you can deploy", icon: "Rocket" },
  { key: "agent", title: "Build an AI agent", desc: "Automate work with tools and memory", icon: "Bot" },
  { key: "internal", title: "Internal tool", desc: "Dashboards and admin panels", icon: "PanelsTopLeft" },
  { key: "explore", title: "Just exploring", desc: "See what's possible", icon: "Compass" },
];

export const ONBOARD_WORKSTYLES = [
  { key: "no_code", mode: "simple", title: "I don't code", desc: "Plain-English chat and a big Deploy button.", icon: "MessageSquare" },
  { key: "code_sometimes", mode: "simple", title: "I code sometimes", desc: "Simple by default, code shown when you want it.", icon: "SquareCode" },
  { key: "developer", mode: "pro", title: "I'm a developer", desc: "Files, terminal, diffs, logs and traces.", icon: "Terminal" },
];
