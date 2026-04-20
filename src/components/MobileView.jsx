// ============================================================
// MOBILE — simplified scroll view
// ============================================================
import React, { useState as useStateM, useEffect as useEffectM, useRef as useRefM } from "react";
import { PORTFOLIO_DATA } from "../data/portfolioData";

export default function MobileView({ theme, onToggleTheme }) {
  const { PROFILE, EXPERIENCE, PROJECTS, SKILLS, OSS_REPOS, CONTACT, EDUCATION } = PORTFOLIO_DATA;
  const [active, setActive] = useStateM("about");
  const sectionRefs = useRefM({});

  useEffectM(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((ent) => {
        if (ent.isIntersecting && ent.intersectionRatio > 0.3) setActive(ent.target.id);
      });
    }, { threshold: [0.3, 0.6] });
    Object.values(sectionRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const sections = [
    { id: "about",      label: "README" },
    { id: "experience", label: "experience" },
    { id: "projects",   label: "projects" },
    { id: "skills",     label: "skills" },
    { id: "education",  label: "education" },
    { id: "oss",        label: "oss" },
    { id: "contact",    label: "contact" },
  ];

  function scrollTo(id) {
    const el = sectionRefs.current[id];
    if (el) window.scrollTo({ top: el.offsetTop - 84, behavior: "smooth" });
  }

  return (
    <div className="mobile">
      <div className="mhead">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div className="who">~/{PROFILE.name.toLowerCase()}</div>
            <div className="sub">{PROFILE.role} · {PROFILE.location}</div>
          </div>
          <button className="theme-toggle" onClick={onToggleTheme} style={{ background: "var(--surface0)" }}>
            <span className="dot"></span>{theme}
          </button>
        </div>
        <div className="nav">
          {sections.map(s => (
            <a key={s.id} className={active === s.id ? "active" : ""} onClick={(e) => { e.preventDefault(); scrollTo(s.id); }} href={`#${s.id}`}>
              :{s.label}
            </a>
          ))}
        </div>
      </div>

      <section id="about" ref={(el) => sectionRefs.current.about = el} className="section">
        <h2><span className="ln">1</span>README.md</h2>
        <p style={{ color: "var(--subtext0)", margin: "4px 0 10px" }}>"{PROFILE.tagline}"</p>
        <p style={{ color: "var(--subtext0)", fontSize: 13 }}>
          I build end-to-end: type-safe APIs, reactive UIs, boring infra.
          Currently building internal tooling, maintaining a few OSS repos,
          and learning enough Rust to be dangerous.
        </p>
      </section>

      <section id="experience" ref={(el) => sectionRefs.current.experience = el} className="section">
        <h2><span className="ln">2</span>experience.ts</h2>
        {EXPERIENCE.map((e, i) => (
          <div key={i} className="card">
            <div className="ttl">
              <span className="nm">{e.role} <span style={{ color: "var(--blue)" }}>{e.co}</span></span>
              <span className="tag">{e.when}</span>
            </div>
            <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, color: "var(--subtext0)", fontSize: 13 }}>
              {e.bullets.map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
            </ul>
            <div className="chips">
              {e.stack.map(s => <span key={s} className="chip">{s}</span>)}
            </div>
          </div>
        ))}
      </section>

      <section id="projects" ref={(el) => sectionRefs.current.projects = el} className="section">
        <h2><span className="ln">3</span>projects.md</h2>
        {PROJECTS.map((p) => (
          <div key={p.name} className="card">
            <div className="ttl"><span className="nm">{p.name}</span><span className="tag">{p.tag}</span></div>
            <div className="desc">{p.desc}</div>
            <div className="chips">
              {p.chips.map(c => <span key={c} className="chip">{c}</span>)}
            </div>
          </div>
        ))}
      </section>

      <section id="skills" ref={(el) => sectionRefs.current.skills = el} className="section">
        <h2><span className="ln">4</span>skills.yaml</h2>
        {SKILLS.map(g => (
          <div key={g.group} className="skill-group">
            <div className="lbl">{g.group}</div>
            {g.items.map(it => (
              <div key={it.n} className="skill-row">
                <span className="n">{it.n}</span>
                <div className="bar"><span style={{ width: it.p + "%" }}></span></div>
                <span className="pct">{it.p}%</span>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section id="education" ref={(el) => sectionRefs.current.education = el} className="section">
        <h2><span className="ln">5</span>education.md</h2>
        {EDUCATION.map((e, i) => (
          <div key={i} className="card">
            <div className="ttl">
              <span className="nm">{e.role} <span style={{ color: "var(--blue)" }}>{e.co}</span></span>
              <span className="tag">{e.when}</span>
            </div>
            <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, color: "var(--subtext0)", fontSize: 13 }}>
              {e.bullets.map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
            </ul>
          </div>
        ))}
      </section>

      <section id="oss" ref={(el) => sectionRefs.current.oss = el} className="section">
        <h2><span className="ln">6</span>oss.json</h2>
        {OSS_REPOS.map(r => (
          <div key={r.name} className="card">
            <div className="ttl">
              <span className="nm">{r.name}</span>
              <span className="tag">⭐ {r.stars.toLocaleString()} · {r.lang}</span>
            </div>
            <div className="desc">{r.desc}</div>
          </div>
        ))}
      </section>

      <section id="contact" ref={(el) => sectionRefs.current.contact = el} className="section">
        <h2><span className="ln">7</span>contact.sh</h2>
        {CONTACT.map(c => (
          <div key={c.k} className="contact-row" style={{ gridTemplateColumns: "90px 1fr" }}>
            <span className="k">{c.k}</span>
            <span className="v">{c.v}</span>
          </div>
        ))}
      </section>

      <div className="mfoot">
        -- END OF BUFFER --<br />
        built with ♥ in a split-pane<br />
        <span style={{ color: "var(--overlay0)" }}>open on desktop for the full vim experience</span>
      </div>

      <div className="mstatus">
        <div className="b" style={{ background: "var(--blue)", color: "var(--crust)", fontWeight: 700 }}>NORMAL</div>
        <div className="b" style={{ background: "var(--surface1)", color: "var(--subtext1)" }}>~/{active}</div>
        <div className="b" style={{ flex: 1, background: "var(--mantle)" }}></div>
        <div className="b" style={{ background: "var(--blue)", color: "var(--crust)" }}>mobile</div>
      </div>
    </div>
  );
}
