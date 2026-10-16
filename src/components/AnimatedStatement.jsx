import { Fragment, useEffect, useRef, useState } from "react";

// Reveals text word by word, with a soft blur-to-sharp lift, once it scrolls into view.
export default function AnimatedStatement({ text }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
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
      { threshold: 0.5, rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <p ref={ref} className={`animated-statement${inView ? " is-visible" : ""}`} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="animated-word" aria-hidden="true" style={{ "--i": i }}>
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
