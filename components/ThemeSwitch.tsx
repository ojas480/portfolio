"use client";

import { useEffect, useState } from "react";

export default function ThemeSwitch() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "light" || (!stored && !window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      localStorage.setItem("theme", "light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.remove("light");
    }
    window.dispatchEvent(new Event("themechange"));
  };

  // Prevent hydration mismatch by not rendering SVG until mounted
  if (!mounted) {
    return (
      <button
        className="fixed bottom-6 right-6 p-3 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--bg)] transition-transform shadow-lg z-50 backdrop-blur-md opacity-0"
        aria-label="Toggle theme"
      >
        <span className="w-5 h-5 block" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] hover:scale-110 active:scale-95 transition-all shadow-lg z-50 backdrop-blur-md flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      )}
    </button>
  );
}
