import NowPlaying from "@/components/NowPlaying";

export const revalidate = 30;

export default async function Home() {
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
            className="hover:text-[var(--text)]"
          >
            GitHub ↗
          </a>
          <a
            href="https://www.linkedin.com/in/ojaskalra/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text)]"
          >
            LinkedIn ↗
          </a>
          <a href="mailto:ojaskrishwork@gmail.com" className="hover:text-[var(--text)]">
            Email ↗
          </a>
          <a
            href="https://open.spotify.com/artist/3yzwkjP8ux7xvoAWRyCFuh"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text)]"
          >
            My Spotify ↗
          </a>
        </div>
      </header>

      {/* ── Education ── */}
      <section className="mb-10">
        <h2 className="section-label">Education</h2>
        {education.map((e, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text)]">{e.school}</p>
              <span className="text-xs text-[var(--text-dim)] font-mono shrink-0 ml-4">
                {e.date}
              </span>
            </div>
            <p className="text-xs text-[var(--text-dim)]">{e.degree} · GPA: {e.gpa}</p>
          </div>
        ))}
      </section>

      {/* ── Experience ── */}
      <section className="mb-10">
        <h2 className="section-label">Experience</h2>
        {experiences.map((e, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text)]">{e.company}</p>
              <span className="text-xs text-[var(--text-dim)] font-mono shrink-0 ml-4">
                {e.date}
              </span>
            </div>
            <p className="text-xs text-[var(--text-dim)]">{e.role}</p>
          </div>
        ))}
      </section>

      {/* ── Projects ── */}
      <section className="mb-12">
        <h2 className="section-label mb-4 border-none pb-0">Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <div key={i} className="p-4 sm:p-5 border border-[var(--border)] rounded-xl bg-transparent hover:bg-[var(--bg-card)] transition-colors h-full flex flex-col group">
              {p.image && (
                <div className="w-full h-40 sm:h-44 mb-4 overflow-hidden rounded-lg border border-[var(--border)] shrink-0 bg-[var(--bg-card)]">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-[var(--text)]">{p.title}</h3>
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                  </a>
                )}
              </div>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed opacity-80 flex-grow">
                {p.description}
              </p>
            </div>
          ))}
        </div>
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
                <p className="text-sm font-medium text-[var(--text)] leading-tight">
                  {r.title}
                </p>
                {r.link && (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-dim)] hover:text-[var(--text)] text-xs"
                  >
                    ↗
                  </a>
                )}
              </div>
              {r.venue && <p className="text-xs text-[var(--text-dim)] mb-0.5">{r.venue}</p>}
              <p className="text-xs text-[var(--text-dim)] leading-relaxed opacity-70">
                {r.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Competitions & Awards ── */}
      <section className="mb-10">
        <h2 className="section-label">Competitions &amp; Awards</h2>
        {awards.map((a, i) => (
          <div key={i} className="card flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <div className="sm:w-44 shrink-0 pt-0.5">
              <p className="text-sm font-medium text-[var(--text)]">{a.title}</p>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed opacity-70 flex-1">
              {a.description}
            </p>
          </div>
        ))}
      </section>

      {/* ── Relevant Courses ── */}
      <section className="mb-10">
        <h2 className="section-label">Relevant Courses</h2>
        <div className="flex flex-wrap gap-2 mt-4">
          {courses.map((course, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs font-mono border border-[var(--border)] rounded-full text-[var(--text-dim)]"
            >
              {course}
            </span>
          ))}
        </div>
      </section>

      {/* ── My Music ── */}
      <section className="mb-10">
        <h2 className="section-label">My Music</h2>
        <div className="mt-4">
          <iframe
            style={{ borderRadius: "12px" }}
            src="https://open.spotify.com/embed/artist/3yzwkjP8ux7xvoAWRyCFuh?utm_source=generator&theme=0"
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen={false}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
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

const education = [
  {
    school: "Georgia Institute of Technology",
    degree: "M.S. Computer Science",
    gpa: "4.0/4.0",
    date: "Jan 2026–Present",
  },
  {
    school: "Georgia Institute of Technology",
    degree: "B.S. Computer Science",
    gpa: "3.8/4.0",
    date: "Aug 2022–Dec 2025",
  },
];

const experiences = [
  {
    role: "Quantitative Trader Intern",
    company: "IMC Trading",
    date: "Jun–Aug 2025",
    description:
      "Summer 2025 quantitative trading internship at one of the world's leading market makers.",
  },
  {
    role: "Researcher — Machine Learning for Financial Markets Lab",
    company: "Georgia Institute of Technology",
    date: "Jan 2024–Now",
    description:
      "Research under Dr. Eunhye on ML applications in quantitative finance.",
  },
  {
    role: "Undergraduate TA & Grader for Combinatorics",
    company: "Georgia Institute of Technology",
    date: "Sep 2023–Now",
    description: "",
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
      "Honorable Mention at MCM 2024.",
    link: "/mcm-paper.pdf",
    image: "/wimbledon.png",
  },
  {
    title: "Faulhaber's Formula Derivation",
    description:
      "Derivation of Faulhaber's Formula",
    link: "/OjasKalraDRP.pdf",
    image: "/faulhaber.png",
  },
  {
    title: "Customer Insights Agentic AI",
    description:
      "Full-stack agentic AI for product sentiment",
    link: "https://customer-insights-agentic-ai-nfqo.vercel.app/",
    image: "/customer_insights.png",
  },
  {
    title: "AI Music Detection",
    description:
      "Detecting AI music - support real artists <3",
    link: "https://github.com/ojas480/AIMusicDetection",
    image: "/aimusic.jpg",
  },
  {
    title: "Connect 4 vs AI",
    description:
      "Chess.com-style Connect 4 with minimax AI, eval bar, move analysis, and post-game review",
    link: "https://ojas480.github.io/Connect4AI/",
    image: "/connect4ai.png",
  },
];

type ResearchItem = { title: string; venue?: string; date: string; description: string; link: string; };
const research: ResearchItem[] = [
  {
    title: "Machine Learning for Financial Markets",
    date: "2024–Now",
    description:
      "Currently doing research on AI reproducibility",
    link: "",
  },
];

const awards = [
  {
    title: "2× AIME Qualifier",
    description:
      "Discovered math comps in 10th grade and earned two AIME qualifications in a year of self-study",
  },
  {
    title: "1st Place — GT Trading Competition",
    description:
      "Won first place in the Georgia Tech trading competition, Mar 2026.",
  },
  {
    title: "Top 1% — IMC Prosperity",
    description:
      "Finished in the top 1% out of 10,000+ teams in the world's biggest trading competition",
  },
];

const courses = [
  "CS 8803 Sequence Prediction*",
  "CS 7632 Game AI*",
  "CS 6476 Computer Vision*",
  "CS 4641 Machine Learning",
  "CS 4540 Advanced Algs",
  "CS 4510 Automata and Complexity",
  "Math 4150 Number Theory",
  "Math 3406 Second Linear Algebra",
  "Math 3236 Statistical Theory",
  "Math 3235 Probability Theory",
];
