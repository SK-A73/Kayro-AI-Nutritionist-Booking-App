import React from "react";
import { CalendarCheck, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabase";

export default function Navbar({ activeView, setActiveView }) {
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
          <span className="brand-sub">Clinical Nutrition Appointments</span>
        </div>
      </div>

      <nav className="mode-switcher" aria-label="Interface Switcher">
        <button
          type="button"
          className={`switch-tab ${activeView === "client" ? "active" : ""}`}
          onClick={() => setActiveView("client")}
        >
          <CalendarCheck className="tab-icon" size={16} />
          <span className="tab-label-full">Side A: Client App</span>
          <span className="tab-label-short">Client App</span>
        </button>
        <button
          type="button"
          className={`switch-tab ${activeView === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveView("dashboard")}
        >
          <ShieldCheck className="tab-icon" size={16} />
          <span className="tab-label-full">Side B: Nutritionist Dashboard</span>
          <span className="tab-label-short">Dashboard</span>
        </button>
      </nav>

      <div className="topbar-meta">
        <div
          className="db-indicator"
          title={
            isSupabaseConfigured
              ? "Supabase PostgreSQL connected as single source of truth"
              : "Supabase credentials pending in environment variables"
          }
        >
          <span className={`db-dot ${isSupabaseConfigured ? "supabase" : "local"}`}></span>
          <span className="db-label db-label-full">
            {isSupabaseConfigured ? "Supabase PostgreSQL" : "Connecting Supabase..."}
          </span>
          <span className="db-label db-label-short">
            {isSupabaseConfigured ? "Supabase" : "Connecting..."}
          </span>
        </div>
      </div>
    </header>
  );
}
