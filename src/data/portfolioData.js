// ============================================================
// PORTFOLIO DATA — placeholder content for Kirsten
// Swap values here; everything flows to the buffers.
// ============================================================

const PROFILE = {
  name: "Kirsten",
  role: "Full Stack Engineer",
  location: "San Francisco, CA",
  email: "kirsten@example.dev",
  github: "github.com/kirsten",
  linkedin: "linkedin.com/in/kirsten",
  site: "kirsten.dev",
  tagline: "I ship end-to-end: type-safe APIs, reactive UIs, boring infra.",
};

const ABOUT_LINES = [
  { t: "h1", v: "~ Kirsten / Full Stack Engineer" },
  { t: "p",  v: "I build things that make the tab bar feel lighter —" },
  { t: "p",  v: "small primitives, fast feedback loops, and docs that" },
  { t: "p",  v: "don't lie." },
  { t: "sp" },
  { t: "h2", v: ":: now" },
  { t: "li", v: "Building an internal tooling platform (Next.js, tRPC, Postgres)." },
  { t: "li", v: "Writing a tiny terminal debugger for long-running jobs." },
  { t: "li", v: "Maintaining 3 OSS repos — see :e projects/oss.md." },
  { t: "sp" },
  { t: "h2", v: ":: interests" },
  { t: "li", v: "Developer experience, editor tooling, typed schemas." },
  { t: "li", v: "Databases — indexes, query plans, the boring parts." },
  { t: "li", v: "Climbing v4s (slowly), making pour-over (quickly)." },
  { t: "sp" },
  { t: "cm", v: "-- find me --" },
  { t: "p",  v: "email    kirsten@example.dev" },
  { t: "p",  v: "github   github.com/kirsten" },
  { t: "p",  v: "site     kirsten.dev" },
];

const EXPERIENCE = [
  {
    when: "2024 — now",
    role: "Senior Full Stack Engineer",
    co: "@ Lumen Systems",
    bullets: [
      "Led the rewrite of the billing dashboard — 40% reduction in p95 load time, zero customer-reported regressions.",
      "Shipped a schema-first GraphQL layer consolidating 6 internal services; now used by 12 teams.",
      "Onboarded and mentored 3 engineers; wrote the team's front-end testing playbook.",
    ],
    stack: ["TypeScript", "Next.js", "GraphQL", "Postgres", "Redis"],
  },
  {
    when: "2021 — 2024",
    role: "Full Stack Engineer",
    co: "@ Harbor Labs",
    bullets: [
      "Built the real-time collaboration engine from scratch (CRDTs over WebSockets).",
      "Reduced cold-start on serverless endpoints from 1.4s → 180ms via careful bundle splitting.",
      "Designed and migrated the events pipeline to Kafka — 5x throughput with same spend.",
    ],
    stack: ["Go", "TypeScript", "React", "Kafka", "AWS"],
  },
  {
    when: "2019 — 2021",
    role: "Software Engineer",
    co: "@ Paperplane",
    bullets: [
      "Owned the design system (tokens, a11y-tested components, Storybook docs).",
      "Shipped the public API and docs site; grew dev signups 3x in 9 months.",
    ],
    stack: ["React", "Node.js", "Rust", "MDX"],
  },
  {
    when: "2018 — 2019",
    role: "Software Engineer, Intern → FTE",
    co: "@ Koi Labs",
    bullets: [
      "Rebuilt the onboarding flow — conversion up 28%.",
      "Became the resident 'why is this query slow' person.",
    ],
    stack: ["Rails", "jQuery", "MySQL"],
  },
];

const PROJECTS = [
  {
    name: "harbor-cli",
    tag: "OSS · 2.1k ⭐",
    desc: "A POSIX-friendly CLI for shipping Docker builds to a registry with zero-downtime deploys. Written in Go.",
    chips: ["Go", "Docker", "CLI"],
    href: "#",
  },
  {
    name: "lumen-sdk",
    tag: "TypeScript",
    desc: "End-to-end type-safe SDK generator from an OpenAPI spec. Drops into monorepos cleanly.",
    chips: ["TypeScript", "OpenAPI", "tRPC"],
    href: "#",
  },
  {
    name: "quillmark",
    tag: "Personal",
    desc: "A markdown-first CMS that treats git as the database. I dogfood it for my blog.",
    chips: ["Rust", "SQLite", "Markdown"],
    href: "#",
  },
  {
    name: "paperplane-ui",
    tag: "Design system",
    desc: "Headless React component library with a focus on accessibility and keyboard-first navigation.",
    chips: ["React", "a11y", "Radix"],
    href: "#",
  },
  {
    name: "pgtop",
    tag: "OSS · 640 ⭐",
    desc: "htop-style live view of Postgres queries. Color-coded by blocked/running/waiting.",
    chips: ["Rust", "Postgres", "TUI"],
    href: "#",
  },
  {
    name: "koiboard",
    tag: "Side project",
    desc: "A keyboard-only kanban board. 100% of actions have a shortcut; mouse is optional.",
    chips: ["Svelte", "IndexedDB", "PWA"],
    href: "#",
  },
];

const SKILLS = [
  {
    group: "Languages",
    items: [
      { n: "TypeScript", p: 95 },
      { n: "Go",         p: 85 },
      { n: "Rust",       p: 72 },
      { n: "Python",     p: 78 },
      { n: "SQL",        p: 88 },
    ],
  },
  {
    group: "Frontend",
    items: [
      { n: "React / Next.js", p: 94 },
      { n: "CSS / Tailwind",  p: 90 },
      { n: "Svelte",          p: 70 },
      { n: "Accessibility",   p: 82 },
    ],
  },
  {
    group: "Backend & Infra",
    items: [
      { n: "Postgres",       p: 88 },
      { n: "Node.js",        p: 92 },
      { n: "Kafka / Queues", p: 76 },
      { n: "Docker / K8s",   p: 74 },
      { n: "AWS",            p: 72 },
    ],
  },
  {
    group: "Tools",
    items: [
      { n: "Neovim (obviously)", p: 99 },
      { n: "tmux + zsh",         p: 92 },
      { n: "Git",                p: 94 },
      { n: "Linear / Notion",    p: 80 },
    ],
  },
];

const EDUCATION = [
  {
    when: "2014 — 2018",
    role: "B.S. Computer Science",
    co: "@ University of Somewhere",
    bullets: [
      "Focus on distributed systems and PL theory.",
      "TA'd intro algorithms and a compilers seminar.",
      "Senior thesis: 'Incremental query planning for OLTP workloads'.",
    ],
    stack: ["C", "OCaml", "Haskell"],
  },
  {
    when: "ongoing",
    role: "Self-directed",
    co: "@ Everywhere",
    bullets: [
      "Currently reading: 'Designing Data-Intensive Applications' (3rd re-read).",
      "Writing one post a month on kirsten.dev/notes.",
    ],
    stack: ["books", "blogs", "RSS"],
  },
];

const OSS_REPOS = [
  { name: "harbor-cli",    stars: 2143, lang: "Go",        desc: "Zero-downtime Docker deploys from your terminal." },
  { name: "pgtop",         stars:  640, lang: "Rust",      desc: "htop for Postgres queries — blocked/waiting/running." },
  { name: "quillmark",     stars:  214, lang: "Rust",      desc: "Markdown CMS with git as the database." },
  { name: "lumen-sdk",     stars:  188, lang: "TypeScript",desc: "OpenAPI → typed SDK generator, monorepo-friendly." },
  { name: "koiboard",      stars:   92, lang: "Svelte",    desc: "Keyboard-only kanban. Mouse optional." },
  { name: "dotfiles",      stars:  410, lang: "Lua",       desc: "My Neovim + tmux + zsh config. Stole nothing I didn't understand." },
];

const CONTACT = [
  { k: "email",    v: "kirsten@example.dev" },
  { k: "github",   v: "github.com/kirsten" },
  { k: "linkedin", v: "linkedin.com/in/kirsten" },
  { k: "site",     v: "kirsten.dev" },
  { k: "resume",   v: "resume.pdf (download)" },
  { k: "timezone", v: "UTC−8 · open to remote / SF-based roles" },
];

const HELP_LINES = [
  { t: "h1", v: ":help portfolio.txt" },
  { t: "sp" },
  { t: "h2", v: ":: navigation" },
  { t: "p",  v: "  click any file in the tree, or..." },
  { t: "p",  v: "  :e <file>     open a buffer      e.g. :e projects" },
  { t: "p",  v: "  :b <n>        switch by index    e.g. :b 3" },
  { t: "p",  v: "  :bn / :bp     next / prev buffer" },
  { t: "p",  v: "  gg / G        top / bottom of buffer" },
  { t: "p",  v: "  j / k         scroll down / up" },
  { t: "p",  v: "  <C-p>         telescope (fuzzy finder)" },
  { t: "sp" },
  { t: "h2", v: ":: commands" },
  { t: "p",  v: "  :help         this screen" },
  { t: "p",  v: "  :make         build something fun" },
  { t: "p",  v: "  :colorscheme  <mocha|latte|gruvbox|tokyonight>" },
  { t: "p",  v: "  :set nu / nonu        toggle line numbers" },
  { t: "p",  v: "  :set rnu      relative line numbers" },
  { t: "p",  v: "  :NvimTreeToggle       toggle file tree" },
  { t: "p",  v: "  :wq           save the portfolio (you won't)" },
  { t: "p",  v: "  :q            try it." },
  { t: "sp" },
  { t: "h2", v: ":: search" },
  { t: "p",  v: "  /pattern      search this buffer" },
  { t: "p",  v: "  n / N         next / previous match" },
  { t: "sp" },
  { t: "cm", v: "tip: try the konami code. ↑↑↓↓←→←→BA" },
];

const MAKE_LINES = [
  "[make] rm -rf dist/ && tsc && bundle && sign ...",
  "[make] ✓ typecheck     (0 errors, 0 warnings)",
  "[make] ✓ tests          (128 passed, 0 failed, 0 skipped)",
  "[make] ✓ lint           (no issues)",
  "[make] ✓ bundle         (312 KB → 94 KB gz)",
  "[make] ✓ deploy:preview https://kirsten.dev/preview",
  "",
  "                  . . .",
  "             .  .  .  . .",
  "         . * .   SHIPPED   . *",
  "             .  .  .  . .",
  "                  . . .",
  "",
  "built by Kirsten — full stack engineer",
  "press any key, or type :q to close (you know you won't)",
];

// files shown in the NvimTree
const FILES = [
  // id                 label               icon     bufferId
  { id: "dashboard",    label: "dashboard",     icon: "txt",  kind: "dashboard"  },
  { id: "readme",       label: "README.md",     icon: "md",   kind: "about"      },
  { id: "sep1",         separator: true },
  { id: "experience",   label: "experience.ts", icon: "ts", kind: "experience" },
  { id: "projects",     label: "projects.md",   icon: "md", kind: "projects"   },
  { id: "skills",       label: "skills.yaml",   icon: "yaml", kind: "skills"   },
  { id: "education",    label: "education.md",  icon: "md", kind: "education"  },
  { id: "oss",          label: "oss.json",      icon: "json", kind: "oss"      },
  { id: "contact",      label: "contact.sh",    icon: "sh", kind: "contact"    },
  { id: "sep2",         separator: true },
  { id: "help",         label: ":help",         icon: "txt", kind: "help"     },
];

// telescope index
const FUZZY_INDEX = [
  { id: "dashboard",  label: "dashboard",       hint: "landing · overview",    kind: "dashboard" },
  { id: "about",      label: "README.md",       hint: "bio · overview",        kind: "about" },
  { id: "experience", label: "experience.ts",   hint: "work history",          kind: "experience" },
  { id: "projects",   label: "projects.md",     hint: "selected projects",     kind: "projects" },
  { id: "skills",     label: "skills.yaml",     hint: "languages · frameworks",kind: "skills" },
  { id: "education",  label: "education.md",    hint: "school · learning",     kind: "education" },
  { id: "oss",        label: "oss.json",        hint: "open source repos",     kind: "oss" },
  { id: "contact",    label: "contact.sh",      hint: "how to reach me",       kind: "contact" },
  { id: "help",       label: ":help",           hint: "commands · shortcuts",  kind: "help" },
  { id: "theme-cream",     label: ":colorscheme cream",     hint: "action · paper light", kind: "action", action: "theme:cream" },
  { id: "theme-mocha",     label: ":colorscheme mocha",     hint: "action · catppuccin dark", kind: "action", action: "theme:mocha" },
  { id: "theme-latte",     label: ":colorscheme latte",     hint: "action · catppuccin light", kind: "action", action: "theme:latte" },
  { id: "theme-gruvbox",   label: ":colorscheme gruvbox",   hint: "action · retro warm", kind: "action", action: "theme:gruvbox" },
  { id: "theme-tokyonight",label: ":colorscheme tokyonight",hint: "action · cold night", kind: "action", action: "theme:tokyonight" },
  { id: "make",            label: ":make",                  hint: "action · ship it", kind: "action", action: "make" },
  { id: "quit",            label: ":q",                     hint: "action · try it", kind: "action", action: "quit" },
];

export const PORTFOLIO_DATA = {
  PROFILE, ABOUT_LINES, EXPERIENCE, PROJECTS, SKILLS, EDUCATION, OSS_REPOS, CONTACT, HELP_LINES, MAKE_LINES, FILES, FUZZY_INDEX,
};

export {
  PROFILE,
  ABOUT_LINES,
  EXPERIENCE,
  PROJECTS,
  SKILLS,
  EDUCATION,
  OSS_REPOS,
  CONTACT,
  HELP_LINES,
  MAKE_LINES,
  FILES,
  FUZZY_INDEX,
};
