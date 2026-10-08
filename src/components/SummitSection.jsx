import { useCallback, useEffect, useRef, useState } from "react";
import {
   FaArrowLeft,
   FaArrowRight,
   FaCalendarAlt,
   FaClock,
   FaLaptop,
   FaMapMarkerAlt,
   FaMicrophone,
   FaPeopleArrows,
   FaQuestion,
   FaUser,
} from "react-icons/fa";

const SUMMIT_DATE = "2026-11-15T11:00:00Z";
const speakers = [];
const audiences = [
   "Developers",
   "Designers",
   "Tech Creatives",
   "Builders",
   "Innovators",
];
const expectations = [
   {
      title: "Talks & Keynotes",
      description: "Fresh ideas from industry leaders and rising voices.",
      Icon: FaMicrophone,
      image: "/assets/speaker.jpg",
   },
   {
      title: "Hands-on Sessions",
      description: "Build, create and learn by doing.",
      Icon: FaLaptop,
      image: "/assets/keynote.jpg",
   },
   {
      title: "Innovation",
      description:
         "Discover the latest trends and technologies shaping the future.",
      Icon: FaArrowRight,
      image: "/assets/innovation.jpg",
   },
   {
      title: "Networking",
      description:
         "Connect with people to share your idea with and people who have the same goal as you.",
      Icon: FaPeopleArrows,
      image: "/assets/networking.jpg",
   },
];
const supporters = [
   "TechLogo",
   "NextGen",
   "InnovateCo",
   "BuildLab",
   "GlobalTech",
];


const controlReset = "appearance-none border-0 bg-transparent font-[inherit]";
const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#111] focus-visible:outline-offset-2";
const fade = "transition-[color,background-color,opacity,transform,border-color,box-shadow] duration-[180ms] ease-in-out motion-reduce:transition-none";
const smooth = "transition-all duration-300 ease-in-out motion-reduce:transition-none";
const iconNudge = "transition-transform duration-300 ease-in-out motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:scale-110";
const arrowNudge = `${fade} group-hover:translate-x-0.5`;
const tick = "animate-[ec-tick_.22s_ease-out_both] motion-reduce:animate-none";
const eyebrow = "m-0 text-[11px] font-bold uppercase tracking-[.17em] text-[#514e49]";
const chipBase = `border border-[#dedbd3] bg-white/[.12] rounded-full text-[12px] text-[#222] whitespace-nowrap ${controlReset} ${focusRing}`;
const chip = `${chipBase} px-4 py-2 cursor-default ${smooth} hover:bg-white/[.6] hover:border-[#c9c3b7] hover:text-[#111]`;
const chipButton = `${chipBase} w-9 h-9 p-0 flex-none cursor-pointer select-none ${fade} enabled:hover:bg-white/[.85] enabled:hover:border-[#b3ada1] enabled:hover:-translate-y-px enabled:active:translate-y-0 enabled:active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed`;
const ctaBase = `group inline-flex justify-center items-center no-underline rounded-full !bg-black text-white font-bold shadow-[0_9px_20px_rgba(20,18,15,.12)] cursor-pointer select-none hover:!bg-black hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(20,18,15,.18)] active:translate-y-0 active:scale-[.97] active:shadow-[0_5px_12px_rgba(20,18,15,.16)] motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-[0_9px_20px_rgba(20,18,15,.12)] ${controlReset} ${focusRing} ${fade}`;
const cta = `${ctaBase} gap-[11px] px-[23px] py-[13px] text-[13px]`;

// Four cards should span the speaker rail exactly at full width instead of
// overflowing it by a few pixels. `48px` is the three gap-4 (1rem) gutters
// between them, so (100% - 48px) / 4 lands each card on the rail's share.
// The min-width keeps the rail scrollable on phones, where the percentage basis
// alone would squeeze four cards into a single screen width.
const speakerCardWidth = "flex-[0_0_calc((100%_-_48px)/4)] min-w-[190px]";

function useCountdown(date) {
   const calculate = useCallback(() => {
      if (!date) return ["00", "00", "00", "00"];
      const timestamp = new Date(date).getTime();
      if (!Number.isFinite(timestamp)) return ["00", "00", "00", "00"];
      const remaining = Math.max(0, timestamp - Date.now());
      return [
         Math.floor(remaining / 86400000),
         Math.floor((remaining % 86400000) / 3600000),
         Math.floor((remaining % 3600000) / 60000),
         Math.floor((remaining % 60000) / 1000),
      ].map((value) => String(value).padStart(2, "0"));
   }, [date]);

   const [values, setValues] = useState(calculate);
   useEffect(() => {
      if (!date) return undefined;
      const timer = window.setInterval(() => setValues(calculate()), 1000);
      return () => window.clearInterval(timer);
   }, [date, calculate]);
   return values;
}

// Tracks whether the speaker rail can scroll at all and which end we are at, so
// the arrows can disable themselves instead of firing no-op clicks.
function useCarouselEdges(track) {
   const [edges, setEdges] = useState({
      scrollable: false,
      atStart: true,
      atEnd: true,
   });

   useEffect(() => {
      const element = track.current;
      if (!element) return undefined;

      const update = () => {
         const overflow = element.scrollWidth - element.clientWidth;
         const scrollable = overflow > 1;
         setEdges({
            scrollable,
            atStart: !scrollable || element.scrollLeft <= 1,
            atEnd: !scrollable || element.scrollLeft >= overflow - 1,
         });
      };

      update();
      element.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);

      // Card count changes (or a late-loading photo) alter the rail width.
      let observer;
      if ("ResizeObserver" in window) {
         observer = new ResizeObserver(update);
         observer.observe(element);
         for (const child of element.children) observer.observe(child);
      }

      return () => {
         element.removeEventListener("scroll", update);
         window.removeEventListener("resize", update);
         observer?.disconnect();
      };
   }, [track]);

   return edges;
}

function FadeIn({ children }) {
   const element = useRef(null);
   const [visible, setVisible] = useState(
      () =>
         typeof window !== "undefined" &&
         window.matchMedia("(prefers-reduced-motion: reduce)").matches,
   );
   useEffect(() => {
      if (visible || !element.current || !("IntersectionObserver" in window)) {
         setVisible(true);
         return undefined;
      }
      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setVisible(true);
               observer.disconnect();
            }
         },
         { threshold: 0.12 },
      );
      observer.observe(element.current);
      return () => observer.disconnect();
   }, [visible]);
   return (
      <div
         ref={element}
         className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[14px]"
            }`}
      >
         {children}
      </div>
   );
}

function SpeakerCard({ speaker }) {
   return (
      <article
         className={`group flex flex-col ${speakerCardWidth} min-h-[260px] p-3.5 rounded-[22px] bg-white/[.16] text-left ${fade} hover:-translate-y-1 hover:bg-white/[.5] hover:shadow-[0_12px_26px_rgba(20,18,15,.08)] motion-reduce:hover:translate-y-0 ${speaker
            ? "border border-solid border-[#e2ded6]"
            : "border border-dashed border-[#cfcac1]"
            }`}
      >
         {speaker?.photo ? (
            <img
               src={speaker.photo}
               alt={speaker.name}
               className="w-full h-[142px] object-cover rounded-[19px]"
            />
         ) : (
            <div
               aria-hidden="true"
               className="relative grid place-items-center w-[128px] h-[128px] rounded-full border border-dashed border-[#d5d0c7] bg-white/[.3] mx-auto mb-[13px] text-[33px] text-[#77736d]"
            >
               <FaUser className="text-[50px] opacity-30" />
               <FaQuestion className="absolute text-[24px]" />
            </div>
         )}
         <strong className="mt-2 text-[16px] leading-[1.25]">
            {speaker?.name || (
               <>
                  Speaker to be
                  <br />
                  announced
               </>
            )}
         </strong>
         <span className="mt-[7px] text-[13px] text-[#514e49]">
            {speaker?.role || "Stay tuned"}
         </span>
      </article>
   );
}

export default function SummitSection() {
   const countdown = useCountdown(SUMMIT_DATE);
   const speakerTrack = useRef(null);
   const edges = useCarouselEdges(speakerTrack);

   const scrollSpeakers = (direction) => {
      const element = speakerTrack.current;
      if (!element) return;
      // Honour the OS reduced-motion setting instead of force-animating.
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollBy({
         left: direction * 250,
         behavior: reduced ? "auto" : "smooth",
      });
   };

   return (
      <section
         id="summit-showcase"
         aria-labelledby="summit-showcase-title"
         className="relative isolate overflow-hidden px-6 pt-[58px] pb-12 text-[#111] [font-family:'DM_Sans',sans-serif] bg-[radial-gradient(ellipse_at_50%_18%,rgba(255,253,248,.95),transparent_48%),radial-gradient(ellipse_at_0%_55%,rgba(228,219,205,.38),transparent_31%),radial-gradient(ellipse_at_100%_30%,rgba(228,219,205,.28),transparent_34%),#f7f4ef]"
      >
         <div
            aria-hidden="true"
            className="absolute -z-10 w-[520px] h-[520px] rounded-full bg-[rgba(224,215,201,.18)] blur-[28px] left-[-330px] bottom-[-300px]"
         />
         <div className="w-[min(100%,1020px)] mx-auto text-center">
            <FadeIn>
               <div className="mb-11">
                  <span
                     className={`inline-block rounded-full bg-[#ece8df] px-[15px] py-[6px] ${eyebrow}`}
                  >
                     Upcoming Summit Theme
                  </span>
                  <h2
                     id="summit-showcase-title"
                     className="mx-auto mt-[15px] mb-3 max-w-[650px] text-[clamp(36px,6vw,54px)] leading-[0.98] tracking-[-.06em]"
                  >
                     The Next Wave of
                     <br />
                     Global Innovation
                  </h2>
                  <p className="mx-auto mb-[23px] text-[15px] leading-[1.6] text-[#514e49]">
                     Real people. Bold ideas. Practical solutions for a smarter
                     tomorrow.
                  </p>
                  <p className={`${eyebrow} mb-[9px]`}>Who It's For</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-[23px]">
                     {audiences.map((item) => (
                        <span key={item} className={chip}>
                           {item}
                        </span>
                     ))}
                  </div>
                  <p className={`${eyebrow} mb-[9px]`}>Summit date</p>
                  <div className="flex flex-wrap justify-center items-center gap-[15px]">
                     <div
                        aria-label={`Countdown: ${countdown.join(":")}`}
                        className="grid grid-cols-[repeat(4,minmax(64px,1fr))] w-[min(100%,455px)] py-[9px] px-[6px] rounded-[16px] border border-[#e0dcd4] bg-white/[.14]"
                     >
                        {countdown.map((value, index) => (
                           <div
                              key={index}
                              className={
                                 index < 3 ? "border-r border-[#e0dcd4]" : undefined
                              }
                           >
                              <strong
                                 // Remounting on change replays the tick on the
                                 // seconds cell only; the rest stay steady.
                                 key={index === 3 ? value : index}
                                 className={`block text-[21px] leading-[1.2] ${index === 3 ? tick : ""
                                    }`}
                              >
                                 {value}
                              </strong>
                              <span className="text-[11px] uppercase text-[#514e49]">
                                 {["Days", "Hrs", "Mins", "Sec"][index]}
                              </span>
                           </div>
                        ))}
                     </div>
                     <br className="w-full md:hidden" />
                     <span className="text-[12px] text-[#514e49]">
                        (All times are in GMT)
                     </span>
                  </div>
                  <div className="mt-[23px]">
<a
                         href="/register"
                         className={`${cta} gap-[11px] px-[23px] py-[13px] text-[13px] !bg-black`}
                      >
                        Register Interest <FaArrowRight aria-hidden="true" className={arrowNudge} />
                     </a>
                  </div>
               </div>
            </FadeIn>

            <FadeIn>
               <div className="mx-auto mb-[34px]">
                  <p className={`${eyebrow} mb-[7px]`}>Speakers</p>
                  <h3 className="m-0 mb-[18px] text-[clamp(22px,3vw,29px)] tracking-[-.04em]">
                     Voices shaping the next wave
                  </h3>
                  <div className="flex items-center gap-3">
                     <button
                        type="button"
                        onClick={() => scrollSpeakers(-1)}
                        disabled={!edges.scrollable || edges.atStart}
                        aria-label="Previous speakers"
                        className={chipButton}
                     >
                        <FaArrowLeft />
                     </button>
                     <div
                        ref={speakerTrack}
                        // A scroll container needs to be focusable and named so
                        // the rail is reachable and operable from the keyboard —
                        // but only while there is actually something to scroll.
                        tabIndex={edges.scrollable ? 0 : -1}
                        role="region"
                        aria-label="Speaker lineup"
                        className={`flex flex-1 gap-4 overflow-x-auto snap-x snap-mandatory p-[1px_0_5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto ${focusRing} ${edges.scrollable ? "cursor-grab active:cursor-grabbing" : ""
                           }`}
                     >
                        {Array.from({ length: 4 }, (_, index) => (
                           <div
                              key={speakers[index]?.name || `announcement-${index}`}
                              className="snap-center"
                           >
                              <SpeakerCard speaker={speakers[index]} />
                           </div>
                        ))}
                     </div>
                     <button
                        type="button"
                        onClick={() => scrollSpeakers(1)}
                        disabled={!edges.scrollable || edges.atEnd}
                        aria-label="Next speakers"
                        className={chipButton}
                     >
                        <FaArrowRight />
                     </button>
                  </div>
               </div>
            </FadeIn>

            <FadeIn>
               <div className="mx-auto mb-6">
                  <p className={`${eyebrow} mb-[7px]`}>What to expect</p>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[15px]">
                     {expectations.map((item) => {
                        const Icon = item.Icon;
                        return (
                           <article
                              key={item.title}
                              className={`group px-[15px] py-6 min-h-[320px] border-r border-[#e1ddd5] rounded-[10px] ${fade} hover:bg-white/[.32] bg-cover bg-center bg-no-repeat flex flex-col justify-end item-start text left`}
                              style={{
                                 backgroundImage: `url(${item.image})`,
                                 backgroundPosition: 'center',
                                 backgroundSize: 'cover',
                              }}
                           >
                              <Icon aria-hidden="true" className={`mb-[7px] text-[22px] ${iconNudge}`} />
                              <h4 className="m-0 mb-1 text-[14px] text-[#fff]">{item.title}</h4>
                              <p className="m-0 text-[13px] leading-[1.5] text-[#fff]">
                                 {item.description}
                              </p>
                           </article>
                        );
                     })}
                  </div>
               </div>
            </FadeIn>

            <FadeIn>
               <div className="mb-[18px]">
                  <p className={`${eyebrow} mb-[7px]`}>Venue &amp; format</p>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] px-4 py-[11px] rounded-[15px] border border-[#e0dcd4] bg-white/[.14] text-left">
                     {[
                        [FaCalendarAlt, "Format", "Physical"],
                        [FaMapMarkerAlt, "Location", "Details coming soon"],
                        [FaClock, "More info", "Details coming soon"],
                     ].map(([glyph, name, value]) => {
                        const Icon = glyph;
                        return (
                           <div
                              key={name}
                              className={`group flex items-center gap-[14px] px-3 py-1 border-r border-[#e0dcd4] rounded-[9px] ${fade} hover:bg-white/[.5]`}
                           >
                              <Icon
                                 aria-hidden="true"
                                 className={`text-[18px] ${iconNudge}`}
                              />
                              <span className="text-[12px] text-[#514e49]">
                                 {name}
                                 <br />
                                 <strong className="font-medium text-[#333]">{value}</strong>
                              </span>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </FadeIn>

            <FadeIn>
               <div className="mb-[19px]">
                  <p className={`${eyebrow} mb-2 text-center`}>Supported by</p>
                  <div className="marquee-viewport">
                     <div className="marquee-track">
                        {[0, 1].map((copy) => (
                           <div
                              key={copy}
                              className="marquee-group"
                              aria-hidden={copy === 1 ? "true" : undefined}
                           >
                              {supporters.map((name) => (
                                 <div key={`${copy}-${name}`} className="marquee-logo">
                                    <FaUser aria-hidden="true" />
                                    <span>{name}</span>
                                 </div>
                              ))}
                           </div>
                        ))}
                     </div>
                  </div>

               </div>
            </FadeIn>
            <FadeIn>
               <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                     href="/register"
                     className={`${ctaBase} gap-[11px] px-[19px] py-[11px] text-[12px]`}
                  >
                     Register Interest <FaArrowRight aria-hidden="true" className={arrowNudge} />
                  </a>
                  <a
                     href="mailto:hello@eureses.com"
                     className={`no-underline text-[12px] text-[#282622] rounded-[4px] hover:text-[#000] hover:underline ${focusRing} ${fade}`}
                  >
                     Want to speak? Get in touch
                  </a>
               </div>
            </FadeIn>
         </div>
      </section>
   );
}
