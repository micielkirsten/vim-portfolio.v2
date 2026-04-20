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

// Skills radar (SVG)
export function SkillsRadar({ data }) {
  // data: [{ n, p }]
  const n = data.length;
  const cx = 180, cy = 180, r = 140;
  const rings = [0.25, 0.5, 0.75, 1.0];
  function pt(i, f) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * r * f, cy + Math.sin(a) * r * f];
  }
  const poly = data.map((d, i) => pt(i, d.p / 100).join(",")).join(" ");
  return (
    <svg viewBox="0 0 360 360" aria-label="skills radar">
      {/* rings */}
      {rings.map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * f}
          fill="none"
          stroke="var(--surface1)"
          strokeOpacity={0.5}
          strokeDasharray="2 4"
        />
      ))}
      {/* spokes */}
      {data.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--surface1)" strokeOpacity={0.5} />;
      })}
      {/* polygon */}
      <polygon
        points={poly}
        fill="color-mix(in oklab, var(--mauve) 25%, transparent)"
        stroke="var(--mauve)"
        strokeWidth="1.5"
        style={{ filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--mauve) 40%, transparent))" }}
      />
      {/* vertices */}
      {data.map((d, i) => {
        const [x, y] = pt(i, d.p / 100);
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--blue)" />;
      })}
      {/* labels */}
      {data.map((d, i) => {
        const [x, y] = pt(i, 1.14);
        const isRight = x > cx + 4;
        const isLeft = x < cx - 4;
        const anchor = isRight ? "start" : isLeft ? "end" : "middle";
        return (
          <text key={i} x={x} y={y} fontSize="11" fill="var(--subtext0)"
            textAnchor={anchor}
            dominantBaseline="middle"
            fontFamily="inherit"
          >{d.n}</text>
        );
      })}
    </svg>
  );
}

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
    <>
      <div className="contrib">
        {cells.map((l, i) => <div key={i} className={`c ${l ? "l" + l : ""}`} />)}
      </div>
      <div className="contrib-meta">
        <span>last 6 months · 782 contributions</span>
        <span>longest streak: 41 days</span>
      </div>
    </>
  );
}

// snippet rendering — short preview lines for a tile
function tileLines(kind) {
  const { EXPERIENCE, PROJECTS, OSS_REPOS, CONTACT, PROFILE } = PORTFOLIO_DATA;
  if (kind === "experience") {
    const out = [];
    out.push({ t: "cm", v: "// experience.ts" });
    EXPERIENCE.slice(0, 2).forEach((e) => {
      out.push({ t: "ln", parts: [
        { c: "attr", v: e.when + "  " },
        { c: "fn",   v: e.role },
        { c: "muted", v: "  " + e.co },
      ]});
    });
    out.push({ t: "cm", v: "// + 2 more roles..." });
    return out;
  }
  if (kind === "projects") {
    const out = [];
    out.push({ t: "cm", v: "# Selected Projects" });
    PROJECTS.slice(0, 3).forEach((p) => {
      out.push({ t: "ln", parts: [
        { c: "bullet", v: "• " },
        { c: "yellow-txt", v: p.name },
        { c: "muted", v: "  " + p.tag },
      ]});
    });
    return out;
  }
  if (kind === "oss") {
    const out = [];
    out.push({ t: "cm", v: "// oss.json" });
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
    out.push({ t: "cm", v: "# Education" });
    out.push({ t: "ln", parts: [
      { c: "attr", v: "2014–2018  " },
      { c: "fn", v: "B.S. Computer Science" },
    ]});
    out.push({ t: "ln", parts: [
      { c: "muted", v: "  distributed systems · PL theory" },
    ]});
    out.push({ t: "ln", parts: [
      { c: "attr", v: "ongoing    " },
      { c: "fn", v: "self-directed" },
    ]});
    return out;
  }
  if (kind === "contact") {
    const out = [];
    out.push({ t: "cm", v: "#!/usr/bin/env bash" });
    CONTACT.slice(0, 4).forEach((c) => {
      out.push({ t: "ln", parts: [
        { c: "teal-txt", v: c.k.padEnd(10) },
        { c: "var", v: c.v },
      ]});
    });
    return out;
  }
  return [];
}

function Tile({ kind, onOpen, file, range, children, cta }) {
  return (
    <div className="tile" onClick={() => onOpen && onOpen(kind)}>
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
  const { PROFILE, SKILLS } = PORTFOLIO_DATA;

  // flatten top 8 skills for radar
  const radarData = [
    { n: "TypeScript", p: 95 },
    { n: "React",      p: 94 },
    { n: "Node.js",    p: 92 },
    { n: "Postgres",   p: 88 },
    { n: "Go",         p: 85 },
    { n: "Python",     p: 78 },
    { n: "Rust",       p: 72 },
    { n: "Docker/K8s", p: 74 },
  ];

  const shortcuts = [
    { k: ":e experience", lbl: "view work history",   action: () => onOpen("experience") },
    { k: ":e projects",   lbl: "browse projects",     action: () => onOpen("projects") },
    { k: ":e skills",     lbl: "skills breakdown",    action: () => onOpen("skills") },
    { k: ":e oss",        lbl: "open source repos",   action: () => onOpen("oss") },
    { k: ":e contact",    lbl: "find me",             action: () => onOpen("contact") },
    { k: "<C-p>",         lbl: "telescope finder",    action: () => onCommand && onCommand("telescope") },
    { k: ":help",         lbl: "full command list",   action: () => onCommand && onCommand("help") },
    { k: ":wq",           lbl: "save portfolio",      action: () => onCommand && onCommand("wq") },
  ];

  return (
    <div className="dash">
      <div className="dash-ascii" aria-label={`Kirsten — ${PROFILE.role}`}>
        {ASCII_KIRSTEN.join("\n")}
      </div>
      <div className="dash-sub">
        <span><span className="k">~</span><span className="v"> {PROFILE.role}</span></span>
        <span className="dot">·</span>
        <span><span className="k">@</span><span className="v">{PROFILE.location}</span></span>
        <span className="dot">·</span>
        <span><span className="ok" style={{ color: "var(--green)" }}>● open to conversations</span></span>
        <span className="dot">·</span>
        <span className="muted">NVIM v0.10.portfolio</span>
      </div>
      <div style={{ color: "var(--subtext0)", fontSize: 11, marginBottom: 4, paddingLeft: 2, textAlign: "center" }}>
        <span className="cm">" {PROFILE.tagline}</span>
      </div>

      <div className="dash-shortcuts">
        {shortcuts.map((s, i) => (
          <div key={i} className="sc" onClick={(e) => { e.stopPropagation(); s.action && s.action(); }}>
            <span className="key">{s.k}</span>
            <span className="arrow">→</span>
            <span className="lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      <div className="tiles">
        <Tile kind="experience" file="experience.ts" range="L1-L40" onOpen={onOpen}>
          {renderTileLines("experience")}
        </Tile>
        <Tile kind="projects" file="projects.md" range="6 items" onOpen={onOpen}>
          {renderTileLines("projects")}
        </Tile>

        {/* radar tile spans both columns */}
        <div className="tile radar-tile" onClick={() => onOpen("skills")}>
          <div className="tile-hd">
            <span className="f">skills.yaml</span>
            <span className="r">radar · top 8</span>
          </div>
          <div className="radar-wrap">
            <SkillsRadar data={radarData} />
            <div className="radar-legend">
              <div style={{ color: "var(--teal)", fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11 }}>
                proficiency
              </div>
              {radarData.map((s) => (
                <div key={s.n} className="lg-row">
                  <span className="n">{s.n}</span>
                  <div className="mini-bar"><span style={{ width: s.p + "%" }}></span></div>
                  <span className="p">{s.p}%</span>
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
        <div className="tile radar-tile" onClick={() => onOpen("oss")}>
          <div className="tile-hd">
            <span className="f">~/.git/contributions</span>
            <span className="r">26w × 7d</span>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <Contrib />
          </div>
          <div className="cta">
            <span>→ open source repos</span>
            <span className="k">:e oss</span>
          </div>
        </div>

        <Tile kind="oss" file="oss.json" range="6 repos" onOpen={onOpen}>
          {renderTileLines("oss")}
        </Tile>
        <Tile kind="education" file="education.md" range="L1-L20" onOpen={onOpen}>
          {renderTileLines("education")}
        </Tile>
        <Tile kind="contact" file="contact.sh" range="6 channels" onOpen={onOpen} cta="→ reach out">
          {renderTileLines("contact")}
        </Tile>
        <div className="tile" onClick={() => onCommand && onCommand("help")}>
          <div className="tile-hd">
            <span className="f">:help portfolio.txt</span>
            <span className="r">commands</span>
          </div>
          <div className="tile-bd">
            <span className="ln"><span className="lnum"> 1</span><span className="cm">// try these</span></span>
            <span className="ln"><span className="lnum"> 2</span><span style={{color:"var(--yellow)",fontWeight:600}}>:q</span><span className="muted">         press to quit</span></span>
            <span className="ln"><span className="lnum"> 3</span><span style={{color:"var(--yellow)",fontWeight:600}}>:wq</span><span className="muted">        save with confetti</span></span>
            <span className="ln"><span className="lnum"> 4</span><span style={{color:"var(--yellow)",fontWeight:600}}>:make</span><span className="muted">      build artifact</span></span>
            <span className="ln"><span className="lnum"> 5</span><span style={{color:"var(--yellow)",fontWeight:600}}>↑↑↓↓←→←→ba</span><span className="muted">   ???</span></span>
          </div>
          <div className="cta">
            <span>→ full :help</span>
            <span className="k">?</span>
          </div>
        </div>
      </div>

      <div style={{ color: "var(--overlay0)", fontSize: 10, marginTop: 4, textAlign: "center" }}>
        -- dashboard --
      </div>
    </div>
  );
}
