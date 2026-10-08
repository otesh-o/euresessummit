import { useEffect, useState } from "react";
import { FaArrowRight, FaBars, FaTimes, FaWhatsapp } from "react-icons/fa";
import SummitSection from "./components/SummitSection";

import "./App.css";

const navItems = [
  { label: "Community", href: "#community" },
  { label: "Summit", href: "#events" },
  { label: "About", href: "#about" },
];

const heroCards = [
  {
    title: "",
    image: "/assets/axrev_home.jpg",
    accent: "",
  },
  {
    title: "Builders",
    image: "/assets/community.jpg",
    accent: "Collaborative projects",
  },
  {
    title: "Engineers",
    image: "/assets/speaker.jpg",
    accent: "Deep technical exchange",
  },
  {
    title: "Scientists",
    image: "/assets/session.jpg",
    accent: "Research-minded peers",
  },
  {
    title: "Creators",
    image: "/assets/keynote.jpg",
    accent: "Ideas worth shipping",
  },
  {
    title: "Founders",
    image: "/assets/networking.jpg",
    accent: "Strong community ties",
  },
  {
    title: "",
    image: "/assets/axrev_home2.jpg",
    accent: "",
  },
];

const featureItems = [
  {
    title: "Real Community",
    description:
      "Meet engineers, scientists, and technical creatives building together across disciplines.",
  },
  {
    title: "Events That Matter",
    description:
      "Join sessions, meetups, and conversations designed for curiosity, depth, and momentum.",
  },
  {
    title: "A Place To Grow",
    description:
      "Find peers, collaborators, and opportunities that help serious ideas move forward.",
  },
];

const joinUrl = "https://chat.whatsapp.com/G8GeWyKROokE7piDwaMlB0?mode=gi_t";
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [carouselProgress, setCarouselProgress] = useState(1);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const updateCarouselProgress = () => {
      const progress = Math.max(0, Math.min(1, 1 - window.scrollY / 420));
      setCarouselProgress(progress);
    };

    updateCarouselProgress();
    window.addEventListener("scroll", updateCarouselProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateCarouselProgress);
    };
  }, []);



  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="page-shell">
      <header className="site-header">
        <nav className="top-nav" aria-label="Primary">
          <div className="nav-brand">
            <img src="/logo.png" alt="Eureses Community Logo" className="nav-logo" />
            Eureses Community
          </div>

          <div className="nav-center">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <a
              href={joinUrl}
              target="_blank"
              rel="noreferrer"
              className="join-chip"
            >
              Join
            </a>

            <button
              type="button"
              className="menu-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>

        <div className={`mobile-panel${menuOpen ? " is-open" : ""}`}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="mobile-link"
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
          <a
            href={joinUrl}
            target="_blank"
            rel="noreferrer"
            className="mobile-join"
            onClick={closeMenu}
          >
            <FaWhatsapp />
            Join the Community
          </a>
        </div>
      </header>

      <main>
        <section className="hero-section" id="community">
          <div className="hero-copy">
            <h1 className="hero-title">
              The community for engineers, scientists, and technical creatives.
            </h1>
            <p className="hero-subtitle">
              The official community of Eureses Limited.
            </p>

            <div className="hero-actions">
              <a
                href={joinUrl}
                target="_blank"
                rel="noreferrer"
                className="button-join"
              >
                <FaWhatsapp />
                Join the Community
              </a>

              <a href="#about" className="button-secondary">
                Learn More
                <FaArrowRight />
              </a>
            </div>
          </div>

          <div
            className="card-stage"
            aria-label="Community highlights"
            style={{
              "--carousel-progress": carouselProgress,
            }}
          >
            {heroCards.map((card, index) => (
              <article
                key={`${card.title || "edge"}-${index}`}
                className={`hero-card card-${index + 1}`}
                style={{ backgroundImage: `url(${card.image})` }}
              >
                {card.title ? (
                  <div className="hero-card-overlay">
                    <span>{card.title}</span>
                    <small>{card.accent}</small>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="feature-strip">
            {featureItems.map((item) => (
              <article key={item.title} className="feature-item">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-statement">
            <p>
              The Eureses Community exists to close the gap between young
              Nigerians and the rest of the world in tech, engineering,
              science, and design. The knowledge, the exposure, the mindset —
              it is all here.
            </p>
          </div>
        </section>

        <SummitSection />

      </main>

      <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-top">
            <p className="footer-initiative">An initiative of Eureses Ltd.</p>
            <p className="footer-summary">
              Building a thoughtful community for engineers, scientists, and
              technical creatives across Nigeria.
            </p>
          </div>

          <div className="footer-grid">
            <div>
              <h3>Eureses Community</h3>
              <p>Engineers. Scientists. Technical creatives.</p>
            </div>

            <div>
              <h4>Explore</h4>
              <a href="#community">Community</a>
              <a href="#events">Events</a>
              <a href="#about">About</a>
            </div>

            <div>
              <h4>Connect</h4>
              <a href={joinUrl} target="_blank" rel="noreferrer">
                Join the Community
              </a>
              <a href="mailto:hello@eureses.com">hello@eureses.com</a>
              <span>Lagos, Nigeria</span>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Eureses Ltd. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
