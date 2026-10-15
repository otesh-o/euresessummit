import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaPlus, FaUser } from "react-icons/fa";

// Doors open 9:00 AM WAT (UTC+1).
const SUMMIT_DATE = "2026-11-21T09:00:00+01:00";

const keyFacts = [
  { label: "Date", value: "21 November 2026", note: "Doors open 9:00 AM WAT" },
  { label: "Venue", value: "Florence Bamitale Owolabi Civic Center", note: "Ikole Ekiti" },
];

const stats = [
  { value: 2000, suffix: "+", label: "Seats in 2026" },
  { value: 400, suffix: "+", label: "Attendees in 2025" },
  { value: 3, label: "Universities" },
];

const pillars = [
  {
    title: "Three talks",
    description:
      "Government's role in national innovation, reclaiming the innovative spirit, and technical research and the next wave of innovation. Thirty minutes each, with time for questions.",
  },
  {
    title: "The panel",
    description:
      "Five people on stage, three of them taken from the audience. Each gets a real one-on-one conversation about what they are building and what has stopped them.",
  },
  {
    title: "Guest of Honour",
    description:
      "The Vice Chancellor speaks on the university's role in supporting innovation and ambition among its students.",
  },
  {
    title: "Networking",
    description:
      "Doors open at 9:00 AM for informal time to meet peers from across campuses, take pictures and settle in before the programme starts.",
  },
];

const agenda = [
  {
    time: "9:00 AM",
    title: "Networking",
    detail: "Doors open. Informal time for pictures, greetings and meeting people before the programme begins.",
    duration: "1 hr",
    kind: "soft",
  },
  {
    time: "10:00 AM",
    title: "Official start",
    detail: "A short opening from the convener on what the day is about, what to expect and why it matters.",
    duration: "10 min",
  },
  {
    time: "10:10 AM",
    title: "Guest of Honour remarks",
    detail: "The Vice Chancellor on the university's role in supporting innovation and ambition among its students.",
    duration: "10 min",
  },
  {
    time: "10:20 AM",
    title: "Government's role in national innovation",
    detail: "What is already being done to support innovators: real policy, real funding and government effort. Thirty-minute talk, then five minutes of questions.",
    duration: "35 min",
    tag: "Talk",
  },
  {
    time: "10:50 AM",
    title: "Reclaiming the innovative spirit",
    detail: "Why Nigeria's earlier moments of global achievement did not carry forward, and the case for closing that gap now. Thirty-minute talk, then five minutes of questions.",
    duration: "35 min",
    tag: "Talk",
  },
  {
    time: "11:30 AM",
    title: "Technical research, support and the next wave of innovation",
    detail: "Where research support falls short, how it becomes real technology companies, and where AI fits in. Thirty-minute talk, then five minutes of questions.",
    duration: "35 min",
    tag: "Talk",
  },
  {
    time: "12:05 PM",
    title: "Nexr",
    detail: "The convener speaks on Nexr just before the break.",
    duration: "10 min",
  },
  {
    time: "12:15 PM",
    title: "Break",
    detail: "A short reset before the panel.",
    duration: "5 min",
    kind: "soft",
  },
  {
    time: "12:20 PM",
    title: "Panel discussion",
    detail: "The convener, one panelist and three attendees from the audience. Each gets a real conversation about what they are working on or want to build, what has stopped them, and a direct response.",
    duration: "30 min",
    tag: "Panel",
  },
  {
    time: "12:50 PM",
    title: "Closing",
    detail: "The convener closes the day, pointing attendees to the next step they should take, tied to what came up in the panel.",
    duration: "10 min",
  },
];

// Placeholder speakers. Replace the name (and photo) when the lineup is confirmed.
const speakers = [
  { name: "Speaker Name", role: "Guest of Honour", org: "Vice Chancellor", topic: "Remarks on the university's role in innovation" },
  { name: "Speaker Name", role: "Government representative", org: "", topic: "Government's role in national innovation" },
  { name: "Speaker Name", role: "Speaker", org: "", topic: "Reclaiming the innovative spirit" },
  { name: "Speaker Name", role: "Founder or technical lead", org: "", topic: "Technical research, support and the next wave of innovation" },
];

const faqs = [
  {
    q: "Is attendance free?",
    a: "Yes. Admission is free for students, lecturers, and invited guests. Register online to receive your personal admission pass with a QR code for check-in.",
  },
  {
    q: "Is there transport from the FUOYE Oye campus?",
    a: "Yes. Chartered shuttle buses run from the FUOYE Oye main campus to the Florence Bamitale Owolabi Civic Center in Ikole in the morning and return after the event. Select the shuttle option when you register so we can plan capacity.",
  },
  {
    q: "Are first-years and non-engineers welcome?",
    a: "Yes. The programme is designed for anyone interested in technology, whether you are a first-year student, a designer, a researcher, a content creator, or an aspiring founder.",
  },
  {
    q: "How does the panel work?",
    a: "The panel has five people: the convener, one panelist and three attendees taken from the audience. Each of the three gets a real one-on-one conversation on stage about what they are working on or want to build and what has stopped them, followed by a direct response. When you register, tell us what you are building so we know who is in the room.",
  },
];

function useCountdown(date) {
  const calculate = useCallback(() => {
    const remaining = Math.max(0, new Date(date).getTime() - Date.now());
    return [
      Math.floor(remaining / 86400000),
      Math.floor((remaining % 86400000) / 3600000),
      Math.floor((remaining % 3600000) / 60000),
      Math.floor((remaining % 60000) / 1000),
    ].map((value) => String(value).padStart(2, "0"));
  }, [date]);

  const [values, setValues] = useState(calculate);
  useEffect(() => {
    const timer = window.setInterval(() => setValues(calculate()), 1000);
    return () => window.clearInterval(timer);
  }, [calculate]);
  return values;
}


const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Flags the element once it scrolls into view, which triggers the CSS reveal.
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ as = "div", delay = 0, className = "", children, ...rest }) {
  const Tag = as;
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`summit-reveal${inView ? " is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function CountUp({ value, prefix = "", suffix = "", duration = 1600 }) {
  const [ref, inView] = useInView(0.5);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

function SectionLabel({ index, children, tone = "dark" }) {
  return (
    <Reveal
      className={`flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.16em] ${
        tone === "dark" ? "text-[#8e8e95]" : "text-[#6a6a62]"
      }`}
    >
      <span className="font-mono">{index}</span>
      <span
        className={`summit-label-line h-px w-8 ${tone === "dark" ? "bg-[#3ddc84]" : "bg-[#157a45]"}`}
      />
      <span>{children}</span>
    </Reveal>
  );
}

function ArrowButton({ href, children, variant = "solid" }) {
  const base =
    "group inline-flex h-12 flex-none items-center gap-2 rounded-full px-7 text-sm no-underline transition-all duration-300";
  const styles =
    variant === "solid"
      ? "summit-btn-solid bg-white font-semibold text-black hover:bg-[#e8e8ed] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(255,255,255,0.16)]"
      : "border border-white/[0.16] font-medium text-white hover:border-white/50 hover:bg-white/[0.06] hover:-translate-y-px";
  return (
    <a href={href} className={`${base} ${styles}`}>
      {children}
      {variant === "solid" && (
        <FaArrowRight className="text-[11px] transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </a>
  );
}

export default function SummitSection() {
  const countdown = useCountdown(SUMMIT_DATE);
  const [openFaq, setOpenFaq] = useState(0);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const railRef = useRef(null);

  const scrollRail = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.8, 360), behavior: "smooth" });
  };

  return (
    <div id="events" className="summit w-full [font-family:'DM_Sans',sans-serif]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#030a22] text-white border-t border-white/[0.08]">
        <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 max-w-[720px]">
            <Reveal
              as="p"
              className="m-0 mb-6 text-[12px] font-medium uppercase tracking-[0.18em] text-[#8e8e95]"
            >
              Eureses Creative Summit 2026 <span className="mx-2 text-white/30">/</span> Second edition
            </Reveal>

            <h2 className="m-0 mb-6 text-[40px] sm:text-[56px] lg:text-[68px] font-medium leading-[1.02] tracking-[-0.045em]">
              <Reveal as="span" delay={80} className="summit-line-mask">
                <span className="summit-line">The Next Wave of</span>
              </Reveal>
              <Reveal as="span" delay={200} className="summit-line-mask">
                <span className="summit-line summit-shimmer">Global Innovation</span>
              </Reveal>
            </h2>

            <Reveal
              as="p"
              delay={340}
              className="m-0 mb-10 max-w-[560px] text-base sm:text-lg leading-relaxed text-[#a1a1a8]"
            >
              A one-day summit bringing together students, lecturers, engineers, and founders from
              FUOYE, ABUAD, and EKSU to look closely at how important technologies are built,
              funded, and scaled.
            </Reveal>

            <Reveal delay={460} className="flex flex-wrap items-center gap-3 mb-12">
              <ArrowButton href="/register">Register for free</ArrowButton>
              <ArrowButton href="#programme" variant="ghost">
                View programme
              </ArrowButton>
            </Reveal>

            <Reveal delay={580} className="flex items-center gap-5" aria-label="Time until doors open">
              <span className="text-[12px] uppercase tracking-[0.14em] text-[#8e8e95]">
                Doors open in
              </span>
              <div className="flex items-baseline gap-4 font-mono text-white">
                {countdown.map((value, i) => (
                  <span key={i} className="flex items-baseline gap-1">
                    <span className="summit-digit-window text-xl sm:text-2xl tabular-nums">
                      <span key={value} className="summit-digit">
                        {value}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#8e8e95]">{["d", "h", "m", "s"][i]}</span>
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="relative lg:col-span-5">
            {/* Earth in the bottom-right corner, its top curve passing behind the numbers */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[84%] top-[calc(50%+150px)] aspect-square sm:top-[calc(50%+250px)] lg:top-[calc(50%+295px)] w-[340px] -translate-x-1/2 -translate-y-1/2 sm:w-[560px] lg:w-[720px]"
            >
              <div className="summit-earth h-full w-full overflow-hidden rounded-full opacity-45 blur-[3px]">
                <img
                  src="/assets/summit-earth.webp"
                  alt=""
                  className="absolute max-w-none"
                  style={{ width: "214.8%", left: "-57.26%", top: "-3.87%" }}
                />
              </div>
            </div>

          <dl className="relative z-10 m-0 grid grid-cols-3 gap-x-4 sm:gap-x-8">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={300 + i * 110} className="summit-stat pt-4">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="m-0 text-[26px] sm:text-4xl lg:text-[40px] font-medium tracking-[-0.04em] leading-none">
                  <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </dd>
                <dd className="m-0 mt-2 text-[12px] sm:text-[13px] leading-snug text-[#c3c9d8]">{stat.label}</dd>
              </Reveal>
            ))}
          </dl>
          </div>
          </div>

          <dl className="summit-facts m-0 mt-10 sm:mt-14 grid grid-cols-2 lg:max-w-[640px]">
            {keyFacts.map((fact, i) => (
              <Reveal
                key={fact.label}
                delay={680 + i * 90}
                className={`pt-4 pb-1 pr-4 sm:pt-6 sm:pr-6 ${i > 0 ? "lg:pl-6 lg:border-l lg:border-white/[0.12]" : ""} ${
                  i % 2 === 1 ? "pl-4 border-l border-white/[0.12] sm:pl-6 lg:pl-6" : ""
                } ${i > 1 ? "mt-3 lg:mt-0" : ""}`}
              >
                <dt className="mb-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.14em] text-[#8e8e95]">
                  {fact.label}
                </dt>
                <dd className="m-0 text-[14px] sm:text-base font-medium leading-snug text-white">{fact.value}</dd>
                <dd className="m-0 mt-0.5 text-[12px] sm:text-[13px] leading-snug text-[#8e8e95]">{fact.note}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Speakers */}
      <section className="bg-[#030a22] text-white border-t border-white/[0.08]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <SectionLabel index="01">Speakers</SectionLabel>
          <div className="mt-6 mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <Reveal
              as="h3"
              delay={100}
              className="m-0 max-w-[620px] text-3xl sm:text-[40px] font-medium leading-[1.1] tracking-[-0.035em]"
            >
              Voices shaping the conversation.
            </Reveal>
            <div className="flex items-center justify-between md:justify-end gap-5">
              <p className="m-0 text-sm text-[#8e8e95]">Lineup to be announced.</p>
              <div className="flex gap-2">
                {[
                  { dir: -1, label: "Previous speakers", icon: <FaArrowLeft className="text-[11px]" /> },
                  { dir: 1, label: "Next speakers", icon: <FaArrowRight className="text-[11px]" /> },
                ].map(({ dir, label, icon }) => (
                  <button
                    key={dir}
                    type="button"
                    aria-label={label}
                    onClick={() => scrollRail(dir)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.16] bg-transparent text-white transition-colors duration-200 hover:border-white/50 hover:bg-white/[0.06] cursor-pointer"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ul
            ref={railRef}
            className="m-0 p-0 list-none flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-8 pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {speakers.map((speaker, i) => (
              <li
                key={i}
                className="summit-speaker group snap-start flex-none w-[76%] sm:w-[320px] rounded-2xl border border-white/[0.1] bg-white/[0.03] p-5 transition-colors duration-300 hover:border-white/[0.25]"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white/[0.04]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaUser className="text-5xl text-white/[0.12] transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <span className="absolute left-3 top-3 rounded-full border border-white/[0.14] bg-[#030a22]/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#a1a1a8]">
                    To be announced
                  </span>
                </div>
                <h4 className="m-0 mt-4 text-lg font-medium tracking-[-0.02em]">{speaker.name}</h4>
                <p className="m-0 mt-1 text-sm text-[#a1a1a8]">
                  {speaker.role}
                  {speaker.org ? `, ${speaker.org}` : ""}
                </p>
                <p className="m-0 mt-3 text-[13px] leading-relaxed text-[#8e8e95]">{speaker.topic}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Overview & numbers */}
      <section className="bg-[#030a22] text-white border-t border-white/[0.08]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <SectionLabel index="02">About the summit</SectionLabel>
            <Reveal
              as="h3"
              delay={100}
              className="m-0 mt-6 text-3xl sm:text-[40px] font-medium leading-[1.1] tracking-[-0.035em]"
            >
              Built for depth rather than spectacle.
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal as="p" delay={160} className="m-0 text-base sm:text-lg leading-relaxed text-[#a1a1a8]">
              The Eureses Creative Summit is run by Eureses Community, a branch of Eureses built to
              give back to Nigerians. Now in its second edition, it asks students, engineers,
              designers and other creatives to move from adopting what already exists elsewhere
              toward originating what does not exist yet.
            </Reveal>
          </div>
        </div>
      </section>

      {/* Programme */}
      <section id="programme" className="bg-[#f4f3ec] text-[#0a0a0a] scroll-mt-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <SectionLabel index="03" tone="light">
            Programme
          </SectionLabel>
          <Reveal
            as="h3"
            delay={100}
            className="m-0 mt-6 mb-14 max-w-[720px] text-3xl sm:text-[40px] font-medium leading-[1.1] tracking-[-0.035em]"
          >
            What the day looks like.
          </Reveal>

          <ol className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((pillar, i) => (
              <Reveal
                as="li"
                key={pillar.title}
                delay={i * 110}
                className="summit-pillar rounded-[24px] bg-white p-7"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef0e8] font-mono text-[12px] text-[#157a45]">
                  0{i + 1}
                </span>
                <h4 className="m-0 mt-6 mb-3 text-xl font-medium tracking-[-0.02em]">{pillar.title}</h4>
                <p className="m-0 text-[15px] leading-relaxed text-[#55554e]">{pillar.description}</p>
              </Reveal>
            ))}
          </ol>

          <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-x-10">
            <Reveal className="lg:col-span-4">
              <h4 className="m-0 text-2xl font-medium tracking-[-0.025em]">Schedule</h4>
              <p className="m-0 mt-3 text-[15px] leading-relaxed text-[#55554e]">
                Saturday, 21 November 2026, from 9:00 AM WAT. The programme closes at about 1:00 PM.
                Times may be adjusted; registered attendees will receive the final schedule by email.
              </p>
              <button
                type="button"
                onClick={() => setScheduleOpen((open) => !open)}
                aria-expanded={scheduleOpen}
                aria-controls="summit-schedule"
                className="group mt-5 inline-flex items-center gap-3 border-0 bg-transparent p-0 text-sm font-medium text-[#0a0a0a] cursor-pointer [font-family:inherit]"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                    scheduleOpen
                      ? "rotate-45 border-[#0a0a0a] bg-[#0a0a0a] text-white"
                      : "border-black/[0.2] text-[#0a0a0a] group-hover:border-black/50"
                  }`}
                >
                  <FaPlus className="text-[10px]" />
                </span>
                <span className="transition-colors duration-200 group-hover:text-[#157a45]">
                  {scheduleOpen ? "Hide schedule" : "Show schedule"}
                </span>
              </button>
            </Reveal>
            <div
              id="summit-schedule"
              className={`summit-faq-panel mt-8 lg:mt-0 lg:col-span-8${scheduleOpen ? " is-open" : ""}`}
            >
              <div className="overflow-hidden">
                <ol className="m-0 p-0 list-none space-y-3">
                  {agenda.map((item) => (
                    <li
                      key={item.time}
                      className={`flex items-start gap-4 sm:gap-6 rounded-[20px] p-5 sm:p-6 ${
                        item.kind === "soft" ? "bg-[#eceae0]" : "bg-white"
                      }`}
                    >
                      <div className="w-[84px] sm:w-[100px] flex-none">
                        <time className="block font-mono text-[13px] font-medium text-[#157a45] tabular-nums">
                          {item.time}
                        </time>
                        <span className="mt-1 block text-[12px] text-[#8a8f9c]">{item.duration}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        {item.tag && (
                          <span className="mb-2 inline-block rounded-full bg-[#eef0e8] px-2.5 py-0.5 text-[11px] font-medium text-[#157a45]">
                            {item.tag}
                          </span>
                        )}
                        <h5 className="m-0 text-[17px] font-medium leading-snug tracking-[-0.015em]">
                          {item.title}
                        </h5>
                        <p className="m-0 mt-1.5 text-sm leading-relaxed text-[#55554e]">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white text-[#0a0a0a]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <SectionLabel index="04" tone="light">
              FAQ
            </SectionLabel>
            <Reveal
              as="h3"
              delay={100}
              className="m-0 mt-6 text-3xl sm:text-[40px] font-medium leading-[1.1] tracking-[-0.035em]"
            >
              Common questions
            </Reveal>
            <Reveal as="p" delay={160} className="m-0 mt-4 text-[15px] leading-relaxed text-[#55554e]">
              Anything else? Email{" "}
              <a href="mailto:hello@eureses.com" className="text-[#0a0a0a] underline underline-offset-4">
                hello@eureses.com
              </a>
              .
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:col-start-6 border-t border-black/[0.12]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              const panelId = `summit-faq-${index}`;
              return (
                <Reveal key={faq.q} delay={index * 80} className="border-b border-black/[0.12]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="group w-full flex items-center justify-between gap-6 py-6 bg-transparent border-0 px-0 text-left cursor-pointer text-[#0a0a0a] [font-family:inherit]"
                  >
                    <span className="text-base sm:text-lg font-medium tracking-[-0.015em] transition-colors duration-200 group-hover:text-[#157a45]">
                      {faq.q}
                    </span>
                    <span
                      className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? "rotate-45 bg-[#0a0a0a] border-[#0a0a0a] text-white"
                          : "border-black/[0.12] text-[#6a6a62] group-hover:border-black/40"
                      }`}
                    >
                      <FaPlus className="text-[10px]" />
                    </span>
                  </button>
                  <div id={panelId} className={`summit-faq-panel${isOpen ? " is-open" : ""}`}>
                    <div className="overflow-hidden">
                      <p className="m-0 pb-6 pr-10 text-[15px] leading-relaxed text-[#55554e]">{faq.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="relative overflow-hidden bg-[#030a22] text-white border-t border-white/[0.08]">
        <div className="summit-cta-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="max-w-[640px]">
            <Reveal as="h3" className="m-0 text-3xl sm:text-5xl font-medium leading-[1.05] tracking-[-0.04em]">
              Reserve your place at the 2026 summit.
            </Reveal>
            <Reveal as="p" delay={120} className="m-0 mt-5 text-base sm:text-lg leading-relaxed text-[#a1a1a8]">
              Admission is free, but seats are limited to 2,000. Once you register, your
              admission pass is sent to you by email.
            </Reveal>
          </div>
          <Reveal delay={240} className="self-start lg:self-auto">
            <ArrowButton href="/register">Register for free</ArrowButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
