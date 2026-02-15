"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Research", href: "#research" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "py-3 backdrop-blur-xl bg-[rgba(10,10,15,0.8)] border-b border-[rgba(255,255,255,0.06)]"
          : "py-5 bg-transparent"
        }`}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[var(--text-primary)] hover:text-white transition-colors"
        >
          <span className="gradient-text font-bold">OK</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors duration-200 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--accent-blue)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#contact"
            className="text-sm px-4 py-2 rounded-full bg-[rgba(79,143,255,0.1)] text-[var(--accent-blue)] border border-[rgba(79,143,255,0.2)] hover:bg-[rgba(79,143,255,0.2)] transition-all duration-200"
          >
            Contact
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-[2px] bg-[var(--text-secondary)] transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
          />
          <span
            className={`block w-5 h-[2px] bg-[var(--text-secondary)] transition-all duration-300 ${mobileOpen ? "opacity-0" : ""
              }`}
          />
          <span
            className={`block w-5 h-[2px] bg-[var(--text-secondary)] transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 mx-4 p-4 rounded-2xl backdrop-blur-xl bg-[rgba(10,10,15,0.95)] border border-[rgba(255,255,255,0.06)]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className="block py-3 text-sm text-[var(--accent-blue)]"
          >
            Contact
          </a>
        </div>
      )}
    </nav>
  );
}
