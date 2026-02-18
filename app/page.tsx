import NowPlaying from "@/components/NowPlaying";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
      {/* ── Header ── */}
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          Ojas Kalra
        </h1>
        <NowPlaying />
        <div className="flex items-center gap-4 text-xs text-[var(--text-dim)] mt-4">
          <a
            href="https://github.com/ojas480"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            GitHub ↗
          </a>
          <a
            href="https://www.linkedin.com/in/ojaskalra/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            LinkedIn ↗
          </a>
          <a href="mailto:ojaskrishwork@gmail.com" className="hover:text-white">
            Email ↗
          </a>
          <a
            href="https://open.spotify.com/artist/3yzwkjP8ux7xvoAWRyCFuh"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            Spotify ↗
          </a>
        </div>
      </header>

      {/* ── Experience ── */}
      <section className="mb-10">
        <h2 className="section-label">Experience</h2>
        {experiences.map((e, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">{e.company}</p>
              <span className="text-xs text-[var(--text-dim)] font-mono shrink-0 ml-4">
                {e.date}
              </span>
            </div>
            <p className="text-xs text-[var(--text-dim)]">{e.role}</p>
          </div>
        ))}
      </section>

      {/* ── Projects ── */}
      <section className="mb-10">
        <h2 className="section-label">Projects</h2>
        {projects.map((p, i) => (
          <div key={i} className="card flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <div className="sm:w-44 shrink-0 pt-0.5 flex items-center gap-2">
              <p className="text-sm font-medium text-white">{p.title}</p>
              {p.link && (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[var(--text-dim)] hover:text-white text-xs">↗</a>
              )}
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed opacity-70 flex-1">
              {p.description}
            </p>
          </div>
        ))}
      </section>

      {/* ── Research ── */}
      <section className="mb-10">
        <h2 className="section-label">Research</h2>
        {research.map((r, i) => (
          <div key={i} className="card flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
            <span className="text-xs text-[var(--text-dim)] sm:w-36 shrink-0 pt-0.5 font-mono">
              {r.date}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white leading-tight">
                  {r.title}
                </p>
                {r.link && (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-dim)] hover:text-white text-xs"
                  >
                    ↗
                  </a>
                )}
              </div>
              <p className="text-xs text-[var(--text-dim)] mb-0.5">{r.venue}</p>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed opacity-70">
                {r.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Interests ── */}
      <section className="mb-10">
        <h2 className="section-label">Interests</h2>
        <p className="text-sm text-[var(--text-dim)] py-3">
          🏃 Marathon Runner &nbsp;·&nbsp; 🎵 Music Producer &nbsp;·&nbsp; 🎸 Guitarist &nbsp;·&nbsp; ⚽ Soccer
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-6 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-dim)] opacity-50">
          © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

/* ── DATA ── */

const experiences = [
  {
    role: "Quantitative Trader Intern",
    company: "IMC Trading",
    date: "Jun–Aug 2025",
    description:
      "Summer 2025 quantitative trading internship at one of the world's leading market makers.",
  },
  {
    role: "Undergraduate Researcher",
    company: "Georgia Institute of Technology",
    date: "Jan 2024–Now",
    description:
      "ML for Financial Markets VIP Group. Research under Dr. Eunhye on ML applications in quantitative finance.",
  },
  {
    role: "Undergraduate TA",
    company: "Georgia Institute of Technology",
    date: "Sep 2023–Now",
    description:
      "Grader for Combinatorics (Math 3012) and TA for Linear Algebra (Math 1554).",
  },
  {
    role: "Investment Banking Intern",
    company: "Brean Capital, LLC",
    date: "Jun–Aug 2023",
    description:
      "Summer analyst in Manhattan. Deal execution and financial modeling.",
  },
];

const projects = [
  {
    title: "Analyzing Momentum at Wimbledon",
    description:
      "Data-driven exploration of swings of competitive advantage in tennis. Honorable Mention at MCM 2024.",
    link: "/mcm-paper.pdf",
  },
  {
    title: "Faulhaber's Formula Derivation",
    description:
      "A derivation and exploration of Faulhaber's formula for sums of powers.",
    link: "/OjasKalraDRP.pdf",
  },
  {
    title: "ML Trading System",
    description:
      "Quantitative trading system using ML to predict short-term price movements. Backtested on 5+ years with Sharpe > 1.5.",
  },
  {
    title: "Neural Network From Scratch",
    description:
      "Fully-connected NN library with backprop, multiple optimizers, and regularization.",
  },
  {
    title: "Real-time Chat App",
    description:
      "Full-stack messaging platform with WebSockets, auth, and message persistence.",
  },
  {
    title: "Portfolio Website",
    description:
      "This site. Next.js 16, React 19, Tailwind CSS v4.",
  },
];

const research = [
  {
    title: "ML for Financial Markets",
    venue: "Georgia Tech — VIP Research Group",
    date: "2024–Now",
    description:
      "Researching ML-driven strategies for quantitative finance applications in the VIP program.",
    link: "",
  },
];
