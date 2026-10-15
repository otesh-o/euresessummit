import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaLock, FaSpinner } from "react-icons/fa";

import PageHeader from "../components/PageHeader";
import { AUTH_TOKEN_KEY, adminLogin } from "../lib/api";

const controlReset = "appearance-none border-0 bg-transparent font-[inherit]";
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:outline-offset-2";
const fade =
  "transition-[color,background-color,opacity,transform,border-color,box-shadow] duration-[180ms] ease-in-out motion-reduce:transition-none";
const smooth = "transition-all duration-300 ease-in-out motion-reduce:transition-none";
const riseIn =
  "animate-[ec-rise_.5s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";
const spin = "animate-[ec-spin_.7s_linear_infinite] motion-reduce:animate-none";

const input = `w-full h-[48px] pl-4 pr-12 rounded-2xl border border-zinc-800 bg-zinc-950/80 placeholder:text-zinc-500 hover:border-zinc-700 focus:border-zinc-400 focus:ring-1 focus:ring-white/10 active:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed ${controlReset} ${focusRing} ${fade} text-[14px] text-white`;
const signIn = `group inline-flex items-center justify-center gap-2 w-[200px] mt-7 px-6 py-3 rounded-full bg-white text-zinc-950 font-bold text-[14px] cursor-pointer select-none hover:bg-zinc-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] disabled:opacity-60 disabled:cursor-progress disabled:translate-y-0 disabled:scale-100 motion-reduce:hover:translate-y-0 ${controlReset} ${focusRing} ${fade}`;
const reveal = `absolute top-[14px] right-3.5 cursor-pointer select-none text-zinc-500 rounded-md hover:text-white hover:bg-white/10 p-1 active:scale-90 ${controlReset} ${focusRing} ${fade}`;

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    const result = await adminLogin(password);

    if (!result?.ok) {
      setSubmitting(false);
      setError(result?.error || "Incorrect password");
      passwordRef.current?.focus();
      passwordRef.current?.select();
      return;
    }

    sessionStorage.setItem(AUTH_TOKEN_KEY, result.token);
    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <div className="tw-scope relative min-h-screen overflow-hidden text-zinc-100 [font-family:'DM_Sans',sans-serif] bg-[#0c0e12] selection:bg-zinc-700 selection:text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_60%)]"
      />

      <PageHeader action="Back to home" dark={true} />

      <main
        className={`relative z-10 w-[min(100%_-_32px,420px)] mx-auto mt-[clamp(60px,12vh,120px)] mb-14 text-center ${riseIn}`}
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[12px] tracking-wider font-semibold text-zinc-300 uppercase mb-3">
          <FaLock className="text-zinc-400 text-xs" />
          Admin Portal
        </div>

        <h1 className="mt-1 mb-7 text-[clamp(28px,5vw,36px)] font-bold tracking-tight text-white">
          Summit Admin Login
        </h1>

        <form
          id="admin-login"
          onSubmit={handleSubmit}
          className={`p-7 rounded-[28px] border border-zinc-800/90 text-left bg-zinc-900/50 backdrop-blur-xl shadow-2xl ${smooth}`}
        >
          <label
            htmlFor="admin-password"
            className="block mb-2 text-[13px] font-medium text-zinc-300"
          >
            Admin Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              ref={passwordRef}
              name="password"
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "admin-password-error" : undefined}
              className={input}
            />
            <button
              type="button"
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible(!visible)}
              className={reveal}
            >
              {visible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {error && (
            <p
              id="admin-password-error"
              role="alert"
              className="mt-3 mb-0 text-[13px] text-red-400 leading-snug"
            >
              {error}
            </p>
          )}
        </form>

        <button
          type="submit"
          form="admin-login"
          disabled={submitting}
          aria-busy={submitting}
          className={signIn}
        >
          {submitting ? "Signing in…" : "Sign In"}{" "}
          {submitting ? (
            <FaSpinner aria-hidden="true" className={spin} />
          ) : (
            <FaArrowRight
              aria-hidden="true"
              className={`${fade} group-hover:translate-x-1`}
            />
          )}
        </button>
      </main>
    </div>
  );
}
