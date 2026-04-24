// ============================================================
// DASHBOARD BUFFER — Neovim-style landing page with tile snapshots
// ============================================================

import React from "react";
import { PORTFOLIO_DATA } from "../data/portfolioData";

const ASCII_KIRSTEN = [
"  ██╗  ██╗ ██╗ ██████╗  ███████╗ ████████╗ ███████╗ ███╗   ██╗",
"  ██║ ██╔╝ ██║ ██╔══██╗ ██╔════╝ ╚══██╔══╝ ██╔════╝ ████╗  ██║",
"  █████╔╝  ██║ ██████╔╝ ███████╗    ██║    █████╗   ██╔██╗ ██║",
"  ██╔═██╗  ██║ ██╔══██╗ ╚════██║    ██║    ██╔══╝   ██║╚██╗██║",
"  ██║  ██╗ ██║ ██║  ██║ ███████║    ██║    ███████╗ ██║ ╚████║",
"  ╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚═╝ ╚══════╝    ╚═╝    ╚══════╝ ╚═╝  ╚═══╝",
];

// Contribution grid - deterministic pseudo-random
function Contrib() {
  const cells = [];
  let s = 12345;
  for (let i = 0; i < 26 * 7; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    let lvl = 0;
    if (r > 0.35) lvl = 1;
    if (r > 0.6) lvl = 2;
    if (r > 0.8) lvl = 3;
    if (r > 0.93) lvl = 4;
    cells.push(lvl);
  }
  return (
    <div className="contrib">
      {cells.map((l, i) => <div key={i} className={`c ${l ? "l" + l : ""}`} />)}
    </div>
  );
}

// snippet rendering — short preview lines for a tile
function tileLines(kind) {
  const { OSS_REPOS } = PORTFOLIO_DATA;
  if (kind === "experience") {
    const out = [];
    out.push({ t: "cm", v: "// 3+ years · 3 companies · latest: ONE360" });
    out.push({ t: "ln", parts: [{ c: "attr", v: "2023 — now    " }, { c: "fn", v: "Software Engineer → Lead Engineer" }] });
    out.push({ t: "ln", parts: [{ c: "muted", v: "               @ ONE360" }] });
    out.push({ t: "ln", parts: [{ c: "attr", v: "2023          " }, { c: "fn", v: "Software Engineer Intern" }] });
    out.push({ t: "ln", parts: [{ c: "muted", v: "               @ Rocket Mortgage" }] });
    out.push({ t: "ln", parts: [{ c: "attr", v: "2022 — 2023   " }, { c: "fn", v: "Software Engineer Intern" }] });
    out.push({ t: "ln", parts: [{ c: "muted", v: "               @ Grid Protection Alliance" }] });
    return out;
  }
  if (kind === "projects") {
    const out = [];
    out.push({ t: "cm", v: "# 3 highlighted projects · production and prototype work" });
    out.push({ t: "ln", parts: [{ c: "bullet", v: "• " }, { c: "yellow-txt", v: "ONE360 ETL Platform" }, { c: "muted", v: " · 12+ pipelines · C# / .NET" }] });
    out.push({ t: "ln", parts: [{ c: "bullet", v: "• " }, { c: "yellow-txt", v: "YOLO-OBB Aerial Detection" }, { c: "muted", v: " · CV prototype · PyTorch" }] });
    out.push({ t: "ln", parts: [{ c: "bullet", v: "• " }, { c: "yellow-txt", v: "OpenSEE Waveform Rendering" }, { c: "muted", v: " · OSS · Three.js" }] });
    return out;
  }
  if (kind === "oss") {
    const out = [];
    out.push({ t: "cm", v: "// 6 repos · 3.5k stars · MIT licensed" });
    OSS_REPOS.slice(0, 3).forEach((r) => {
      out.push({ t: "ln", parts: [
        { c: "yellow-txt", v: r.name.padEnd(14) },
        { c: "num", v: "⭐ " + r.stars.toLocaleString().padEnd(6) },
        { c: "muted", v: r.lang },
      ]});
    });
    return out;
  }
  if (kind === "education") {
    const out = [];
    out.push({ t: "cm", v: "# BS Computer Science · plus self-directed ML study" });
    out.push({ t: "ln", parts: [
      { c: "fn", v: "University of [Your School]" },
      { c: "cm", v: " // TODO: fill in" },
      { c: "fn", v: " · graduated [Year]" },
      { c: "cm", v: " // TODO: fill in" },
    ]});
    out.push({ t: "ln", parts: [{ c: "muted", v: "Relevant coursework: algorithms, systems, ML foundations" }] });
    return out;
  }
  if (kind === "contact") {
    const out = [];
    out.push({ t: "cm", v: "#!/usr/bin/env bash  # email, github, linkedin" });
    out.push({ t: "ln", parts: [
      { c: "teal-txt", v: "email".padEnd(10) },
      { c: "var", v: "kirsten@[yourdomain]" },
      { c: "cm", v: " // TODO: fill in" },
    ]});
    out.push({ t: "ln", parts: [
      { c: "teal-txt", v: "github".padEnd(10) },
      { c: "var", v: "github.com/[yourhandle]" },
      { c: "cm", v: " // TODO: fill in" },
    ]});
    out.push({ t: "ln", parts: [
      { c: "teal-txt", v: "linkedin".padEnd(10) },
      { c: "var", v: "linkedin.com/in/[yourhandle]" },
      { c: "cm", v: " // TODO: fill in" },
    ]});
    return out;
  }
  return [];
}

function Tile({ kind, onOpen, file, range, children, cta, className = "" }) {
  return (
    <div className={`tile ${className}`.trim()} onClick={() => onOpen && onOpen(kind)}>
      <div className="tile-hd">
        <span className="f">{file}</span>
        <span className="r">{range || ""}</span>
      </div>
      <div className="tile-bd">{children}</div>
      <div className="cta">
        <span>{cta || "→ open buffer"}</span>
        <span className="k">:e {kind}</span>
      </div>
    </div>
  );
}

function renderTileLines(kind) {
  const lines = tileLines(kind);
  const clsMap = {
    "cm": "cm", "muted": "muted", "attr": "attr", "fn": "fn",
    "num": "num", "bullet": "bullet", "var": "var",
    "yellow-txt": "", "teal-txt": "",
  };
  const styleMap = {
    "yellow-txt": { color: "var(--yellow)", fontWeight: 600 },
    "teal-txt":   { color: "var(--teal)" },
  };
  return lines.map((l, i) => {
    if (l.t === "cm") {
      return (
        <span key={i} className="ln">
          <span className="lnum">{String(i + 1).padStart(2, " ")}</span>
          <span className="cm">{l.v}</span>
        </span>
      );
    }
    return (
      <span key={i} className="ln">
        <span className="lnum">{String(i + 1).padStart(2, " ")}</span>
        {l.parts.map((p, j) => (
          <span key={j} className={clsMap[p.c] || ""} style={styleMap[p.c] || {}}>{p.v}</span>
        ))}
      </span>
    );
  });
}

export default function DashboardBuffer({ onOpen, onCommand }) {
  const { PROFILE } = PORTFOLIO_DATA;

  // skill bars
  const radarData = [
    { n: "TypeScript",    p: 80, level: "Expert" },
    { n: "C# / .NET",     p: 80, level: "Expert" },
    { n: "Python",        p: 70, level: "Proficient" },
    { n: "JavaScript",    p: 80, level: "Expert" },
    { n: "React",         p: 70, level: "Proficient" },
    { n: "Angular",       p: 60, level: "Proficient" },
    { n: "Next.js",       p: 60, level: "Proficient" },
    { n: "Node.js",       p: 60, level: "Proficient" },
    { n: "SQL",           p: 70, level: "Proficient" },
    { n: "Azure / CI-CD", p: 80, level: "Expert" },
    { n: "PyTorch",       p: 30, level: "Learning" },
    { n: "OpenCV",        p: 40, level: "Working" },
  ];

  const primaryShortcuts = [
    { k: ":e experience", lbl: "view work history",   action: () => onOpen("experience") },
    { k: ":e projects",   lbl: "browse projects",     action: () => onOpen("projects") },
    { k: ":e skills",     lbl: "skills breakdown",    action: () => onOpen("skills") },
    { k: ":e oss",        lbl: "open source repos",   action: () => onOpen("oss") },
  ];
  const utilityShortcuts = [
    { k: ":e contact",    lbl: "find me",             action: () => onOpen("contact") },
    { k: "<C-p>",         lbl: "telescope finder",    action: () => onCommand && onCommand("telescope") },
    { k: ":help",         lbl: "full command list",   action: () => onCommand && onCommand("help") },
    { k: ":wq",           lbl: "save portfolio",      action: () => onCommand && onCommand("wq") },
  ];
  const shortcuts = [
    ...primaryShortcuts.map((s) => ({ ...s, tier: "primary" })),
    ...utilityShortcuts.map((s) => ({ ...s, tier: "utility" })),
  ];

  return (
    <div className="dash">
      <div className="dash-ascii" aria-label={`Kirsten — ${PROFILE.role}`}>
        {ASCII_KIRSTEN.join("\n")}
      </div>
      <div className="dash-sub">
        <span><span className="k">~</span><span className="v"> Full Stack Engineer</span></span>
        <span className="dot">·</span>
        <span><span className="v">Lead Engineer @ ONE360</span></span>
        <span className="dot">·</span>
        <span><span className="ok" style={{ color: "var(--green)" }}>● open to ML / AI roles</span></span>
        <span className="dot">·</span>
        <span className="muted">NVIM v0.10.portfolio</span>
      </div>
      <div style={{ color: "var(--subtext0)", fontSize: 12, marginBottom: 4, paddingLeft: 2, textAlign: "center" }}>
        <span className="cm">" I ship production systems end-to-end — pipelines, APIs, deployment, and the ML-adjacent infra around them.</span>
      </div>

      <div className="dash-shortcuts">
        {shortcuts.map((s, i) => (
          <div key={i} className={`sc ${s.tier === "utility" ? "utility" : ""}`} onClick={(e) => { e.stopPropagation(); s.action && s.action(); }}>
            <span className="key">{s.k}</span>
            <span className="arrow">→</span>
            <span className="lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      <div className="tiles">
        <Tile kind="experience" file="experience.ts" range="4 roles" onOpen={onOpen} className="experience-tile">
          {renderTileLines("experience")}
        </Tile>
        <Tile kind="projects" file="projects.md" range="3 items" onOpen={onOpen}>
          {renderTileLines("projects")}
        </Tile>

        {/* skills tile (full third column height) */}
        <div className="tile skills-tile" onClick={() => onOpen("skills")}>
          <div className="tile-hd">
            <span className="f">skills.yaml</span>
            <span className="r">top</span>
          </div>
          <div className="skills-wrap">
            <div style={{ color: "var(--teal)", fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 12 }}>
              PROFICIENCY
            </div>
            <div className="radar-legend skills-bars">
              {radarData.map((s) => (
                <div key={s.n} className="lg-row">
                  <span className="n">{s.n}</span>
                  <div className="mini-bar"><span style={{ "--p": s.p / 100 }}></span></div>
                  <span className="p">{s.level}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cta">
            <span>→ full skills breakdown</span>
            <span className="k">:e skills</span>
          </div>
        </div>

        {/* contributions tile */}
        <div className="tile" onClick={() => onOpen("oss")}>
          <div className="tile-hd">
            <span className="f">~/.git/contributions</span>
            <span className="r">26w × 7d</span>
          </div>
          <div className="contrib-bd">
            <Contrib />
          </div>
          <div className="cta">
            <span>→ open source repos</span>
            <span className="k">:e oss</span>
          </div>
        </div>

        <Tile kind="contact" file="contact.sh" range="3 channels" onOpen={onOpen} cta="→ reach out">
          {renderTileLines("contact")}
        </Tile>
        <Tile kind="education" file="education.md" range="1 degree" onOpen={onOpen}>
          {renderTileLines("education")}
        </Tile>
      </div>

      <div style={{ color: "var(--overlay0)", fontSize: 12, marginTop: 4, textAlign: "center" }}>
        -- dashboard --
      </div>
    </div>
  );
}
