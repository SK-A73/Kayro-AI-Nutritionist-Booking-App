import React from "react";
import { Sparkles, CalendarCheck, ShieldCheck, Database } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabase";

export default function Navbar({ activeView, setActiveView, selectedClient, setSelectedClient, clientNames }) {
  return (
    <header className="topbar">
      <div className="brand-wrap">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); setActiveView("client"); }}>
          <span className="brand-icon">
            <span className="brand-leaf">🍃</span>
          </span>
          <span className="brand-text">
            kayro<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="brand-tagline">
          <span className="badge-wellness">WELLNESS PRACTICE</span>
          <span className="brand-sub">Holistic Clinical Nutrition</span>
        </div>
      </div>

      <nav className="mode-switcher" aria-label="Interface Switcher">
        <button
          type="button"
          className={`switch-tab ${activeView === "client" ? "active" : ""}`}
          onClick={() => setActiveView("client")}
        >
          <CalendarCheck className="tab-icon" size={16} />
          <span>Side A: Client App</span>
        </button>
        <button
          type="button"
          className={`switch-tab ${activeView === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveView("dashboard")}
        >
          <ShieldCheck className="tab-icon" size={16} />
          <span>Side B: Nutritionist Dashboard</span>
        </button>
      </nav>

      <div className="topbar-meta">
        <div className="db-indicator" title={isSupabaseConfigured ? "Connected to Supabase PostgreSQL" : "Running on reactive persistent local storage. Ready for assessment!"}>
          <span className={`db-dot ${isSupabaseConfigured ? "supabase" : "local"}`}></span>
          <span className="db-label">
            {isSupabaseConfigured ? "Supabase Live" : "Reviewer Demo Store"}
          </span>
        </div>
      </div>
    </header>
  );
}
