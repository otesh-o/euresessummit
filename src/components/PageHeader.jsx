import { FaArrowLeft } from "react-icons/fa";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#111] focus-visible:outline-offset-2";
const fade =
  "transition-[color,background-color,opacity,transform] duration-[180ms] ease-in-out motion-reduce:transition-none";

export default function PageHeader({
  action = "Back to home",
  href = "/",
  onAction,
}) {
  const decorative = !action;
  return (
    <header className="relative z-[2] flex items-center justify-between max-w-[1200px] mx-auto px-7 py-5">
      <a
        href="/"
        className={`group flex items-center gap-3 no-underline font-bold text-[17px] text-[#111] rounded-[8px] hover:text-[#000] ${focusRing} ${fade}`}
      >
        <img
          src="/logo.png"
          alt=""
          className="w-9 h-9 object-contain transition-transform duration-300 ease-in-out motion-reduce:transition-none group-hover:scale-105"
        />
        Eureses Community
      </a>
      <a
        href={href}
        onClick={onAction}
        aria-hidden={decorative || undefined}
        tabIndex={decorative ? -1 : undefined}
        // The padding/hover treatment is applied only when there is an action.
        // `PageHeader action=""` renders an empty anchor, and an always-on
        // hover background would leave an invisible pill sitting there.
        className={`group inline-flex items-center no-underline text-[14px] font-semibold text-[#222] rounded-[8px] ${focusRing} ${fade} ${
          decorative
            ? ""
            : "px-[10px] py-[7px] -mr-[10px] cursor-pointer hover:bg-[#ebe7df] hover:text-[#111] active:scale-[.97]"
        }`}
      >
        {action === "Back to home" && (
          <FaArrowLeft
            aria-hidden="true"
            className="inline-block mr-[7px] transition-transform duration-300 ease-in-out motion-reduce:transition-none group-hover:-translate-x-0.5"
          />
        )}
        {action}
      </a>
    </header>
  );
}
