// ============================================================
// APP — orchestrates buffers, keys, commands, layout
// ============================================================
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PORTFOLIO_DATA } from "./data/portfolioData";
import { BufferBody, PreviewBuffer, renderBuffer } from "./buffers/buffers";
import DashboardBuffer from "./components/DashboardBuffer";
import MobileView from "./components/MobileView";
import {
  Telescope,
  HelpOverlay,
  MakeOverlay,
  Confetti,
  SaveFlash,
  TweaksPanel,
} from "./components/overlays";

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "cream",
  "font": "JetBrains Mono",
  "statusline": "lualine",
  "showNu": true,
  "relativeNu": true,
  "showTree": true,
  "split": true
}/*EDITMODE-END*/;

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

function getStored(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function StatusLine({ mode, activeFile, cur, total, branch, style }) {
  const modeLabel = {
    NORMAL: "NORMAL", INSERT: "INSERT", VISUAL: "VISUAL", COMMAND: "COMMAND", MACRO: "MACRO-@q",
  }[mode] || "NORMAL";
  const modeCls = {
    NORMAL: "sl-mode-normal", INSERT: "sl-mode-insert", VISUAL: "sl-mode-visual",
    COMMAND: "sl-mode-command", MACRO: "sl-mode-macro",
  }[mode] || "sl-mode-normal";

  if (style === "minimal") {
    return (
      <div className="statusline">
        <div className={`sl-block ${modeCls}`}>{modeLabel}</div>
        <div className="sl-block sl-spacer" style={{ color: "var(--overlay1)", fontWeight: 400 }}>&nbsp;{activeFile}</div>
        <div className="sl-block sl-pct">{total ? Math.round(((cur + 1) / total) * 100) : 0}%</div>
      </div>
    );
  }

  if (style === "airline") {
    return (
      <div className="statusline">
        <div className={`sl-block ${modeCls}`}>{modeLabel}</div>
        <div className="sl-block sl-branch">  {branch}</div>
        <div className="sl-block sl-file">{activeFile}</div>
        <div className="sl-block sl-spacer"></div>
        <div className="sl-block sl-ft">utf-8 · unix</div>
        <div className="sl-block sl-ft">javascript</div>
        <div className="sl-block sl-pos">{cur + 1}:{1}</div>
        <div className="sl-block sl-pct">{total ? Math.round(((cur + 1) / total) * 100) : 0}%</div>
      </div>
    );
  }

  // lualine (default)
  return (
    <div className="statusline">
      <div className={`sl-block ${modeCls}`}>● {modeLabel}</div>
      <div className="sl-block sl-branch">  main</div>
      <div className="sl-block sl-diag"><span style={{ color: "var(--yellow)" }}>▲</span> 0 <span style={{ color: "var(--red)" }}>●</span> 0</div>
      <div className="sl-block sl-spacer" style={{ color: "var(--overlay1)", fontWeight: 400 }}>
        &nbsp;{activeFile}
      </div>
      <div className="sl-block sl-ft">UTF-8</div>
      <div className="sl-block sl-pos">Ln {cur + 1}, Col 1</div>
      <div className="sl-block sl-pct">{total ? Math.round(((cur + 1) / total) * 100) : 0}%</div>
    </div>
  );
}

function FileTree({ files, activeKind, focusedKind, onOpen, hidden, onFocus, pwd }) {
  if (hidden) return null;
  return (
    <div className="tree">
      <div className="tree-header">
        <span>Explorer</span>
        <span className="pwd">{pwd}</span>
      </div>
      <div className="tree-list">
        <div className="tree-row" style={{ cursor: "default" }}>
          <span className="chev">▾</span>
          <span className="ico dir"></span>
          <span className="nm" style={{ color: "var(--blue)" }}>portfolio/</span>
        </div>
        <div className="tree-children">
          {files.map((f) => {
            if (f.separator) return <div key={f.id} style={{ height: 6 }} />;
            const active = f.kind === activeKind;
            const focused = f.kind === focusedKind;
            return (
              <div
                key={f.id}
                className={`tree-row ${active ? "active" : ""} ${focused ? "focused" : ""}`}
                onClick={() => onOpen(f.kind)}
                onMouseEnter={() => onFocus && onFocus(f.kind)}
              >
                <span className="chev"> </span>
                <span className={`ico ${f.icon}`}>
                  {f.icon === "md" ? "" : f.icon === "ts" ? "" : f.icon === "json" ? "{ }" : f.icon === "yaml" ? "" : f.icon === "sh" ? "" : f.icon === "txt" ? "" : ""}
                </span>
                <span className="nm">{f.label}</span>
                {active && <span className="badge">●</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="tree-footer">
        <div>Shortcuts</div>
        <div><kbd>Ctrl</kbd>+<kbd>P</kbd> telescope</div>
        <div><kbd>:</kbd> command</div>
        <div><kbd>?</kbd> help</div>
      </div>
    </div>
  );
}

function Pane({ focused, title, meta, children, onFocus }) {
  return (
    <div className={`pane ${focused ? "focused" : ""}`} onMouseDown={onFocus}>
      <div className="pane-header">
        <span className="dot"></span>
        <span className="path">
          <span>~</span><span className="sep">/</span>
          <span>portfolio</span><span className="sep">/</span>
          <span className="leaf">{title}</span>
        </span>
        <span className="spacer"></span>
        <span className="meta">{meta}</span>
      </div>
      <div className="buffer">{children}</div>
    </div>
  );
}

export default function App() {
  const [opts, setOpts] = useState(() => {
    try {
      const saved = JSON.parse(getStored("vim-portfolio-opts", "{}"));
      return { ...TWEAK_DEFAULTS, ...saved };
    } catch { return TWEAK_DEFAULTS; }
  });
  useEffect(() => { setStored("vim-portfolio-opts", JSON.stringify(opts)); }, [opts]);

  const [activeKind, setActiveKind] = useState(() => getStored("vim-active", "dashboard"));
  useEffect(() => { setStored("vim-active", activeKind); }, [activeKind]);

  const [previewKind, setPreviewKind] = useState(activeKind);
  const [focusedPane, setFocusedPane] = useState("main"); // main | preview
  const [mode, setMode] = useState("NORMAL");
  const [cmd, setCmd] = useState("");
  const [cmdMsg, setCmdMsg] = useState({ text: '-- NORMAL --  press : for command, Ctrl-P for telescope, ? for help', cls: "" });
  const [telescopeOpen, setTelescopeOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [makeOpen, setMakeOpen] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [cursors, setCursors] = useState({ main: 0, preview: 0 });
  const [tweakEdit, setTweakEdit] = useState(false);
  const [showHintBar, setShowHintBar] = useState(() => !getStored("vim-hint-dismissed"));
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const konamiBuf = useRef([]);
  const cmdInputRef = useRef(null);

  // mobile listener
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // tab bar = open buffers
  const [openBuffers, setOpenBuffers] = useState(() => {
    try { return JSON.parse(getStored("vim-buffers", "null")) || ["dashboard"]; }
    catch { return ["dashboard"]; }
  });
  useEffect(() => { setStored("vim-buffers", JSON.stringify(openBuffers)); }, [openBuffers]);

  // open buffer + add to tabs
  const openBuffer = useCallback((kind) => {
    setActiveKind(kind);
    setPreviewKind(kind);
    setOpenBuffers((bufs) => bufs.includes(kind) ? bufs : [...bufs, kind]);
    setCursors((c) => ({ ...c, main: 0 }));
  }, []);

  const closeBuffer = useCallback((kind, e) => {
    e && e.stopPropagation();
    setOpenBuffers((bufs) => {
      const next = bufs.filter((b) => b !== kind);
      if (next.length === 0) next.push("about");
      if (kind === activeKind) {
        const idx = bufs.indexOf(kind);
        const newActive = next[Math.min(idx, next.length - 1)];
        setActiveKind(newActive);
        setPreviewKind(newActive);
      }
      return next;
    });
  }, [activeKind]);

  // command execution
  const runCommand = useCallback((raw) => {
    const c = raw.trim();
    if (!c) return;
    const [head, ...rest] = c.split(/\s+/);
    const arg = rest.join(" ");

    const openByAlias = (name) => {
      const map = {
        dashboard: "dashboard", dash: "dashboard", home: "dashboard", landing: "dashboard",
        about: "about", readme: "about", "readme.md": "about",
        experience: "experience", "experience.ts": "experience", exp: "experience", work: "experience",
        projects: "projects", "projects.md": "projects", proj: "projects",
        skills: "skills", "skills.yaml": "skills",
        education: "education", "education.md": "education", edu: "education",
        oss: "oss", "oss.json": "oss", github: "oss",
        contact: "contact", "contact.sh": "contact",
        help: "help",
      };
      const k = map[name.toLowerCase()];
      if (k) { openBuffer(k); setCmdMsg({ text: `"${name}" ${k === "help" ? "" : "[readonly]"}`, cls: "ok" }); return true; }
      return false;
    };

    if (head === ":q" || head === ":quit") {
      setCmdMsg({ text: 'E37: No write since last change (add ! to override)  — try :q! or :wq', cls: "err" });
      return;
    }
    if (head === ":q!" || head === ":quit!") {
      setCmdMsg({ text: "Nice try. You're still here.", cls: "err" });
      return;
    }
    if (head === ":wq" || head === ":x" || head === "ZZ" || head === ":w") {
      setSaveFlash(true); setConfetti(true);
      setCmdMsg({ text: '"portfolio.md" 1337L, 42K written', cls: "ok" });
      setTimeout(() => { setSaveFlash(false); setConfetti(false); }, 1600);
      return;
    }
    if (head === ":help" || head === ":h") { setHelpOpen(true); return; }
    if (head === ":make") { setMakeOpen(true); setCmdMsg({ text: "[make] running...", cls: "" }); return; }
    if (head === ":colorscheme" || head === ":colo") {
      const valid = ["cream","mocha","latte","gruvbox","tokyonight"];
      if (valid.includes(arg)) { setOpts({ ...opts, theme: arg }); setCmdMsg({ text: `colorscheme ${arg}`, cls: "ok" }); }
      else setCmdMsg({ text: `E185: Cannot find color scheme '${arg}'. try: ${valid.join(", ")}`, cls: "err" });
      return;
    }
    if (head === ":set") {
      if (arg === "nu" || arg === "number") { setOpts({ ...opts, showNu: true }); setCmdMsg({ text: "number", cls: "ok" }); return; }
      if (arg === "nonu" || arg === "nonumber") { setOpts({ ...opts, showNu: false }); setCmdMsg({ text: "nonumber", cls: "ok" }); return; }
      if (arg === "rnu" || arg === "relativenumber") { setOpts({ ...opts, relativeNu: true }); setCmdMsg({ text: "relativenumber", cls: "ok" }); return; }
      if (arg === "nornu" || arg === "norelativenumber") { setOpts({ ...opts, relativeNu: false }); setCmdMsg({ text: "norelativenumber", cls: "ok" }); return; }
      setCmdMsg({ text: `E518: Unknown option: ${arg}`, cls: "err" }); return;
    }
    if (head === ":NvimTreeToggle" || head === ":NERDTreeToggle") {
      setOpts({ ...opts, showTree: !opts.showTree });
      setCmdMsg({ text: "tree toggled", cls: "ok" }); return;
    }
    if (head === ":only") {
      setOpts({ ...opts, split: !opts.split });
      setCmdMsg({ text: opts.split ? "preview closed" : "preview opened", cls: "ok" }); return;
    }
    if (head === ":e" || head === ":edit" || head === ":o" || head === ":open") {
      if (!arg) { setCmdMsg({ text: "E32: No file name", cls: "err" }); return; }
      if (!openByAlias(arg)) setCmdMsg({ text: `E447: Can't find file "${arg}"`, cls: "err" });
      return;
    }
    if (head === ":b" || head === ":buffer") {
      const n = parseInt(arg, 10);
      if (!isNaN(n)) {
        const b = openBuffers[n - 1];
        if (b) { setActiveKind(b); setPreviewKind(b); setCmdMsg({ text: `buffer ${n}`, cls: "ok" }); return; }
        setCmdMsg({ text: `E86: Buffer ${n} does not exist`, cls: "err" }); return;
      }
      if (!openByAlias(arg)) setCmdMsg({ text: `E93: buffer not found`, cls: "err" });
      return;
    }
    if (head === ":bn" || head === ":bnext") {
      const i = openBuffers.indexOf(activeKind);
      const next = openBuffers[(i + 1) % openBuffers.length];
      setActiveKind(next); setPreviewKind(next); return;
    }
    if (head === ":bp" || head === ":bprev") {
      const i = openBuffers.indexOf(activeKind);
      const next = openBuffers[(i - 1 + openBuffers.length) % openBuffers.length];
      setActiveKind(next); setPreviewKind(next); return;
    }
    if (head === ":Telescope" || head === ":Tel") { setTelescopeOpen(true); return; }
    if (head === ":tweaks") { setTweakEdit(true); return; }
    if (openByAlias(head.replace(/^:/, ""))) return;

    setCmdMsg({ text: `E492: Not an editor command: ${c}`, cls: "err" });
  }, [opts, openBuffers, activeKind, openBuffer]);

  // global keyboard
  useEffect(() => {
    function onKey(e) {
      // let inputs do their thing
      if (mode === "COMMAND" && document.activeElement === cmdInputRef.current) return;
      if (telescopeOpen || helpOpen || makeOpen) return;

      // konami
      konamiBuf.current.push(e.key);
      if (konamiBuf.current.length > KONAMI.length) konamiBuf.current.shift();
      if (konamiBuf.current.join(",") === KONAMI.join(",")) {
        setMode("MACRO");
        setCmdMsg({ text: "▶ recording @q — secret macro mode engaged", cls: "ok" });
        konamiBuf.current = [];
        // rainbow the theme for a second
        const themes = ["mocha", "tokyonight", "gruvbox", "latte"];
        let i = 0;
        const iv = setInterval(() => { setOpts((o) => ({ ...o, theme: themes[i++ % themes.length] })); }, 180);
        setTimeout(() => { clearInterval(iv); setOpts((o) => ({ ...o, theme: TWEAK_DEFAULTS.theme })); setMode("NORMAL"); setCmdMsg({ text: "▶ macro complete. enjoy.", cls: "ok" }); }, 1800);
        return;
      }

      if (e.key === "Escape") { setMode("NORMAL"); setCmd(""); setCmdMsg({ text: "-- NORMAL --", cls: "" }); return; }

      if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); setTelescopeOpen(true); return; }

      if (e.key === "?") { setHelpOpen(true); return; }

      if (e.key === ":") {
        e.preventDefault();
        setMode("COMMAND");
        setCmd(":");
        setTimeout(() => cmdInputRef.current && cmdInputRef.current.focus(), 0);
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        setMode("COMMAND");
        setCmd("/");
        setTimeout(() => cmdInputRef.current && cmdInputRef.current.focus(), 0);
        return;
      }

      if (e.key === "i") { setMode("INSERT"); setCmdMsg({ text: "-- INSERT --  (readonly portfolio, nothing to insert)", cls: "" }); return; }
      if (e.key === "v") { setMode("VISUAL"); setCmdMsg({ text: "-- VISUAL --  (nothing to select, but looks cool)", cls: "" }); return; }

      // pane/nav
      if (mode === "NORMAL") {
        if (e.key === "j" || e.key === "ArrowDown") {
          setCursors((c) => ({ ...c, [focusedPane]: c[focusedPane] + 1 }));
        } else if (e.key === "k" || e.key === "ArrowUp") {
          setCursors((c) => ({ ...c, [focusedPane]: Math.max(0, c[focusedPane] - 1) }));
        } else if (e.key === "g") {
          setCursors((c) => ({ ...c, [focusedPane]: 0 }));
        } else if (e.key === "G") {
          setCursors((c) => ({ ...c, [focusedPane]: 9999 }));
        } else if ((e.ctrlKey && (e.key === "h" || e.key === "l")) ||
                   e.key === "h" || e.key === "l") {
          // h/l to swap pane focus
          if (opts.split) setFocusedPane(focusedPane === "main" ? "preview" : "main");
        } else if (e.key === "n") {
          // next tab
          const i = openBuffers.indexOf(activeKind);
          const next = openBuffers[(i + 1) % openBuffers.length];
          setActiveKind(next); setPreviewKind(next);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, telescopeOpen, helpOpen, makeOpen, focusedPane, opts.split, openBuffers, activeKind]);

  // compute buffer content
  const mainLines = useMemo(() => renderBuffer(activeKind), [activeKind]);
  const previewLines = useMemo(() => PreviewBuffer({ kind: previewKind }), [previewKind]);

  // clamp cursors
  useEffect(() => { setCursors((c) => ({ ...c, main: Math.min(c.main, Math.max(0, mainLines.length - 1)) })); }, [mainLines.length]);
  useEffect(() => { setCursors((c) => ({ ...c, preview: Math.min(c.preview, Math.max(0, previewLines.length - 1)) })); }, [previewLines.length]);

  const { FILES } = PORTFOLIO_DATA;
  const activeFile = FILES.find((f) => f.kind === activeKind)?.label || activeKind;

  // edit mode (tweaks via toolbar)
  useEffect(() => {
    function onMsg(e) {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setTweakEdit(true);
      if (e.data.type === "__deactivate_edit_mode") setTweakEdit(false);
    }
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  function updateOpts(newOpts) {
    setOpts(newOpts);
    const keys = {};
    Object.keys(TWEAK_DEFAULTS).forEach((k) => { keys[k] = newOpts[k]; });
    try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits: keys }, "*"); } catch {}
  }

  // apply theme + font
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", opts.theme);
    document.documentElement.style.setProperty("--font-mono", `"${opts.font}"`);
  }, [opts.theme, opts.font]);

  // telescope pick
  function onPickTelescope(r) {
    if (r.kind === "action") {
      if (r.action === "make") setMakeOpen(true);
      else if (r.action === "quit") setCmdMsg({ text: 'E37: No write since last change (add ! to override)', cls: "err" });
      else if (r.action.startsWith("theme:")) updateOpts({ ...opts, theme: r.action.split(":")[1] });
    } else {
      openBuffer(r.kind);
    }
  }

  if (isMobile) {
    return <MobileView theme={opts.theme} onToggleTheme={() => {
      const ts = ["cream","mocha","latte","gruvbox","tokyonight"];
      const i = ts.indexOf(opts.theme);
      updateOpts({ ...opts, theme: ts[(i + 1) % ts.length] });
    }} />;
  }

  const themeCycle = () => {
    const ts = ["cream","mocha","latte","gruvbox","tokyonight"];
    const i = ts.indexOf(opts.theme);
    updateOpts({ ...opts, theme: ts[(i + 1) % ts.length] });
  };

  return (
    <>
      <div className="desktop-widget badge">
        <div>~ portfolio</div>
        <div className="name">Kirsten — Full Stack Engineer</div>
      </div>
      <DesktopClock />
      <div className="desktop-widget note">
        <div className="h">post-it</div>
        press <span style={{fontFamily:"inherit", background:"#f2d572", padding:"0 4px", borderRadius:2}}>Ctrl+P</span> for finder, <span style={{background:"#f2d572",padding:"0 4px",borderRadius:2}}>:help</span> for commands, or click around.
      </div>
      <div className="app">
        <div className="titlebar">
          <div className="lights">
            <span className="dot close" onClick={() => runCommand(":q")} title=":q"></span>
            <span className="dot min" title="min"></span>
            <span className="dot max" onClick={() => setOpts({ ...opts, split: !opts.split })} title="toggle split"></span>
          </div>
          <div className="title">
            <span className="crumb">~/</span><span className="pwd">kirsten</span><span className="crumb">/portfolio</span>
            <span className="crumb"> — </span><span>{activeFile}</span>
          </div>
          <div className="right">nvim · ttys000</div>
        </div>
        {/* tab / buffer line */}
      <div className="tabline">
        {openBuffers.map((b, i) => {
          const f = FILES.find((x) => x.kind === b);
          return (
            <div
              key={b}
              className={`tab ${b === activeKind ? "active" : ""}`}
              onClick={() => { setActiveKind(b); setPreviewKind(b); }}
            >
              <span style={{ color: "var(--overlay0)", fontSize: 10 }}>{i + 1}</span>
              <span>{f ? f.label : b}</span>
              <button className="close" onClick={(e) => closeBuffer(b, e)}>×</button>
            </div>
          );
        })}
        <div className="tabline-right">
          <button className="theme-toggle" onClick={themeCycle} title="cycle colorscheme (:colorscheme)">
            <span className="dot"></span><span>{opts.theme}</span>
          </button>
          <button className="theme-toggle" onClick={() => setTelescopeOpen(true)} title="Ctrl-P">
            <span style={{ color: "var(--mauve)" }}>🔭</span><span>find</span>
          </button>
          <button className="theme-toggle" onClick={() => setHelpOpen(true)} title=":help">
            <span style={{ color: "var(--yellow)" }}>?</span><span>help</span>
          </button>
          <button className="theme-toggle" onClick={() => setTweakEdit((v) => !v)} title="tweaks">
            <span style={{ color: "var(--teal)" }}>⚙</span><span>tweaks</span>
          </button>
        </div>
      </div>

      {/* workspace */}
      <div className="workspace">
        <FileTree
          files={FILES}
          activeKind={activeKind}
          focusedKind={activeKind}
          hidden={!opts.showTree}
          pwd="~/portfolio"
          onOpen={openBuffer}
        />
        <div className={`splits ${opts.split && activeKind !== "dashboard" ? "" : "single"}`}>
          <Pane
            focused={focusedPane === "main"}
            title={activeFile}
            meta={<><span className="k">{activeKind === "dashboard" ? "dashboard" : "js"}</span><span>spaces: 2</span><span>utf-8</span></>}
            onFocus={() => setFocusedPane("main")}
          >
            {activeKind === "dashboard" ? (
              <div className="buffer" style={{ display: "block" }}>
                <DashboardBuffer
                  onOpen={openBuffer}
                  onCommand={(c) => {
                    if (c === "help") setHelpOpen(true);
                    else if (c === "telescope") setTelescopeOpen(true);
                    else if (c === "wq") runCommand(":wq");
                  }}
                />
              </div>
            ) : (
              <BufferBody
                lines={mainLines}
                cur={cursors.main}
                relative={opts.relativeNu}
                showNu={opts.showNu}
                onCursor={(i) => setCursors((c) => ({ ...c, main: i }))}
              />
            )}
          </Pane>
          {opts.split && activeKind !== "dashboard" && (
            <Pane
              focused={focusedPane === "preview"}
              title="preview.md"
              meta={<><span className="k">md</span><span>readonly</span></>}
              onFocus={() => setFocusedPane("preview")}
            >
              <BufferBody
                lines={previewLines}
                cur={cursors.preview}
                relative={opts.relativeNu}
                showNu={opts.showNu}
                onCursor={(i) => setCursors((c) => ({ ...c, preview: i }))}
              />
            </Pane>
          )}
        </div>
      </div>

      <StatusLine
        mode={mode}
        activeFile={activeFile}
        cur={cursors[focusedPane]}
        total={(focusedPane === "main" ? mainLines : previewLines).length}
        branch="main"
        style={opts.statusline}
      />

      {/* command line */}
      <div className="commandline">
        {mode === "COMMAND" ? (
          <>
            <span className="prompt">{cmd[0]}</span>
            <input
              ref={cmdInputRef}
              value={cmd.slice(1)}
              onChange={(e) => setCmd(cmd[0] + e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (cmd[0] === ":") runCommand(cmd);
                  else if (cmd[0] === "/") {
                    // very light search: highlight first match in main buffer is optional; just echo
                    const q = cmd.slice(1);
                    if (q) setCmdMsg({ text: `/${q}`, cls: "" });
                  }
                  setMode("NORMAL"); setCmd("");
                } else if (e.key === "Escape") {
                  setMode("NORMAL"); setCmd("");
                }
              }}
              autoFocus
            />
            <span className="cursor"></span>
          </>
        ) : (
          <>
            <span className={`msg ${cmdMsg.cls || ""}`}>{cmdMsg.text}</span>
            <span style={{ marginLeft: "auto", color: "var(--overlay0)" }}>
              <span className="kbd">:</span> command · <span className="kbd">Ctrl</span>+<span className="kbd">P</span> find · <span className="kbd">?</span> help
            </span>
          </>
        )}
      </div>

      {telescopeOpen && <Telescope onClose={() => setTelescopeOpen(false)} onPick={onPickTelescope} />}
      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}
      {makeOpen && <MakeOverlay onClose={() => setMakeOpen(false)} />}
      {saveFlash && <SaveFlash />}
      {confetti && <Confetti />}
      {tweakEdit && <TweaksPanel opts={opts} setOpts={updateOpts} onClose={() => setTweakEdit(false)} />}

      {showHintBar && !tweakEdit && !telescopeOpen && !helpOpen && (
        <div className="hint-bar">
          <span style={{ color: "var(--mauve)" }}>psst —</span>
          <span>try <span className="kbd">:help</span>, <span className="kbd">Ctrl</span>+<span className="kbd">P</span>, <span className="kbd">:q</span>, or the konami code</span>
          <button className="x" onClick={() => { setShowHintBar(false); setStored("vim-hint-dismissed", "1"); }}>×</button>
        </div>
      )}
    </div>
    </>
  );
}

function DesktopClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const iv = setInterval(() => setT(new Date()), 1000 * 30); return () => clearInterval(iv); }, []);
  const hh = t.getHours().toString().padStart(2, "0");
  const mm = t.getMinutes().toString().padStart(2, "0");
  const date = t.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return (
    <div className="desktop-widget clock">
      <div className="t">{hh}:{mm}</div>
      <div className="d">{date}</div>
    </div>
  );
}
