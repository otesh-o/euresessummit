import { useRef, useState } from "react";
import { FaArrowRight, FaSpinner, FaTimes } from "react-icons/fa";

import PageHeader from "../components/PageHeader";

import { registerParticipant } from "../lib/api";


const controlReset = "appearance-none border-0 bg-transparent font-[inherit]";
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#111] focus-visible:outline-offset-2";
const focusRingInset =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#111] focus-visible:outline-offset-[-2px]";
const fade =
  "transition-[color,background-color,opacity,transform,border-color,box-shadow] duration-[180ms] ease-in-out motion-reduce:transition-none";
const smooth = "transition-all duration-300 ease-in-out motion-reduce:transition-none";
const riseIn =
  "animate-[ec-rise_.5s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";
const riseInFast =
  "animate-[ec-rise_.28s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";
const spin = "animate-[ec-spin_.7s_linear_infinite] motion-reduce:animate-none";

const label = "block mb-[7px] text-[14px] font-semibold";
const field = `w-full h-[46px] px-[15px] rounded-[12px] border border-solid border-[#dedbd4] bg-white/[.18] placeholder:text-[#9a948b] hover:border-[#b9b2a7] focus:border-[#8f887e] active:border-[#8f887e] disabled:opacity-60 disabled:cursor-not-allowed ${controlReset} ${focusRing} ${fade} text-[14px] text-[#111]`;
const errorField =
  "!border-[#c98a8a] hover:!border-[#b06d6d] focus:!border-[#b06d6d] active:!border-[#b06d6d]";
const button = `group inline-flex items-center justify-center gap-3 min-w-[194px] px-[26px] py-[13px] rounded-full bg-[#000] text-white font-bold text-[16px] cursor-pointer select-none enabled:hover:bg-[#282622] enabled:hover:shadow-md enabled:hover:-translate-y-0.5 enabled:active:scale-[.98] enabled:active:shadow-sm disabled:opacity-70 disabled:cursor-progress disabled:translate-y-0 disabled:scale-100 ${controlReset} ${focusRing} ${fade}`;

const errorText = `block mt-[7px] text-[13px] leading-[1.45] text-[#9c2929] ${riseInFast}`;
const alert = `flex items-start justify-between gap-3 mb-[18px] px-[14px] py-3 rounded-[12px] border border-solid border-[#e2c2c2] bg-[rgba(156,41,41,.06)] text-[14px] leading-[1.5] text-left text-[#9c2929] ${focusRing} ${riseIn}`;
const dismiss = `flex-none p-px leading-none text-[17px] cursor-pointer select-none text-inherit hover:opacity-70 active:scale-90 ${controlReset} ${focusRing} ${fade}`;

const textFields = [
  {
    name: "name",
    label: "Full name",
    placeholder: "e.g. John Doe",
    type: "text",
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "e.g. john@example.com",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "phone",
    label: "Phone number",
    placeholder: "e.g. +234 801 234 5678",
    type: "tel",
    autoComplete: "tel",
  },
];

const ROLES = ["Visitor", "Speaker"];
const FIELD_ORDER = ["name", "email", "phone", "role", "profession"];

// Keep email and phone checks intentionally lightweight for the registration form.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^(?:\+234)?(?:0\d{10}|1\d{10})$/;

const validate = (values) => {
  const next = {};

  if (!values.name.trim()) next.name = "Please enter your full name.";
  if (!values.email.trim()) next.email = "Please enter your email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    next.email = "That email address doesn't look right.";
  if (!values.phone.trim()) next.phone = "Please enter your phone number.";
  else if (!PHONE_PATTERN.test(values.phone.trim()))
    next.phone = "That phone number doesn't look right.";
  if (!ROLES.includes(values.role))
    next.role = "Please choose Visitor or Speaker.";
  if (!values.profession.trim())
    next.profession = "Please tell us what you do.";

  return next;
};

export default function RegisterPage() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Visitor",
    profession: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [duplicate, setDuplicate] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [formError, setFormError] = useState("");
  const fieldRefs = useRef({});
  const alertRef = useRef(null);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) =>
      current[name] ? { ...current, [name]: undefined } : current,
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    setStatus("submitting");
    const result = await registerParticipant(values);

    if (!result?.ok) {
      setStatus("idle");
      setFormError(result?.error || "Something went wrong. Please try again.");
      alertRef.current?.focus();
      return;
    }

    setDuplicate(Boolean(result.duplicate));
    setEmailSent(result.emailSent !== false);
    setStatus("done");
  };

  const submitting = status === "submitting";
  const sent = status === "done";

  return (
    <div
      className="tw-scope relative min-h-screen overflow-hidden text-[#111] [font-family:'DM_Sans',sans-serif] bg-[radial-gradient(ellipse_at_bottom_left,rgba(220,210,194,.28),transparent_37%),radial-gradient(ellipse_at_bottom_right,rgba(220,210,194,.24),transparent_37%),#f7f4ef]"
    >
      <PageHeader />
      <main
        className={`relative w-[min(100%_-_32px,500px)] mx-auto mt-[18px] mb-10 text-center ${riseIn}`}
      >
        {/* <span className="inline-block px-4 py-[6px] rounded-full bg-[#ece8df] text-[14px] tracking-[.14em] font-bold">
          SUMMIT
        </span> */}
        <h1 className="mt-3 mb-2 text-[clamp(30px,6vw,40px)] leading-[1.15] tracking-[-.045em]">
          Register for the summit
        </h1>
        <p className="mt-0 mb-[38px] text-[17px] text-[#56534e]">
          "The Next Wave of Global Innovation"
        </p>
        <section
          className={`px-[26px] pt-6 pb-[22px] rounded-[20px] border border-solid border-[#333] text-left bg-white/[.12] ${smooth} hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(20,18,15,.09)] motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none`}
        >
          {sent ? (
            <div
              className={`py-20 px-2 rounded-2xl border border-solid border-[#dfdcd5] text-center text-[21px] font-bold ${riseIn}`}
            >
              You're registered.
              <p className="mx-auto mt-4 max-w-[330px] text-[14px] font-medium leading-[1.6] text-[#55514b]">
                {emailSent
                  ? "Check your email for your serial number."
                  : "Your registration was saved, but we couldn't send the email. Please contact the event team."}
              </p>
              {duplicate && emailSent && (
                <p className="mx-auto mt-4 max-w-[330px] text-[14px] font-medium leading-[1.6] text-[#55514b]">
                  Looks like you already registered — we've resent your existing
                  serial number.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
              {formError && (
                <div ref={alertRef} role="alert" tabIndex={-1} className={alert}>
                  <span>{formError}</span>
                  <button
                    type="button"
                    aria-label="Dismiss error"
                    onClick={() => setFormError("")}
                    className={dismiss}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              {textFields.map(
                ({ name, label: text, placeholder, type, autoComplete }) => (
                  <div key={name} className="mb-[17px]">
                    <label htmlFor={`register-${name}`} className={label}>
                      {text}
                    </label>
                    <input
                      id={`register-${name}`}
                      ref={(node) => {
                        fieldRefs.current[name] = node;
                      }}
                      name={name}
                      type={type}
                      autoComplete={autoComplete}
                      placeholder={placeholder}
                      value={values[name]}
                      onChange={(event) => setField(name, event.target.value)}
                      aria-invalid={errors[name] ? "true" : undefined}
                      aria-describedby={
                        errors[name] ? `register-${name}-error` : undefined
                      }
                      className={`${field} ${errors[name] ? errorField : ""}`}
                    />
                    {errors[name] && (
                      <span
                        id={`register-${name}-error`}
                        role="alert"
                        className={errorText}
                      >
                        {errors[name]}
                      </span>
                    )}
                  </div>
                ),
              )}
              <div className="mb-4">
                <span id="register-role-label" className={label}>
                  Role
                </span>
                <div
                  ref={(node) => {
                    fieldRefs.current.role = node;
                  }}
                  tabIndex={-1}
                  role="group"
                  aria-labelledby="register-role-label"
                  aria-describedby={
                    errors.role ? "register-role-error" : undefined
                  }
                  className={`flex h-[43px] overflow-hidden rounded-[12px] border border-solid border-[#d9d5ce] ${fade} ${submitting ? "opacity-60" : ""
                    }`}
                >
                  {ROLES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={values.role === item}
                      disabled={submitting}
                      onClick={() => setField("role", item)}
                      className={`flex-1 cursor-pointer select-none enabled:hover:bg-[#f5f2ec] enabled:active:scale-[.98] disabled:cursor-not-allowed ${controlReset} ${focusRingInset} ${fade} ${values.role === item
                        ? "bg-[#fffdf8] font-bold"
                        : "font-medium"
                        } ${item === "Visitor" ? "border-r border-solid border-[#dedbd4]" : ""
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {errors.role && (
                  <span id="register-role-error" role="alert" className={errorText}>
                    {errors.role}
                  </span>
                )}
              </div>
              <div className="mb-[25px]">
                <label htmlFor="register-profession" className={label}>
                  What do you do?
                </label>
                <input
                  id="register-profession"
                  ref={(node) => {
                    fieldRefs.current.profession = node;
                  }}
                  name="profession"
                  type="text"
                  placeholder="e.g. Frontend developer, Product designer"
                  value={values.profession}
                  onChange={(event) =>
                    setField("profession", event.target.value)
                  }
                  aria-invalid={errors.profession ? "true" : undefined}
                  aria-describedby={
                    errors.profession ? "register-profession-error" : undefined
                  }
                  className={`${field} ${errors.profession ? errorField : ""}`}
                />
                {errors.profession && (
                  <span
                    id="register-profession-error"
                    role="alert"
                    className={errorText}
                  >
                    {errors.profession}
                  </span>
                )}
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className={button}
                >
                  {submitting ? "Registering…" : "Register"}{" "}
                  {submitting ? (
                    <FaSpinner aria-hidden="true" className={spin} />
                  ) : (
                    <FaArrowRight
                      aria-hidden="true"
                      className={`${fade} group-hover:translate-x-0.5`}
                    />
                  )}
                </button>

                <p className="mt-[22px] mb-0 text-[13px] leading-[1.7] text-[#55514b]">
                  Your serial number (e.g. EC0001) will be emailed to you.
                  <br />
                  You'll need it to enter the hall.
                </p>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
