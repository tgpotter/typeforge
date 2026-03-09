import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MODULES } from "./data/modules";
import { useAuth } from "./auth/useAuth";

const STATS = [
  { label: "Current WPM", value: "—", unit: "" },
  { label: "Accuracy", value: "—", unit: "%" },
  { label: "Day Streak", value: "0", unit: "days" },
  { label: "Total Practice", value: "0", unit: "min" },
];

function KeyboardGraphic() {
  const rows = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L",";"],
    ["Z","X","C","V","B","N","M",",",".","/"],
  ];
  const homeRow = ["A","S","D","F","J","K","L",";"];
  const [lit, setLit] = useState([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      const key = homeRow[i % homeRow.length];
      setLit([key]);
      i++;
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center", opacity: 0.7 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: "4px", marginLeft: ri === 1 ? "8px" : ri === 2 ? "20px" : "0" }}>
          {row.map(k => (
            <div key={k} style={{
              width: 28, height: 28,
              borderRadius: 4,
              border: `1px solid ${lit.includes(k) ? "#E8FF47" : "rgba(255,255,255,0.15)"}`,
              background: lit.includes(k) ? "rgba(232,255,71,0.2)" : "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: lit.includes(k) ? "#E8FF47" : "rgba(255,255,255,0.3)",
              fontFamily: "monospace",
              transition: "all 0.15s ease",
              boxShadow: lit.includes(k) ? "0 0 8px rgba(232,255,71,0.4)" : "none",
            }}>{k}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, unit }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "20px 24px",
      flex: 1,
      minWidth: 120,
    }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Lexend', sans-serif" }}>{label}</div>
      <div style={{ fontSize: 32, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>{unit}</span>
      </div>
    </div>
  );
}

function ModuleCard({ module, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(module)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? module.color + "60" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 16,
        padding: "24px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${module.color}30` : "none",
        overflow: "hidden",
      }}
    >
      {/* Number watermark */}
      <div style={{
        position: "absolute", top: -10, right: 16,
        fontSize: 80, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 900,
        color: "rgba(255,255,255,0.03)", lineHeight: 1, userSelect: "none",
        transition: "color 0.25s",
      }}>{module.number}</div>

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: module.color + "18",
          border: `1px solid ${module.color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>{module.icon}</div>
        <div style={{
          fontSize: 10, fontFamily: "'Lexend', sans-serif",
          color: module.color, letterSpacing: "0.1em",
          background: module.color + "18",
          padding: "4px 10px", borderRadius: 20,
          border: `1px solid ${module.color}30`,
        }}>{module.difficulty}</div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Lexend', sans-serif", letterSpacing: "0.1em", marginBottom: 4 }}>
          MODULE {module.number}
        </div>
        <div style={{ fontSize: 19, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{module.title}</div>
        <div style={{ fontSize: 12, color: module.color, fontFamily: "'Lexend', sans-serif", marginTop: 2 }}>{module.subtitle}</div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "14px 0" }}>{module.description}</div>

      {/* Key focus tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {module.keyFocus.map(k => (
          <span key={k} style={{
            fontSize: 10, fontFamily: "'Lexend', sans-serif",
            color: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.06)",
            padding: "3px 8px", borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>{k}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Lexend', sans-serif" }}>
          {module.lessonCount > 0 ? `${module.lessonCount} lessons` : "Adaptive"} · {module.duration}
        </div>
        <div style={{
          fontSize: 12, color: module.color, fontFamily: "'Lexend', sans-serif",
          display: "flex", alignItems: "center", gap: 4,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}>START →</div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 14, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
        <div style={{ height: "100%", width: `${module.progress}%`, background: module.color, borderRadius: 1, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function SelectedModulePanel({ module, onClose, navigate }) {
  if (!module) return null;

  const phases = {
    foundation: [
      { week: "Week 1", focus: "ASDF — left hand anchor", goal: "Type home row without looking" },
      { week: "Week 1", focus: "JKL; — right hand anchor", goal: "Full home row fluency" },
      { week: "Week 2", focus: "Top row E, R, U, I", goal: "Reach up, return home" },
      { week: "Week 2", focus: "Bottom row C, V, M", goal: "Reach down, return home" },
    ],
    fingers: [
      { week: "Phase 1", focus: "Left pinky & ring (Q, A, Z, W, S, X)", goal: "Strengthen underdeveloped fingers" },
      { week: "Phase 2", focus: "Right pinky & ring (P, ;, /, O, L, .)", goal: "Symmetric finger strength" },
      { week: "Phase 3", focus: "Full keyboard map", goal: "Every key has an owner" },
    ],
    accuracy: [
      { week: "Stage 1", focus: "Slow & perfect — full paragraphs at zero errors", goal: "95% accuracy baseline" },
      { week: "Stage 2", focus: "Problem key isolation drill", goal: "Eliminate top 5 error sources" },
      { week: "Stage 3", focus: "Speed+accuracy combined tests", goal: "97% accuracy at comfortable pace" },
    ],
    frequency: [
      { week: "Block 1", focus: "Top 100 words — pure repetition", goal: "Automatic reflex on most common words" },
      { week: "Block 2", focus: "Top 100–500 — sentences & phrases", goal: "Fluid real-world typing" },
      { week: "Block 3", focus: "Top 500–1000 — varied content", goal: "85% coverage at speed" },
    ],
    speed: [
      { week: "Rung 1", focus: "Establish baseline WPM", goal: "Consistent at current speed" },
      { week: "Rung 2", focus: "+5 WPM target — burst drills", goal: "Stabilize new speed before climbing" },
      { week: "Rung N", focus: "Repeat until goal WPM", goal: "Never skip a rung" },
    ],
    weakness: [
      { week: "Session", focus: "AI analysis of your error patterns", goal: "Identify slowest bigrams & missed keys" },
      { week: "Daily", focus: "Custom drill of your weak spots", goal: "10 min targeted weakness work" },
      { week: "Weekly", focus: "Re-test & update weak key list", goal: "Track improvement, update targets" },
    ],
    stamina: [
      { week: "Phase 1", focus: "5-min continuous sessions", goal: "Maintain speed without degrading" },
      { week: "Phase 2", focus: "15-min long form — quotes & prose", goal: "Flow state consistency" },
      { week: "Phase 3", focus: "30-min professional simulation", goal: "Real-world document speed" },
    ],
    ergonomics: [
      { week: "Check 1", focus: "Posture & chair height audit", goal: "Neutral spine, relaxed shoulders" },
      { week: "Check 2", focus: "Wrist position & keyboard angle", goal: "Wrists elevated, no contact typing" },
      { week: "Check 3", focus: "Break cadence — 30 min on, 5 off", goal: "Sustainable long-term practice" },
    ],
  };

  const plan = phases[module.id] || [];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#111", border: `1px solid ${module.color}40`,
        borderRadius: 20, padding: 36, maxWidth: 560, width: "100%",
        boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px ${module.color}20`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'Lexend', sans-serif", color: module.color, letterSpacing: "0.12em", marginBottom: 8 }}>MODULE {module.number} — {module.difficulty.toUpperCase()}</div>
            <div style={{ fontSize: 26, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, color: "#fff" }}>{module.title}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8, lineHeight: 1.6 }}>{module.description}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ fontSize: 11, fontFamily: "'Lexend', sans-serif", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 12 }}>TRAINING PLAN</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {plan.map((p, i) => (
            <div key={i} style={{
              display: "flex", gap: 16, alignItems: "flex-start",
              padding: "14px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
            }}>
              <div style={{ minWidth: 60, fontSize: 10, fontFamily: "'Lexend', sans-serif", color: module.color, marginTop: 2 }}>{p.week}</div>
              <div>
                <div style={{ fontSize: 13, color: "#fff", marginBottom: 3 }}>{p.focus}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Lexend', sans-serif" }}>Goal: {p.goal}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { onClose(); navigate(`/module/${module.id}`) }} style={{
          width: "100%", padding: "16px", borderRadius: 12,
          background: module.color, border: "none", cursor: "pointer",
          fontSize: 14, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700,
          color: "#000", letterSpacing: "0.05em",
          transition: "opacity 0.2s",
        }}>
          BEGIN MODULE {module.number} →
        </button>
      </div>
    </div>
  );
}

export default function TypeForgeHome() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [navSolid, setNavSolid] = useState(false);
  const navigate = useNavigate();
  const { isValid, user, signOut, openAuthModal } = useAuth();

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      color: "#fff",
      fontFamily: "'Lexend', sans-serif",
      overflowX: "hidden",
    }}>
      {/* Noise texture overlay */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px",
      }} />

      {/* Subtle grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Glow accent */}
      <div style={{
        position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400,
        background: "radial-gradient(ellipse, rgba(232,255,71,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        padding: "18px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: navSolid ? "rgba(10,10,10,0.9)" : "transparent",
        backdropFilter: navSolid ? "blur(20px)" : "none",
        borderBottom: navSolid ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#E8FF47", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>⌨</div>
          <span style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>TypeForge</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          {[["Program","/"],["Progress","/progress"],["Leaderboard","/leaderboard"],["Settings","/settings"]].map(([item, path]) => (
            <span key={item} style={{ cursor: "pointer", transition: "color 0.2s" }}
              onClick={() => navigate(path)}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
            >{item}</span>
          ))}
        </div>
        {isValid ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Lexend', sans-serif" }}>
              {user?.username ?? user?.email}
            </span>
            <button onClick={signOut} style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
              padding: "9px 16px", cursor: "pointer",
              fontFamily: "'Lexend', sans-serif", fontSize: 12,
              color: "rgba(255,255,255,0.6)",
            }}>Sign Out</button>
          </div>
        ) : (
          <button onClick={openAuthModal} style={{
            background: "#E8FF47", border: "none", borderRadius: 8,
            padding: "9px 20px", cursor: "pointer",
            fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, fontSize: 13,
            color: "#000",
          }}>Sign In →</button>
        )}
      </nav>

      {/* Hero */}
      <div style={{ padding: "72px 48px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(232,255,71,0.1)", border: "1px solid rgba(232,255,71,0.2)",
              borderRadius: 20, padding: "6px 14px", marginBottom: 28,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8FF47" }} />
              <span style={{ fontSize: 11, color: "#E8FF47", letterSpacing: "0.1em" }}>8-MODULE TRAINING SYSTEM</span>
            </div>

            <h1 style={{
              fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 900,
              fontSize: 58, lineHeight: 1.0, letterSpacing: "-0.03em",
              color: "#fff", margin: "0 0 20px",
            }}>
              Forge your<br />
              <span style={{ color: "#E8FF47" }}>typing</span><br />
              speed.
            </h1>

            <p style={{
              fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7,
              maxWidth: 400, margin: "0 0 36px",
            }}>
              A science-backed program from home row to 100+ WPM. Eight modules. Deliberate practice. Measurable results.
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button style={{
                background: "#E8FF47", border: "none", borderRadius: 10,
                padding: "14px 28px", cursor: "pointer",
                fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, fontSize: 15,
                color: "#000",
              }}>Start Training</button>
              <button style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10,
                padding: "14px 28px", cursor: "pointer",
                fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 600, fontSize: 15,
                color: "rgba(255,255,255,0.7)",
              }}>Take Speed Test</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-end" }}>
            <KeyboardGraphic />
            <div style={{
              background: "rgba(232,255,71,0.06)",
              border: "1px solid rgba(232,255,71,0.15)",
              borderRadius: 12, padding: "14px 20px",
              fontSize: 12, color: "rgba(255,255,255,0.5)",
              maxWidth: 280, lineHeight: 1.6,
            }}>
              <span style={{ color: "#E8FF47" }}>Home row keys highlighted.</span> This is your foundation — every keystroke returns here.
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "0 48px 56px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </div>

      {/* Modules */}
      <div style={{ padding: "0 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: 8 }}>THE PROGRAM</div>
            <div style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em" }}>Training Modules</div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>8 modules · Complete in any order</div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.id} module={mod} onSelect={setSelectedModule} />
          ))}
        </div>
      </div>

      {/* Program summary banner */}
      <div style={{ padding: "0 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          background: "rgba(232,255,71,0.05)",
          border: "1px solid rgba(232,255,71,0.15)",
          borderRadius: 20, padding: "40px 48px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 24,
        }}>
          <div>
            <div style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
              The Research-Backed Path
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 500, lineHeight: 1.7 }}>
              15–30 min/day. Accuracy first, speed second. Weak keys targeted daily. Progress tracked every session. Most typists double their WPM in 4–8 weeks.
            </div>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {[["4–8", "weeks to double WPM"], ["95%", "accuracy before speed"], ["15–30", "min daily practice"]].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 900, fontSize: 32, color: "#E8FF47", lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6, maxWidth: 80, lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedModule && <SelectedModulePanel module={selectedModule} onClose={() => setSelectedModule(null)} navigate={navigate} />}
    </div>
  );
}
