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

function flattenNodeToText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenNodeToText).join("");
  if (React.isValidElement(node)) {
    if (typeof node.type === "string" && node.type.toLowerCase() === "hr") return "";
    return flattenNodeToText(node.props?.children);
  }
  return "";
}

function toPlainLines(lines) {
  return lines.map((line) => flattenNodeToText(line).replace(/\u00a0/g, " ").replace(/\s+$/, ""));
}

const METRIC_PATTERN =
  /\b\d+\s*(?:days?|weeks?|months?|years?|minutes?|hours?)\s+to\s+\d+\s*(?:days?|weeks?|months?|years?|minutes?|hours?)\b|\b\d+(?:\.\d+)?%|\b\d+\+(?=\s|$)|\b\d+\s*-\s*(?:day|week|month|year|minute|hour)s?\b|\b\d+\s*(?:days?|weeks?|months?|years?|minutes?|hours?)\b/gi;

function highlightMetrics(text) {
  const parts = [];
  let last = 0;
  const regex = new RegExp(METRIC_PATTERN);
  let match = regex.exec(text);
  while (match) {
    const start = match.index;
    const end = start + match[0].length;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(<span key={`${start}-${end}`} className="metric">{match[0]}</span>);
    last = end;
    match = regex.exec(text);
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

function extractCommentHeader(lines) {
  const first = lines[0]?.trim();
  if (!first) return { headerLine: "", descriptionLines: [], start: 0 };
  if (!/^(\/\/|#)\s+\S+\.(?:ts|md|yaml|sh|json)\b/i.test(first)) {
    return { headerLine: "", descriptionLines: [], start: 0 };
  }

  const descriptionLines = [];
  let i = 1;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) { i++; break; }
    if (/^\s*\/\/\s?/.test(lines[i]) || /^\s*#\s?/.test(lines[i])) {
      descriptionLines.push(lines[i].trim());
      i++;
      continue;
    }
    break;
  }
  while (i < lines.length && !lines[i].trim()) i++;
  return { headerLine: first, descriptionLines, start: i };
}

function renderFileHeader(headerLine, descriptionLines = []) {
  if (!headerLine) return null;
  return (
    <div className="reader-file-header" key="reader-file-header">
      <div className="reader-file-headline">{headerLine}</div>
      {descriptionLines.map((line, idx) => (
        <div className="reader-file-desc" key={`desc-${idx}`}>{line}</div>
      ))}
      <div className="reader-file-rule" />
    </div>
  );
}

function renderBulletList(items, keyPrefix) {
  if (!items.length) return null;
  return (
    <ul className="reader-bullets" key={`${keyPrefix}-bullets`}>
      {items.map((item, idx) => (
        <li className="reader-bullet" key={`${keyPrefix}-${idx}`}>{highlightMetrics(item)}</li>
      ))}
    </ul>
  );
}

function renderExperienceReader(lines) {
  const out = [];
  const { headerLine, descriptionLines, start } = extractCommentHeader(lines);
  const header = renderFileHeader(headerLine, descriptionLines);
  if (header) out.push(header);

  const blocks = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const roleMatch = line.match(/^\s*(\[[^\]]+\])\s*(.+)?$/);
    if (!roleMatch) { i++; continue; }

    const date = roleMatch[1].trim();
    const title = (roleMatch[2] || "").trim();
    i++;

    let company = "";
    while (i < lines.length && !lines[i].trim()) i++;
    if (i < lines.length && !/^\s*(\[[^\]]+\])/.test(lines[i]) && !/^\s*[-•]\s+/.test(lines[i])) {
      company = lines[i].trim();
      i++;
    }

    const bulletItems = [];
    let currentBullet = "";
    while (i < lines.length && !/^\s*(\[[^\]]+\])/.test(lines[i])) {
      const ln = lines[i];
      const bulletStart = ln.match(/^\s*[-•]\s+(.*)$/);
      if (bulletStart) {
        if (currentBullet) bulletItems.push(currentBullet);
        currentBullet = bulletStart[1].trim();
        i++;
        continue;
      }
      if (currentBullet && ln.trim() && /^\s+/.test(ln)) {
        currentBullet += ` ${ln.trim()}`;
        i++;
        continue;
      }
      if (currentBullet && !ln.trim()) {
        i++;
        continue;
      }
      i++;
    }
    if (currentBullet) bulletItems.push(currentBullet);

    blocks.push({ date, title, company, bulletItems });
  }

  blocks.forEach((b, idx) => {
    out.push(
      <section className="reader-role-block" key={`exp-${idx}`}>
        <div className="reader-role-date">{b.date}</div>
        <div className="reader-role-body">
          <div className="reader-role-title">{b.title}</div>
          {b.company ? <div className="reader-role-company">{b.company}</div> : null}
          {renderBulletList(b.bulletItems, `exp-${idx}`)}
        </div>
      </section>
    );
  });
  return out;
}

function renderEducationReader(lines) {
  const out = [];
  const { headerLine, descriptionLines, start } = extractCommentHeader(lines);
  const header = renderFileHeader(headerLine, descriptionLines);
  if (header) out.push(header);

  const sections = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    const sectionMatch = line.trim().match(/^##\s+(.+)$/);
    if (!sectionMatch) { i++; continue; }
    const title = sectionMatch[1].trim();
    i++;

    const bodyLines = [];
    while (i < lines.length && !lines[i].trim().match(/^##\s+/)) {
      bodyLines.push(lines[i]);
      i++;
    }

    let institution = "";
    let date = "";
    const paragraphs = [];
    const bullets = [];
    let currentBullet = "";

    bodyLines.forEach((raw) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      const bulletMatch = raw.match(/^\s*[-•]\s+(.*)$/);
      if (bulletMatch) {
        if (currentBullet) bullets.push(currentBullet);
        currentBullet = bulletMatch[1].trim();
        return;
      }
      if (currentBullet && /^\s+/.test(raw)) {
        currentBullet += ` ${trimmed}`;
        return;
      }
      if (currentBullet) {
        bullets.push(currentBullet);
        currentBullet = "";
      }
      if (!institution) {
        institution = trimmed;
        return;
      }
      if (!date && trimmed.includes("—")) {
        date = trimmed;
        return;
      }
      paragraphs.push(trimmed);
    });
    if (currentBullet) bullets.push(currentBullet);

    sections.push({ title, institution, date, paragraphs, bullets });
  }

  sections.forEach((section, idx) => {
    out.push(
      <section className="reader-role-block" key={`edu-${idx}`}>
        {section.date ? <div className="reader-role-date">{section.date}</div> : null}
        <div className="reader-role-body">
          <div className="reader-role-title">{section.title}</div>
          {section.institution ? <div className="reader-role-company">{section.institution}</div> : null}
          {section.paragraphs.map((p, pIdx) => (
            <p className="reader-p" key={`edu-${idx}-p-${pIdx}`}>{p}</p>
          ))}
          {renderBulletList(section.bullets, `edu-${idx}`)}
        </div>
      </section>
    );
  });

  return out;
}

function renderYamlStyledLine(raw, key) {
  if (!raw.trim()) return <div className="reader-gap" key={key}>&nbsp;</div>;

  const commentMatch = raw.match(/^(.*?)(\s+#.*)$/);
  const base = commentMatch ? commentMatch[1] : raw;
  const comment = commentMatch ? commentMatch[2] : "";
  const indent = base.match(/^\s*/)?.[0] || "";
  const trimmed = base.trim();

  const topKeyMatch = trimmed.match(/^([a-zA-Z_][\w]*):\s*$/);
  if (topKeyMatch && indent.length === 0) {
    return (
      <div className="reader-code-line" key={key}>
        <span className="reader-yaml-top">{topKeyMatch[1]}</span><span>:</span>
        {comment ? <span className="reader-yaml-comment">{comment}</span> : null}
      </div>
    );
  }

  const nestedKeyMatch = trimmed.match(/^([a-zA-Z_][\w]*):\s*(.*)$/);
  if (nestedKeyMatch) {
    const [, k, value] = nestedKeyMatch;
    return (
      <div className="reader-code-line" key={key}>
        <span>{indent}</span>
        <span className="reader-yaml-nested">{k}</span><span>:</span>
        {value ? <><span> </span><span className="reader-yaml-value">{value}</span></> : null}
        {comment ? <span className="reader-yaml-comment">{comment}</span> : null}
      </div>
    );
  }

  const listMatch = trimmed.match(/^-\s+(.*)$/);
  if (listMatch) {
    return (
      <div className="reader-code-line" key={key}>
        <span>{indent}- </span><span className="reader-yaml-value">{listMatch[1]}</span>
        {comment ? <span className="reader-yaml-comment">{comment}</span> : null}
      </div>
    );
  }

  return <div className="reader-code-line" key={key}>{raw}</div>;
}

function renderSkillsReader(lines) {
  const out = [];
  const { headerLine, descriptionLines, start } = extractCommentHeader(lines);
  const header = renderFileHeader(headerLine, descriptionLines);
  if (header) out.push(header);

  for (let i = start; i < lines.length; i++) {
    out.push(renderYamlStyledLine(lines[i], `yaml-${i}`));
  }
  return out;
}

function getContactHref(key, value) {
  if (key === "email") return `mailto:${value}`;
  if (key === "github" || key === "linkedin") return value.startsWith("http") ? value : `https://${value}`;
  return "#";
}

function renderContactReader(lines) {
  const out = [];
  lines.forEach((raw, idx) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      out.push(<div className="reader-gap" key={`contact-gap-${idx}`}>&nbsp;</div>);
      return;
    }

    if (/^#!/.test(trimmed) || /^#/.test(trimmed)) {
      out.push(<div className="reader-contact-comment" key={`contact-cm-${idx}`}>{raw}</div>);
      return;
    }

    const pair = raw.match(/^\s*(email|github|linkedin)\s+(.+)$/);
    if (!pair) {
      out.push(<p className="reader-p" key={`contact-p-${idx}`}>{trimmed}</p>);
      return;
    }

    const key = pair[1];
    const valueRaw = pair[2].trim();
    const todoMatch = valueRaw.match(/^(.*?)(\s*\/\/\s*TODO:\s*fill in.*)?$/i);
    const value = (todoMatch?.[1] || valueRaw).trim();
    const todo = todoMatch?.[2] || "";
    const href = getContactHref(key, value);

    out.push(
      <div className="reader-contact-row" key={`contact-row-${idx}`}>
        <span className="reader-contact-key">{key}</span>
        <span className="reader-contact-value">
          <a className="reader-contact-link" href={href}>{value}</a>
          {todo ? <span className="reader-contact-comment-inline">{todo}</span> : null}
        </span>
      </div>
    );
  });
  return out;
}

function collectBullets(lines, startIndex) {
  const items = [];
  let current = "";
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) {
        items.push(current);
        current = "";
      }
      i++;
      break;
    }

    const start = line.match(/^\s*[-•]\s+(.*)$/);
    if (start) {
      if (current) items.push(current);
      current = start[1].trim();
      i++;
      continue;
    }

    if (current && /^\s+/.test(line)) {
      current += ` ${trimmed}`;
      i++;
      continue;
    }

    if (current) items.push(current);
    return { items, next: i };
  }

  if (current) items.push(current);
  return { items, next: i };
}

function renderGenericReader(lines) {
  const out = [];
  const { headerLine, descriptionLines, start } = extractCommentHeader(lines);
  const header = renderFileHeader(headerLine, descriptionLines);
  if (header) out.push(header);

  let i = start;
  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      out.push(<div className="reader-gap" key={`gap-${i}`}>&nbsp;</div>);
      i++;
      continue;
    }

    const mdSection = trimmed.match(/^##\s+(.+)$/);
    if (mdSection) {
      out.push(<h2 className="reader-section" key={`h2-${i}`}>{mdSection[1]}</h2>);
      i++;
      continue;
    }

    if (/^::/.test(trimmed)) {
      out.push(<h2 className="reader-section" key={`h2-${i}`}>{trimmed}</h2>);
      i++;
      continue;
    }

    if (/^\s*[-•]\s+/.test(raw)) {
      const { items, next } = collectBullets(lines, i);
      out.push(renderBulletList(items, `generic-${i}`));
      i = next;
      continue;
    }

    out.push(<p className="reader-p" key={`p-${i}`}>{trimmed}</p>);
    i++;
  }

  return out;
}

export function ReaderBuffer({ kind, lines }) {
  const plainLines = React.useMemo(() => toPlainLines(lines), [lines]);
  let body = null;
  if (kind === "experience") body = renderExperienceReader(plainLines);
  else if (kind === "education") body = renderEducationReader(plainLines);
  else if (kind === "skills") body = renderSkillsReader(plainLines);
  else if (kind === "contact") body = renderContactReader(plainLines);
  else body = renderGenericReader(plainLines);

  return (
    <>
      <div className="reader-gutter" aria-hidden="true" />
      <div className={`reader-wrap reader-${kind}`}>
        <div className="reader-inner">{body}</div>
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
  const out = [];
  out.push(<Tok c="cm">// experience.ts</Tok>);
  out.push(<Tok c="cm">// 3+ years shipping production systems across government,</Tok>);
  out.push(<Tok c="cm">// fintech, and energy sectors.</Tok>);
  out.push(<>&nbsp;</>);

  out.push(<Tok c="var">[2023 - present] Software Engineer → Lead Engineer</Tok>);
  out.push(<Tok c="muted">                 ONE360 · government & aviation products</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Promoted to Lead Engineer for overhauling bug triage</Tok>);
  out.push(<Tok c="var">    and delivery across 4 products; reduced average ticket</Tok>);
  out.push(<Tok c="var">    resolution time by 78% while leading a team of 5.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Built Azure CI/CD and automated testing pipelines that</Tok>);
  out.push(<Tok c="var">    cut deployment time from 3 days to 20 minutes and</Tok>);
  out.push(<Tok c="var">    caught 80% of defects before production across 4</Tok>);
  out.push(<Tok c="var">    codebases.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Engineered 12+ ETL pipelines and data connectors in</Tok>);
  out.push(<Tok c="var">    C# / .NET as sole developer, delivering NIBRS-compliant</Tok>);
  out.push(<Tok c="var">    integrations for 12+ law enforcement agencies under a</Tok>);
  out.push(<Tok c="var">    6-week federal deadline.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Developed a computer vision prototype using YOLO-OBB</Tok>);
  out.push(<Tok c="var">    for aerial object detection. Trained on a custom dataset</Tok>);
  out.push(<Tok c="var">    and benchmarked re-identification performance for law</Tok>);
  out.push(<Tok c="var">    enforcement partners.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Authored documentation, unit test templates, and</Tok>);
  out.push(<Tok c="var">    development standards that reduced new engineer</Tok>);
  out.push(<Tok c="var">    onboarding from 2 weeks to 3 days.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<>&nbsp;</>);

  out.push(<Tok c="var">[2023] Software Engineer Intern</Tok>);
  out.push(<Tok c="muted">       Rocket Mortgage · fintech</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Redesigned mortgage pre-qualification from a single</Tok>);
  out.push(<Tok c="var">    page form into a multi-step guided flow with address</Tok>);
  out.push(<Tok c="var">    autocomplete and contextual tips, reducing applicant</Tok>);
  out.push(<Tok c="var">    completion time by 40%.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Built 4 reusable Angular components integrated with</Tok>);
  out.push(<Tok c="var">    loan calculation APIs, adopted across multiple teams.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Implemented WCAG/ADA accessibility improvements across</Tok>);
  out.push(<Tok c="var">    the pre-qualification flow to meet federal requirements.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<>&nbsp;</>);

  out.push(<Tok c="var">[2022 - 2023] Software Engineer Intern</Tok>);
  out.push(<Tok c="muted">              Grid Protection Alliance · energy / open source</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Rebuilt waveform chart rendering in Three.js for</Tok>);
  out.push(<Tok c="var">    OpenSEE, an open-source electrical grid visualization</Tok>);
  out.push(<Tok c="var">    tool used by power utilities.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">  - Redesigned the OpenSEE frontend layout and optimized</Tok>);
  out.push(<Tok c="var">    waveform data loading, increasing page load speed</Tok>);
  out.push(<Tok c="var">    by 35%.</Tok>);
  return out;
}

// ============================================================
// PROJECTS (cards in markdown)
// ============================================================
function ProjectsBuffer() {
  const out = [];
  out.push(<Tok c="var"># projects.md</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">Selected work across production systems, ML prototyping,</Tok>);
  out.push(<Tok c="var">and open source contribution.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<>&nbsp;</>);

  out.push(<Tok c="var">## ONE360 ETL Platform</Tok>);
  out.push(<Tok c="var">   C# · .NET · Azure · PostgreSQL</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">   Engineered 12+ ETL pipelines and data connectors as</Tok>);
  out.push(<Tok c="var">   sole developer for NIBRS-compliant law enforcement</Tok>);
  out.push(<Tok c="var">   integrations. Delivered 12+ agency integrations under</Tok>);
  out.push(<Tok c="var">   a 6-week federal deadline. Production system serving</Tok>);
  out.push(<Tok c="var">   government partners.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<>&nbsp;</>);

  out.push(<Tok c="var">## YOLO-OBB Aerial Object Detection</Tok>);
  out.push(<Tok c="var">   Python · PyTorch · OpenCV · YOLO-OBB</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">   Built a computer vision prototype for aerial object</Tok>);
  out.push(<Tok c="var">   detection and re-identification. Trained on a custom</Tok>);
  out.push(<Tok c="var">   dataset, benchmarked detection accuracy and</Tok>);
  out.push(<Tok c="var">   re-identification performance for law enforcement</Tok>);
  out.push(<Tok c="var">   partners. Exploratory work that informed downstream</Tok>);
  out.push(<Tok c="var">   product decisions.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<>&nbsp;</>);

  out.push(<Tok c="var">## OpenSEE Waveform Rendering</Tok>);
  out.push(<Tok c="var">   TypeScript · Three.js · open source</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">   Rebuilt waveform chart rendering for OpenSEE, an</Tok>);
  out.push(<Tok c="var">   open-source electrical grid visualization tool used</Tok>);
  out.push(<Tok c="var">   by power utilities. Also redesigned the frontend</Tok>);
  out.push(<Tok c="var">   layout and optimized waveform data loading — page</Tok>);
  out.push(<Tok c="var">   load improved by 35%.</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">   github.com/GridProtectionAlliance/openSEE</Tok>);
  return out;
}

// ============================================================
// SKILLS (yaml)
// ============================================================
function SkillsBuffer() {
  const out = [];
  out.push(<Tok c="var"># skills.yaml</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">languages:</Tok>);
  out.push(<Tok c="var">  expert:</Tok>);
  out.push(<Tok c="var">    - TypeScript</Tok>);
  out.push(<Tok c="var">    - C#</Tok>);
  out.push(<Tok c="var">    - JavaScript</Tok>);
  out.push(<Tok c="var">  proficient:</Tok>);
  out.push(<Tok c="var">    - Python</Tok>);
  out.push(<Tok c="var">    - Java</Tok>);
  out.push(<Tok c="var">    - SQL</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">frameworks:</Tok>);
  out.push(<Tok c="var">  backend:</Tok>);
  out.push(<Tok c="var">    - .NET</Tok>);
  out.push(<Tok c="var">    - Node.js</Tok>);
  out.push(<Tok c="var">    - Express</Tok>);
  out.push(<Tok c="var">    - Spring Boot</Tok>);
  out.push(<Tok c="var">  frontend:</Tok>);
  out.push(<Tok c="var">    - React</Tok>);
  out.push(<Tok c="var">    - Angular</Tok>);
  out.push(<Tok c="var">    - Next.js</Tok>);
  out.push(<Tok c="var">  ml:</Tok>);
  out.push(<><Tok c="var">    - PyTorch        </Tok><Tok c="cm"># working knowledge</Tok></>);
  out.push(<><Tok c="var">    - OpenCV         </Tok><Tok c="cm"># production CV work with YOLO-OBB</Tok></>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">infrastructure:</Tok>);
  out.push(<Tok c="var">  cloud: [Azure]</Tok>);
  out.push(<Tok c="var">  ci_cd: [Azure Pipelines, GitHub Actions]</Tok>);
  out.push(<Tok c="var">  containers: [Docker]</Tok>);
  out.push(<Tok c="var">  databases: [PostgreSQL, MongoDB, MySQL]</Tok>);
  out.push(<Tok c="var">  testing: [Cypress, xUnit]</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">currently_exploring:</Tok>);
  out.push(<Tok c="var">  - LLM application infrastructure</Tok>);
  out.push(<Tok c="var">  - embedding models and vector stores</Tok>);
  out.push(<Tok c="var">  - retrieval systems and semantic search</Tok>);
  out.push(<Tok c="var">  - ML deployment and inference optimization</Tok>);
  return out;
}

// ============================================================
// EDUCATION
// ============================================================
function EducationBuffer() {
  const out = [];
  out.push(<Tok c="var"># education.md</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">## B.S. Computer Science</Tok>);
  out.push(<><Tok c="var">   [University Name]</Tok><Tok c="cm"> // TODO: fill in</Tok></>);
  out.push(
    <>
      <Tok c="var">   [Start Year]</Tok><Tok c="cm"> // TODO: fill in</Tok><Tok c="var"> — [End Year]</Tok><Tok c="cm"> // TODO: fill in</Tok>
    </>
  );
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">   Relevant coursework:</Tok>);
  out.push(<Tok c="var">     - Data Structures & Algorithms</Tok>);
  out.push(<Tok c="var">     - Operating Systems</Tok>);
  out.push(<Tok c="var">     - Databases</Tok>);
  out.push(<Tok c="var">     - Machine Learning foundations</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="var">## Self-directed study</Tok>);
  out.push(<Tok c="var">   Ongoing exploration of ML and AI systems:</Tok>);
  out.push(<Tok c="var">     - ML infrastructure and deployment patterns</Tok>);
  out.push(<Tok c="var">     - LLM application architecture</Tok>);
  out.push(<Tok c="var">     - embedding models and vector retrieval</Tok>);
  out.push(<Tok c="var">     - papers and implementations in applied ML</Tok>);
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
  const out = [];
  out.push(<Tok c="cm">#!/usr/bin/env bash</Tok>);
  out.push(<Tok c="cm"># contact.sh — reach out</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<><Tok c="var">email     kirsten@[yourdomain]</Tok><Tok c="cm"> // TODO: fill in</Tok></>);
  out.push(<><Tok c="var">github    github.com/[yourhandle]</Tok><Tok c="cm"> // TODO: fill in</Tok></>);
  out.push(<><Tok c="var">linkedin  linkedin.com/in/[yourhandle]</Tok><Tok c="cm"> // TODO: fill in</Tok></>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="cm"># currently: open to ML Engineer and AI Product Engineer roles</Tok>);
  out.push(<><Tok c="cm"># location: [your location]</Tok><Tok c="cm"> // TODO: fill in</Tok></>);
  out.push(<Tok c="cm"># response time: usually within 48 hours</Tok>);
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

  if (kind === "about") {
    const readmePreview = [];
    readmePreview.push(<Tok c="h1">@kirsten</Tok>);
    readmePreview.push(<Tok c="muted">Full Stack Engineer · Lead Engineer at ONE360</Tok>);
    readmePreview.push(<>&nbsp;</>);
    readmePreview.push(<Tok c="cm">"I ship production systems end-to-end — pipelines, APIs,</Tok>);
    readmePreview.push(<Tok c="cm">deployment, and the ML-adjacent infrastructure around them."</Tok>);
    readmePreview.push(<>&nbsp;</>);
    readmePreview.push(<Tok c="h2">:: now</Tok>);
    readmePreview.push(<Tok c="var">Lead Engineer at ONE360. Building ETL pipelines and CI/CD</Tok>);
    readmePreview.push(<Tok c="var">infrastructure for government and aviation products. Shipped</Tok>);
    readmePreview.push(<Tok c="var">a YOLO-OBB computer vision prototype for aerial object</Tok>);
    readmePreview.push(<Tok c="var">detection. Exploring LLM infrastructure and semantic systems</Tok>);
    readmePreview.push(<Tok c="var">on the side.</Tok>);
    readmePreview.push(<>&nbsp;</>);
    readmePreview.push(<Tok c="h2">:: quick stats</Tok>);
    readmePreview.push(<Tok c="var">years          3+</Tok>);
    readmePreview.push(<Tok c="var">shipped        12+ ETL pipelines · 4 production products · 1 CV prototype</Tok>);
    readmePreview.push(<Tok c="var">impact         78% faster ticket resolution · 40% faster user flows</Tok>);
    readmePreview.push(<Tok c="var">status         open to ML Engineer and AI Product Engineer roles</Tok>);
    readmePreview.push(<>&nbsp;</>);
    readmePreview.push(<Tok c="h2">:: what I'm into</Tok>);
    readmePreview.push(<Tok c="var">developer experience and internal tooling</Tok>);
    readmePreview.push(<Tok c="var">ML infrastructure — pipelines, deployment, monitoring</Tok>);
    readmePreview.push(<Tok c="var">LLM application systems — embeddings, retrieval, caching</Tok>);
    readmePreview.push(<Tok c="var">making the boring parts fast</Tok>);
    return readmePreview;
  }

  const out = [];

  out.push(<Tok c="cm">// ~/preview.md — auto-generated from active buffer</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="h1">@{PROFILE.name.toLowerCase()}</Tok>);
  out.push(<Tok c="muted">{PROFILE.role} · {PROFILE.location}</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<Tok c="cm">"{PROFILE.tagline}"</Tok>);
  out.push(<>&nbsp;</>);
  out.push(<hr />);

  if (kind === "help") {
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
