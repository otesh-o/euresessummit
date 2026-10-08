import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

import PageHeader from "../components/PageHeader";

import { AUTH_TOKEN_KEY, adminLogin } from "../lib/api";

// Preflight is off, so form controls keep the browser's own font, border and
// background. Every control below opts out explicitly.
const controlReset = "appearance-none border-0 bg-transparent font-[inherit]";
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#111] focus-visible:outline-offset-2";
// Replaces the .ec-fade rule from the deleted focus.css.
const fade =
  "transition-[color,background-color,opacity,transform,border-color,box-shadow] duration-[180ms] ease-in-out motion-reduce:transition-none";
const smooth = "transition-all duration-300 ease-in-out motion-reduce:transition-none";
const riseIn =
  "animate-[ec-rise_.5s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";
const spin = "animate-[ec-spin_.7s_linear_infinite] motion-reduce:animate-none";

const input = `w-full h-[46px] pl-[14px] pr-11 rounded-[12px] border border-[#dedbd4] bg-white/[.18] placeholder:text-[#9a948b] hover:border-[#b9b2a7] focus:border-[#8f887e] active:border-[#8f887e] disabled:opacity-60 disabled:cursor-not-allowed ${controlReset} ${focusRing} ${fade} text-[14px] text-[#111]`;
const signIn = `group inline-flex items-center justify-center gap-3 w-[218px] mt-7 px-5 py-[13px] rounded-full !bg-black text-white font-bold text-[16px] cursor-pointer select-none hover:!bg-black hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[.98] disabled:opacity-70 disabled:cursor-progress disabled:translate-y-0 disabled:scale-100 motion-reduce:hover:translate-y-0 ${controlReset} ${focusRing} ${fade}`;
const reveal = `absolute top-[13px] right-3 cursor-pointer select-none text-[#555] rounded-[5px] hover:text-[#111] hover:bg-black/[.06] active:scale-90 ${controlReset} ${focusRing} ${fade}`;

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
    // Not "/admin" — that path always redirects back here. The dashboard
    // lives on its own route, still behind ProtectedRoute.
    navigate("/admin/dashboard", { replace: true });

  };

  return (
    <div
      className="tw-scope m-1 min-h-screen overflow-hidden rounded-[14px] border border-[#dedbd4] text-[#111] [font-family:'DM_Sans',sans-serif] bg-[radial-gradient(ellipse_at_bottom_left,rgba(220,210,194,.28),transparent_38%),radial-gradient(ellipse_at_bottom_right,rgba(220,210,194,.24),transparent_38%),#f7f4ef]"
    >
      <PageHeader action="" />
      <main
        className={`w-[min(100%_-_32px,430px)] mx-auto mt-[clamp(100px,20vh,170px)] mb-[50px] text-center ${riseIn}`}
      >
        <span className="inline-block px-[17px] py-[6px] rounded-full bg-[#ece8df] text-[14px] tracking-[.14em] font-bold">
          ADMIN
        </span>
        <h1 className="mt-[14px] mb-8 text-[clamp(30px,6vw,38px)] tracking-[-.045em]">
          Admin Dashboard
        </h1>
        <form
          id="admin-login"
          onSubmit={handleSubmit}
          className={`px-5 pt-4 pb-5 rounded-[18px] border border-[#dfdcd5] text-left bg-white/[.12] ${smooth} hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(20,18,15,.09)] motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none`}
        >
          <label
            htmlFor="admin-password"
            className="block mb-2 text-[14px] font-semibold"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              ref={passwordRef}
              name="password"
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
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
              className={`mt-[10px] mb-0 text-[14px] text-[#9c2929] ${riseIn}`}
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
          {submitting ? "Signing in…" : "Sign in"}{" "}
          {submitting ? (
            <FaSpinner aria-hidden="true" className={spin} />
          ) : (
            <FaArrowRight
              aria-hidden="true"
              className={`${fade} group-hover:translate-x-0.5`}
            />
          )}
        </button>
      </main>
    </div>
  );
}
