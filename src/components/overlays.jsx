// ============================================================
// OVERLAYS — telescope, help modal, tweaks, save confetti
// ============================================================
import React, { useState as useStateO, useEffect as useEffectO, useRef as useRefO, useMemo as useMemoO } from "react";
import { PORTFOLIO_DATA } from "../data/portfolioData";

// fuzzy scorer
function fuzzy(query, text) {
  if (!query) return { score: 0, matches: [] };
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0, ti = 0, score = 0, streak = 0;
  const matches = [];
  while (qi < q.length && ti < t.length) {
    if (q[qi] === t[ti]) {
      matches.push(ti);
      streak++;
      score += 2 + streak;
      if (ti === 0 || /[\s/._-]/.test(t[ti - 1])) score += 3;
      qi++;
    } else {
      streak = 0;
      score -= 0.25;
    }
    ti++;
  }
  if (qi < q.length) return null;
  return { score, matches };
}

function highlight(text, matches) {
  if (!matches || !matches.length) return text;
  const out = [];
  let last = 0;
  matches.forEach((m, i) => {
    if (m > last) out.push(text.slice(last, m));
    out.push(<span key={i} className="match">{text[m]}</span>);
    last = m + 1;
  });
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Telescope({ onClose, onPick }) {
  const [q, setQ] = useStateO("");
  const [sel, setSel] = useStateO(0);
  const inputRef = useRefO(null);
  useEffectO(() => { inputRef.current && inputRef.current.focus(); }, []);

  const results = useMemoO(() => {
    const { FUZZY_INDEX } = PORTFOLIO_DATA;
    if (!q) return FUZZY_INDEX.map((r) => ({ ...r, _s: 0, _m: [] }));
    const scored = [];
    FUZZY_INDEX.forEach((r) => {
      const hay = r.label + " " + (r.hint || "");
      const res = fuzzy(q, hay);
      if (res) scored.push({ ...r, _s: res.score, _m: res.matches });
    });
    scored.sort((a, b) => b._s - a._s);
    return scored;
  }, [q]);

  useEffectO(() => { setSel(0); }, [q]);

  const cur = results[sel];

  function pick(r) {
    if (!r) return;
    onPick(r);
    onClose();
  }

  function onKey(e) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")) { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
    if (e.key === "ArrowUp"   || (e.ctrlKey && e.key === "p")) { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    if (e.key === "Enter") { e.preventDefault(); pick(cur); }
  }

  function previewFor(r) {
    if (!r) return "no results";
    if (r.kind === "action") return `action: ${r.label}\n\n${r.hint}\n\nenter to run.`;
    const { EXPERIENCE, PROJECTS, SKILLS, OSS_REPOS, CONTACT } = PORTFOLIO_DATA;
    switch (r.kind) {
      case "about": return "README.md\n\nKirsten — Full Stack Engineer\n\nI build things that make the tab bar feel lighter — small primitives, fast feedback loops, and docs that don't lie.";
      case "experience": return EXPERIENCE.map(e => `${e.when}  ${e.role} ${e.co}\n  · ${e.bullets[0]}`).join("\n\n");
      case "projects": return PROJECTS.map(p => `${p.name} — ${p.tag}\n  ${p.desc}`).join("\n\n");
      case "skills": return SKILLS.map(g => `${g.group}\n  ` + g.items.map(i => `${i.n.padEnd(24)} ${i.p}%`).join("\n  ")).join("\n\n");
      case "oss": return OSS_REPOS.map(r => `${r.name.padEnd(16)} ⭐${r.stars}  ${r.lang}\n  ${r.desc}`).join("\n\n");
      case "contact": return CONTACT.map(c => `${c.k.padEnd(10)} ${c.v}`).join("\n");
      case "help": return ":help\n\ntype :e <file>, :colorscheme <name>, :make, :q, :wq\nCtrl-P to open this finder.";
      default: return "";
    }
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="telescope" onClick={(e) => e.stopPropagation()}>
        <div className="prompt-row">
          <span className="icon">🔭</span>
          <span className="title">Telescope</span>
          <input
            ref={inputRef}
            placeholder="type to search files and actions..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
          />
        </div>
        <div className="results">
          {results.length === 0 && <div className="row"><span className="ico">∅</span>no matches</div>}
          {results.map((r, i) => (
            <div
              key={r.id}
              className={`row ${i === sel ? "sel" : ""}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => pick(r)}
            >
              <span className="ico">{r.kind === "action" ? "⚡" : "▪"}</span>
              <span>{highlight(r.label, r._m)}</span>
              <span style={{ marginLeft: "auto", color: "var(--overlay0)", fontSize: 12 }}>{r.hint}</span>
            </div>
          ))}
        </div>
        <div className="preview">{previewFor(cur)}</div>
        <div className="footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>⏎</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
          <span style={{ marginLeft: "auto", color: "var(--mauve)" }}>&lt;C-p&gt;</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELP overlay (full-screen help buffer)
// ============================================================
export function HelpOverlay({ onClose }) {
  const { HELP_LINES } = PORTFOLIO_DATA;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="overlay-buf" onClick={(e) => e.stopPropagation()}>
        <header>
          <span className="t">:help portfolio.txt</span>
          <span style={{ color: "var(--overlay1)", fontSize: 12 }}>— press Esc to close</span>
          <button className="close" onClick={onClose}>×</button>
        </header>
        <div className="body">
          {HELP_LINES.map((l, i) => {
            if (l.t === "sp") return <div key={i}>&nbsp;</div>;
            if (l.t === "h1") return <div key={i} className="h1" style={{fontSize: 18, marginBottom: 6}}>{l.v}</div>;
            if (l.t === "h2") return <div key={i} className="h2" style={{fontSize: 14, marginTop: 12, marginBottom: 4}}>{l.v}</div>;
            if (l.t === "cm") return <div key={i} className="cm">{l.v}</div>;
            return <div key={i}>{l.v}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAKE overlay (build output + confetti is triggered by save)
// ============================================================
export function MakeOverlay({ onClose }) {
  const { MAKE_LINES } = PORTFOLIO_DATA;
  const [shown, setShown] = useStateO(0);
  useEffectO(() => {
    if (shown >= MAKE_LINES.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown < 6 ? 260 : 120);
    return () => clearTimeout(t);
  }, [shown]);

  useEffectO(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="overlay-buf" onClick={(e) => e.stopPropagation()}>
        <header>
          <span className="t">:make</span>
          <span style={{ color: "var(--overlay1)", fontSize: 12 }}>— building portfolio...</span>
          <button className="close" onClick={onClose}>×</button>
        </header>
        <div className="body" style={{ fontFamily: "inherit", fontSize: 13 }}>
          {MAKE_LINES.slice(0, shown).map((l, i) => {
            const cls = l.startsWith("[make] ✓") ? "ok" : l.startsWith("[make]") ? "muted" : "mauve";
            return <div key={i} style={{ whiteSpace: "pre", color: `var(--${cls === "mauve" ? "mauve" : cls === "ok" ? "green" : "overlay1"})` }}>{l}</div>;
          })}
          {shown < MAKE_LINES.length && <div className="cursor" style={{ display: "inline-block", width: 8, height: 14, background: "var(--text)", marginLeft: 2 }}></div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Confetti + save flash
// ============================================================
export function Confetti() {
  const colors = ["--mauve","--blue","--green","--yellow","--peach","--pink","--sapphire"];
  const pieces = Array.from({ length: 60 }).map((_, i) => {
    const left = Math.random() * 100;
    const dx = (Math.random() - 0.5) * 400;
    const delay = Math.random() * 400;
    const c = colors[Math.floor(Math.random() * colors.length)];
    return (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: left + "%",
          background: `var(${c})`,
          animationDelay: delay + "ms",
          "--dx": dx + "px",
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
      />
    );
  });
  return <>{pieces}</>;
}

export function SaveFlash() {
  return (
    <div className="save-flash">
      <div className="ring"></div>
      <div className="msg">✓ portfolio.wq — written, not really</div>
    </div>
  );
}

// ============================================================
// TWEAKS PANEL
// ============================================================
export function TweaksPanel({ opts, setOpts, onClose }) {
  const fonts = [
    { v: "JetBrains Mono", l: "JetBrains Mono" },
    { v: "IBM Plex Mono",  l: "IBM Plex Mono" },
    { v: "Fira Code",      l: "Fira Code" },
    { v: "ui-monospace",   l: "System Mono" },
  ];
  const themes = [
    { v: "cream",      l: "Cream (paper)" },
    { v: "mocha",      l: "Catppuccin Mocha" },
    { v: "latte",      l: "Catppuccin Latte" },
    { v: "gruvbox",    l: "Gruvbox Dark" },
    { v: "tokyonight", l: "Tokyo Night" },
  ];
  const statuslines = [
    { v: "lualine",  l: "lualine (default)" },
    { v: "airline",  l: "airline" },
    { v: "minimal",  l: "minimal" },
  ];

  return (
    <div className="tweaks">
      <div className="hd">
        <span>Tweaks</span>
        <button className="close" onClick={onClose}>×</button>
      </div>
      <div className="bd">
        <label>
          colorscheme
          <select value={opts.theme} onChange={(e) => setOpts({ ...opts, theme: e.target.value })}>
            {themes.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </label>
        <label>
          font family
          <select value={opts.font} onChange={(e) => setOpts({ ...opts, font: e.target.value })}>
            {fonts.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </label>
        <label>
          statusline
          <select value={opts.statusline} onChange={(e) => setOpts({ ...opts, statusline: e.target.value })}>
            {statuslines.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </label>
        <div className={`toggle ${opts.showNu ? "on" : ""}`} onClick={() => setOpts({ ...opts, showNu: !opts.showNu })}>
          <span>:set number</span>
          <span className="sw"></span>
        </div>
        <div className={`toggle ${opts.relativeNu ? "on" : ""}`} onClick={() => setOpts({ ...opts, relativeNu: !opts.relativeNu })}>
          <span>:set relativenumber</span>
          <span className="sw"></span>
        </div>
        <div className={`toggle ${opts.showTree ? "on" : ""}`} onClick={() => setOpts({ ...opts, showTree: !opts.showTree })}>
          <span>:NvimTree</span>
          <span className="sw"></span>
        </div>
        <div className={`toggle ${opts.split ? "on" : ""}`} onClick={() => setOpts({ ...opts, split: !opts.split })}>
          <span>preview split</span>
          <span className="sw"></span>
        </div>
      </div>
    </div>
  );
}
