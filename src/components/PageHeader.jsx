import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:outline-offset-2";
const fade =
  "transition-[color,background-color,opacity,border-color] duration-300 ease-out motion-reduce:transition-none";

function SmartLink({ href, children, ...props }) {
  const internal = typeof href === "string" && href.startsWith("/") && !href.startsWith("//");
  return internal ? (
    <Link to={href} {...props}>
      {children}
    </Link>
  ) : (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export default function PageHeader({
  action = "Back to home",
  href = "/",
  onAction,
  dark = true,
  light = false,
}) {
  const decorative = !action;
  // Logo sits far left; a back link follows it. Other actions (e.g. log out) stay on the right.
  const backOnLeft = action === "Back to home";
  return (
    <header
      className={`relative flex items-center max-w-[1200px] mx-auto px-5 sm:px-7 py-5 ${
        backOnLeft ? "justify-start gap-3 sm:gap-5" : "justify-between"
      }`}
    >
      <SmartLink
        href="/"
        className={`group flex items-center gap-3 no-underline font-bold text-[17px] rounded-[8px] ${
          light
            ? "text-[#0b1630] hover:text-[#0b1630]/80"
            : dark
              ? "text-white hover:text-white/90"
              : "text-zinc-100 hover:text-white"
        } ${focusRing} ${fade}`}
      >
        <img
          src="/logo.png"
          alt=""
          className={`w-9 h-9 object-contain ${light ? "invert mix-blend-multiply" : "mix-blend-screen"} transition-transform duration-300 ease-in-out motion-reduce:transition-none group-hover:scale-105`}
        />
        <span className={backOnLeft ? "hidden sm:inline" : ""}>Eureses Community</span>
      </SmartLink>
      {backOnLeft && (
        <span aria-hidden="true" className={`h-6 w-px ${light ? "bg-black/[0.14]" : "bg-white/[0.14]"}`} />
      )}
      <SmartLink
        href={href}
        onClick={onAction}
        aria-hidden={decorative || undefined}
        tabIndex={decorative ? -1 : undefined}
        className={`group inline-flex h-10 items-center no-underline text-[14px] font-semibold rounded-full border px-4 ${
          light
            ? "border-black/[0.12] text-[#3a4258] hover:text-[#0b1630] hover:bg-black/[0.04] hover:border-black/[0.22]"
            : dark
              ? "border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20"
              : "border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08]"
        } ${focusRing} ${fade} ${
          decorative
            ? ""
            : "cursor-pointer"
        }`}
      >
        {action === "Back to home" && (
          <FaArrowLeft
            aria-hidden="true"
            className="inline-block mr-[8px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:-translate-x-0.5"
          />
        )}
        {action}
      </SmartLink>
    </header>
  );
}
