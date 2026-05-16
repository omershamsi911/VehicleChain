// src/utils/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  // Read saved preference, fall back to OS preference, then "light"
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("vc-theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch (_) {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Apply CSS variables to :root whenever theme changes
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      // ── Dark theme ──────────────────────────────────────────────────────────
      root.style.setProperty("--bg",            "#0F0F0F");
      root.style.setProperty("--bg-inverted",   "#FFFFFF");
      root.style.setProperty("--surface",       "#1A1A1A");
      root.style.setProperty("--border",        "rgba(255,255,255,0.10)");
      root.style.setProperty("--border-inv",    "rgba(255,255,255,0.08)");
      root.style.setProperty("--text",          "#F0F0F0");
      root.style.setProperty("--text-muted",    "rgba(240,240,240,0.45)");
      root.style.setProperty("--text-inv",      "#0F0F0F");
      root.style.setProperty("--text-inv-muted","rgba(15,15,15,0.50)");
      root.style.setProperty("--accent",        "#FFDE00");
    } else {
      // ── Light theme (original) ──────────────────────────────────────────────
      root.style.setProperty("--bg",            "#F5F4F0");
      root.style.setProperty("--bg-inverted",   "#0B0B0B");
      root.style.setProperty("--surface",       "#FFFFFF");
      root.style.setProperty("--border",        "rgba(0,0,0,0.09)");
      root.style.setProperty("--border-inv",    "rgba(255,255,255,0.08)");
      root.style.setProperty("--text",          "#0B0B0B");
      root.style.setProperty("--text-muted",    "rgba(11,11,11,0.45)");
      root.style.setProperty("--text-inv",      "#F5F4F0");
      root.style.setProperty("--text-inv-muted","rgba(245,244,240,0.50)");
      root.style.setProperty("--accent",        "#FFDE00");
    }

    // Persist preference
    try { localStorage.setItem("vc-theme", theme); } catch (_) {}
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}