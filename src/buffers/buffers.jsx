// ============================================================
// BUFFER RENDERERS — each "file" in the tree becomes a buffer
// ============================================================

import React from "react";
import { PORTFOLIO_DATA } from "../data/portfolioData";

// ---------- syntax helpers ----------
export function Tok({ c, children }) { return <span className={c}>{children}</span>; }

// Render lines with a gutter. Lines are React nodes.
export function BufferBody({ lines, cur, relative, showNu, onCursor }) {
  return (
    <>
      {showNu && (
        <div className="gutter" aria-hidden="true">
          {lines.map((_, i) => {
            const isCur = i === cur;
            let n;
            if (relative && !isCur) n = Math.abs(i - cur);
            else n = i + 1;
            return <span key={i} className={`lnum ${isCur ? "cur" : ""}`}>{n}</span>;
          })}
        </div>
      )}
      <div className="content">
        {lines.map((node, i) => (
          <div
            key={i}
            className={`line ${i === cur ? "cur" : ""}`}
            onClick={() => onCursor && onCursor(i)}
          >
            {node}
          </div>
        ))}
      </div>
    </>
  );
}

// ---------- markdown-ish lines (about, help) ----------
function renderMdLines(arr) {
  const out = [];
  arr.forEach((x) => {
    if (x.t === "sp") { out.push(<>&nbsp;</>); return; }
    if (x.t === "h1") { out.push(<Tok c="h1">{x.v}</Tok>); return; }
    if (x.t === "h2") { out.push(<Tok c="h2">{x.v}</Tok>); return; }
    if (x.t === "h3") { out.push(<Tok c="h3">{x.v}</Tok>); return; }
    if (x.t === "li") { out.push(<><Tok c="bullet">•&nbsp;</Tok><Tok c="var">{x.v}</Tok></>); return; }
    if (x.t === "cm") { out.push(<Tok c="cm">{x.v}</Tok>); return; }
    out.push(<Tok c="var">{x.v}</Tok>);
  });
  return out;
}

// ============================================================
// ABOUT
// ============================================================
function AboutBuffer() {
  return renderMdLines(PORTFOLIO_DATA.ABOUT_LINES);
}

// ============================================================
// EXPERIENCE (ts-shaped)
// ============================================================
function ExperienceBuffer() {
  const { EXPERIENCE } = PORTFOLIO_DATA;
  const out = [];
  out.push(<Tok c="cm">// experience.ts — reverse chronological</Tok>);
  out.push(<><Tok c="kw">export const</Tok> <Tok c="var">experience</Tok> <Tok c="op">=</Tok> <Tok c="pn">[</Tok></>);
  EXPERIENCE.forEach((e, i) => {
    out.push(<><Tok c="pn">&nbsp;&nbsp;{"{"}</Tok></>);
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="attr">when</Tok><Tok c="pn">:</Tok> <Tok c="str">"{e.when}"</Tok><Tok c="pn">,</Tok></>);
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="attr">role</Tok><Tok c="pn">:</Tok> <Tok c="str">"{e.role}"</Tok><Tok c="pn">,</Tok></>);
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="attr">company</Tok><Tok c="pn">:</Tok> <Tok c="str">"{e.co.replace(/^@\s*/, "")}"</Tok><Tok c="pn">,</Tok></>);
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="attr">impact</Tok><Tok c="pn">:</Tok> <Tok c="pn">[</Tok></>);
    e.bullets.forEach((b) => {
      out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="str">"{b}"</Tok><Tok c="pn">,</Tok></>);
    });
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="pn">]</Tok><Tok c="pn">,</Tok></>);
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="attr">stack</Tok><Tok c="pn">:</Tok> <Tok c="pn">[</Tok>{e.stack.map((s, j) => (
      <React.Fragment key={j}>
        <Tok c="str">"{s}"</Tok>{j < e.stack.length - 1 ? <Tok c="pn">, </Tok> : null}
      </React.Fragment>
    ))}<Tok c="pn">]</Tok><Tok c="pn">,</Tok></>);
    out.push(<><Tok c="pn">&nbsp;&nbsp;{"}"}</Tok><Tok c="pn">{i < EXPERIENCE.length - 1 ? "," : ""}</Tok></>);
    out.push(<>&nbsp;</>);
  });
  out.push(<Tok c="pn">] <Tok c="kw">as const</Tok>;</Tok>);
  return out;
}

// ============================================================
// PROJECTS (cards in markdown)
// ============================================================
function ProjectsBuffer() {
  const { PROJECTS } = PORTFOLIO_DATA;
  const out = [];
  out.push(<Tok c="h1"># Projects</Tok>);
  out.push(<Tok c="cm">{"> selected work. click a card for details."}</Tok>);
  out.push(<>&nbsp;</>);
  PROJECTS.forEach((p) => {
    out.push(
      <div className="card">
        <div className="ttl">
          <span className="nm">{p.name}</span>
          <span className="tag">{p.tag}</span>
        </div>
        <div className="desc">{p.desc}</div>
        <div className="chips">
          {p.chips.map((c) => <span key={c} className="chip">{c}</span>)}
        </div>
        <div className="links">
          <a className="link" href={p.href}>→ view</a>
          <a className="link" href={p.href}>→ source</a>
        </div>
      </div>
    );
  });
  return out;
}

// ============================================================
// SKILLS (yaml + bars)
// ============================================================
function SkillsBuffer() {
  const { SKILLS } = PORTFOLIO_DATA;
  const out = [];
  out.push(<Tok c="cm"># skills.yaml — proficiency is subjective, but the bars are fun</Tok>);
  out.push(<>&nbsp;</>);
  SKILLS.forEach((grp) => {
    out.push(<div className="skill-group">
      <div className="lbl">{grp.group}:</div>
      {grp.items.map((it) => (
        <div className="skill-row" key={it.n}>
          <span className="n">{it.n}</span>
          <div className="bar"><span style={{ width: it.p + "%" }}></span></div>
          <span className="pct">{it.p}%</span>
        </div>
      ))}
    </div>);
    out.push(<>&nbsp;</>);
  });
  return out;
}

// ============================================================
// EDUCATION
// ============================================================
function EducationBuffer() {
  const { EDUCATION } = PORTFOLIO_DATA;
  const out = [];
  out.push(<Tok c="h1"># Education</Tok>);
  out.push(<Tok c="cm">{"> formal + informal."}</Tok>);
  out.push(<>&nbsp;</>);
  EDUCATION.forEach((e) => {
    out.push(
      <div className="exp">
        <div className="when">{e.when}</div>
        <div className="what">
          <span className="role">{e.role}</span>
          <span className="co">{e.co}</span>
          <ul>{e.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
          <div className="chips" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {e.stack.map((s) => <span key={s} className="chip" style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 999,
              background: "var(--surface0)", color: "var(--subtext0)", border: "1px solid var(--surface1)"
            }}>{s}</span>)}
          </div>
        </div>
      </div>
    );
  });
  return out;
}

// ============================================================
// OSS (json)
// ============================================================
function OssBuffer() {
  const { OSS_REPOS } = PORTFOLIO_DATA;
  const out = [];
  out.push(<Tok c="cm">// oss.json — what I'm maintaining in the open</Tok>);
  out.push(<><Tok c="pn">[</Tok></>);
  OSS_REPOS.forEach((r, i) => {
    out.push(<>&nbsp;&nbsp;<Tok c="pn">{"{"}</Tok></>);
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="attr">"name"</Tok><Tok c="pn">:</Tok> <Tok c="str">"{r.name}"</Tok><Tok c="pn">,</Tok></>);
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="attr">"lang"</Tok><Tok c="pn">:</Tok> <Tok c="str">"{r.lang}"</Tok><Tok c="pn">,</Tok></>);
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="attr">"stars"</Tok><Tok c="pn">:</Tok> <Tok c="num">{r.stars}</Tok><Tok c="pn">,</Tok></>);
    out.push(<>&nbsp;&nbsp;&nbsp;&nbsp;<Tok c="attr">"desc"</Tok><Tok c="pn">:</Tok> <Tok c="str">"{r.desc}"</Tok></>);
    out.push(<>&nbsp;&nbsp;<Tok c="pn">{"}"}</Tok><Tok c="pn">{i < OSS_REPOS.length - 1 ? "," : ""}</Tok></>);
  });
  out.push(<><Tok c="pn">]</Tok></>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="cm">// hover to ⭐ — click name to open (placeholder links)</Tok>);
  return out;
}

// ============================================================
// CONTACT (shell)
// ============================================================
function ContactBuffer() {
  const { CONTACT, PROFILE } = PORTFOLIO_DATA;
  const out = [];
  out.push(<Tok c="cm">#!/usr/bin/env bash</Tok>);
  out.push(<Tok c="cm"># contact.sh — pick a channel, any channel</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<><Tok c="kw">function</Tok> <Tok c="fn">reach</Tok><Tok c="pn">() {`{`}</Tok></>);
  CONTACT.forEach((c) => {
    out.push(
      <div className="contact-row">
        <span className="k">{c.k}</span>
        <span className="v">
          {c.v.includes("@") || c.v.includes(".")
            ? <a className="link" href={
                c.v.startsWith("kirsten@") ? `mailto:${c.v}` :
                c.v.startsWith("github.com") || c.v.startsWith("linkedin.com") || c.v.startsWith("kirsten.dev") ? `https://${c.v}` : "#"
              }>{c.v}</a>
            : c.v}
        </span>
      </div>
    );
  });
  out.push(<Tok c="pn">{"}"}</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<><Tok c="fn">reach</Tok> <Tok c="op">||</Tok> <Tok c="kw">echo</Tok> <Tok c="str">"you tried"</Tok></>);
  return out;
}

// ============================================================
// HELP
// ============================================================
function HelpBuffer() {
  return renderMdLines(PORTFOLIO_DATA.HELP_LINES);
}

// ============================================================
// PREVIEW PANE (right side) — shows a "live" card based on buffer
// ============================================================
export function PreviewBuffer({ kind, data }) {
  const { PROFILE, OSS_REPOS, PROJECTS } = PORTFOLIO_DATA;
  const out = [];

  out.push(<Tok c="cm">// ~/preview.md — auto-generated from active buffer</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="h1">@{PROFILE.name.toLowerCase()}</Tok>);
  out.push(<Tok c="muted">{PROFILE.role} · {PROFILE.location}</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="cm">"{PROFILE.tagline}"</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<hr />);

  if (kind === "about" || kind === "help") {
    out.push(<Tok c="h2">:: quick stats</Tok>);
    out.push(<div className="contact-row"><span className="k">years</span><span className="v">8+</span></div>);
    out.push(<div className="contact-row"><span className="k">shipped</span><span className="v">40+ features · 6 services · 1 platform rewrite</span></div>);
    out.push(<div className="contact-row"><span className="k">oss</span><span className="v">3.5k+ stars across 6 repos</span></div>);
    out.push(<div className="contact-row"><span className="k">status</span><span className="v"><Tok c="ok">● open to conversations</Tok></span></div>);
    out.push(<>&nbsp;</>);
    out.push(<Tok c="h2">:: what I'm into</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>developer experience & editor tooling</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>type-safe end-to-end systems</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>making the boring parts fast</Tok>);
  } else if (kind === "experience") {
    out.push(<Tok c="h2">:: career arc</Tok>);
    out.push(<Tok c="var">intern → FTE → senior, with three full-stack rewrites behind me.</Tok>);
    out.push(<>&nbsp;</>);
    out.push(<Tok c="h2">:: favorite bug</Tok>);
    out.push(<Tok c="cm">{"> a race condition that only appeared when the ops team was on vacation."}</Tok>);
    out.push(<Tok c="cm">{"> turned out to be a cron misaligned with pg autovacuum. fixed in 2 lines."}</Tok>);
    out.push(<Tok c="cm">{"> wrote a blog post. 12k reads."}</Tok>);
  } else if (kind === "projects") {
    out.push(<Tok c="h2">:: top 3</Tok>);
    PROJECTS.slice(0, 3).forEach((p) => {
      out.push(
        <div className="card">
          <div className="ttl"><span className="nm">{p.name}</span><span className="tag">{p.tag}</span></div>
          <div className="desc">{p.desc}</div>
        </div>
      );
    });
  } else if (kind === "skills") {
    out.push(<Tok c="h2">:: the honest radar</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>I'll be productive in TS/React on day one.</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>I reach for Go when I need boring, reliable services.</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>I reach for Rust when I need to not be wrong.</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>Postgres is my favorite database. There isn't a close second.</Tok>);
    out.push(<>&nbsp;</>);
    out.push(<Tok c="h2">:: learning</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>distributed tracing internals</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>PL theory (slowly)</Tok>);
  } else if (kind === "education") {
    out.push(<Tok c="h2">:: philosophy</Tok>);
    out.push(<Tok c="cm">"I learn best by shipping bad versions, reading what broke, and then re-reading primary sources."</Tok>);
    out.push(<>&nbsp;</>);
    out.push(<Tok c="h2">:: currently reading</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>Designing Data-Intensive Applications</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>The Phoenix Project (re-read)</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>Crafting Interpreters</Tok>);
  } else if (kind === "oss") {
    out.push(<Tok c="h2">:: top repos</Tok>);
    OSS_REPOS.slice(0, 4).forEach((r) => {
      out.push(
        <div className="contact-row">
          <span className="k">{r.name}</span>
          <span className="v"><Tok c="num">⭐ {r.stars.toLocaleString()}</Tok> <Tok c="muted"> · {r.lang}</Tok></span>
        </div>
      );
    });
    out.push(<>&nbsp;</>);
    out.push(<Tok c="h2">:: philosophy</Tok>);
    out.push(<Tok c="cm">"Open source is the best place to practice writing code other people will actually read."</Tok>);
  } else if (kind === "contact") {
    out.push(<Tok c="h2">:: best way to reach me</Tok>);
    out.push(<Tok c="var">email works. I read linkedin weekly. I reply within 2 business days.</Tok>);
    out.push(<>&nbsp;</>);
    out.push(<Tok c="h2">:: what I'd love to hear about</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>staff/senior roles on DX, infra, or platform teams</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>consulting on schema/typed-API migrations</Tok>);
    out.push(<Tok c="var"><Tok c="bullet">• </Tok>someone's neovim config I should steal</Tok>);
  }

  out.push(<>&nbsp;</>);
  out.push(<hr />);
  out.push(<Tok c="cm">{"-- preview buffer (readonly)  • toggle with :only"}</Tok>);
  return out;
}

// ============================================================
// dispatcher
// ============================================================
export function renderBuffer(kind) {
  switch (kind) {
    case "dashboard":  return [<Tok c="muted">-- dashboard --</Tok>];
    case "about":      return AboutBuffer();
    case "experience": return ExperienceBuffer();
    case "projects":   return ProjectsBuffer();
    case "skills":     return SkillsBuffer();
    case "education":  return EducationBuffer();
    case "oss":        return OssBuffer();
    case "contact":    return ContactBuffer();
    case "help":       return HelpBuffer();
    default:           return [<Tok c="muted">empty buffer</Tok>];
  }
}
