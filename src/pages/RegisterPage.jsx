import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  FaArrowRight,
  FaBus,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaEnvelope,
  FaGraduationCap,
  FaInfoCircle,
  FaLaptopCode,
  FaLightbulb,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaShieldAlt,
  FaSpinner,
  FaTicketAlt,
  FaTimes,
  FaUniversity,
  FaUser,
} from "react-icons/fa";

import PageHeader from "../components/PageHeader";
import { registerParticipant } from "../lib/api";

const controlReset = "appearance-none border-0 bg-transparent font-[inherit]";
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#157a45] focus-visible:outline-offset-2";
const fade =
  "transition-[color,background-color,opacity,transform,border-color,box-shadow] duration-[180ms] ease-in-out motion-reduce:transition-none";
const riseIn =
  "animate-[ec-rise_.4s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";
const spin = "animate-[ec-spin_.7s_linear_infinite] motion-reduce:animate-none";

const label = "block mb-2 text-[12px] font-semibold text-[#5a6275] uppercase tracking-wider";
const field = `w-full h-[46px] px-4 rounded-xl border border-black/[0.12] !bg-white text-[#0b1630] placeholder:text-[#9aa0ad] hover:border-black/[0.28] focus:border-[#157a45] focus:ring-1 focus:ring-[#157a45]/30 active:border-[#157a45] disabled:opacity-50 disabled:cursor-not-allowed ${controlReset} ${focusRing} ${fade} text-[14px]`;
const selectField = `w-full h-[46px] px-4 rounded-xl border border-black/[0.12] !bg-white text-[#0b1630] hover:border-black/[0.28] focus:border-[#157a45] focus:ring-1 focus:ring-[#157a45]/30 active:border-[#157a45] disabled:opacity-50 disabled:cursor-not-allowed ${focusRing} ${fade} text-[14px]`;
const errorField =
  "!border-red-500/80 hover:!border-red-400 focus:!border-red-400 active:!border-red-400";
const errorText = "block mt-1.5 text-xs text-red-600 font-medium text-left";

const alert =
  "flex items-start justify-between gap-3 p-4 mb-6 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 text-xs sm:text-sm text-left animate-[ec-rise_.2s_ease-out]";
const dismiss =
  "flex-none text-red-500 hover:text-red-700 p-1 -mr-1 -mt-1 rounded-lg transition-colors";

const SCHOOLS = [
  "FUOYE (Federal University Oye-Ekiti)",
  "ABUAD (Afe Babalola University)",
  "EKSU (Ekiti State University)",
];

const STUDENT_LEVELS = ["100L", "200L", "300L", "400L", "500L", "Postgraduate"];

const SKILL_INTERESTS = [
  "Software & Web Development",
  "Design & 3D / Creative Arts",
  "AI, Data & Machine Learning",
  "Hardware, Robotics & IoT",
  "Entrepreneurship & Startups",
  "Content, Writing & Media",
  "Exploring / Fresher",
];

const ROLES = [
  {
    id: "Attendee",
    title: "Attendee",
    desc: "Join keynotes, live panel discussions, and community sessions",
    icon: FaUser,
  },
  {
    id: "Founder / Builder",
    title: "Founder / Builder",
    desc: "I have a startup, product or idea (feeds pre-summit founders meet & panel)",
    icon: FaLaptopCode,
  },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  is_student: null,
  institution: "",
  level: "",
  department: "",
  profession: "",
  skill_interest: "",
  startup_idea: "",
  needs_transport: false,
  role: "Attendee",
};

export default function RegisterPage() {
  const [values, setValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serial, setSerial] = useState(null);
  const [duplicate, setDuplicate] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);

  const alertRef = useRef(null);
  const fieldRefs = useRef({});

  // Focus the first field without scrolling the page away from the heading.
  useEffect(() => {
    fieldRefs.current.name?.focus({ preventScroll: true });
  }, []);

  const validate = () => {
    const nextErrors = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();

    if (!name) {
      nextErrors.name = "Please enter your full name.";
    } else if (name.length < 2) {
      nextErrors.name = "Name must be at least 2 characters long.";
    }

    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address (e.g. name@email.com).";
    }

    if (!phone) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (!/^[\d\s+\-().]{7,20}$/.test(phone)) {
      nextErrors.phone = "Please enter a valid phone number (e.g. 08012345678).";
    }

    if (values.is_student === null) {
      nextErrors.is_student = "Please tell us if you are a student.";
    } else if (values.is_student) {
      if (!values.institution.trim()) nextErrors.institution = "Please enter your school.";
      if (!values.level) nextErrors.level = "Please select your level.";
      if (!values.department.trim()) nextErrors.department = "Please enter your department.";
    }

    return nextErrors;
  };

  const setField = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0];
      fieldRefs.current[firstField]?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        role: values.role === "Founder / Builder" ? "founder" : "attendee",
        profession: values.profession.trim(),
        is_student: values.is_student === true,
        institution: values.is_student ? values.institution.trim() : "",
        level: values.is_student ? values.level : "",
        department: values.is_student ? values.department.trim() : "",
        skill_interest: values.skill_interest,
        startup_idea: values.startup_idea.trim(),
        needs_transport: values.needs_transport,
      };

      const result = await registerParticipant(payload);
      if (!result.success && !result.ok) {
        setFormError(
          result.error || "Unable to complete registration. Please try again."
        );
        setSubmitting(false);
        setTimeout(() => alertRef.current?.focus(), 50);
        return;
      }

      setSerial(result.serial);
      setDuplicate(Boolean(result.duplicate));
      setEmailSent(Boolean(result.emailSent));
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError("A network error occurred. Please verify your connection.");
      setSubmitting(false);
      setTimeout(() => alertRef.current?.focus(), 50);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f6f5ef] text-[#0b1630] selection:bg-[#0b1630] selection:text-white [font-family:'DM_Sans',sans-serif] [&_button]:font-[inherit] [&_input]:font-[inherit] [&_select]:font-[inherit] [&_textarea]:font-[inherit]">
      {/* Soft community photo behind the page, dissolving into the background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_0%,#000_35%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_35%,transparent_100%)]"
      >
        <img
          src="/assets/community.jpg"
          alt=""
          className="h-full w-full scale-110 object-cover object-[50%_28%] opacity-[0.3] blur-[7px] saturate-[0.8]"
        />
      </div>

      <PageHeader light />

      <main className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        
        {sent ? (
          <div className={`max-w-[440px] mx-auto pt-8 sm:pt-12 pb-6 text-center ${riseIn}`}>
            <FaCheckCircle className="mx-auto text-3xl text-[#157a45]" />
            <h1 className="m-0 mt-5 text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0b1630]">
              You&apos;re registered
            </h1>
            <p className="mt-3 mb-0 text-sm sm:text-base text-[#5a6275] leading-relaxed">
              {values.name}, your pass for the Eureses Creative Summit is ready.
            </p>

            {serial && (
              <div className="mt-8 flex flex-col items-center">
                <div className="p-3 rounded-xl bg-white border border-black/[0.08]">
                  <QRCodeSVG
                    value={`EURESES-SUMMIT-2026:${serial}:${values.email}`}
                    size={150}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="mt-5 font-mono text-2xl font-bold tracking-[0.2em] text-[#0b1630]">{serial}</div>
                <p className="mt-2 mb-0 text-xs text-[#5a6275]">
                  Show this QR code or serial number at the entrance.
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-black/[0.1] text-sm text-[#5a6275] leading-relaxed">
              <div className="text-[#0b1630] font-medium">21 November 2026 · Doors 9:00 AM WAT</div>
              <div>Florence Bamitale Owolabi Civic Center, Ikole Ekiti</div>
              {values.needs_transport && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <FaBus className="text-[#0b1630]" />
                  <span>Free shuttle reserved from FUOYE Oye campus.</span>
                </div>
              )}
            </div>

            <p className="mt-6 mb-0 text-xs text-[#5a6275] leading-relaxed">
              {emailSent
                ? "We've also emailed your pass. Check spam or promotions if it's delayed."
                : "Your pass is saved. Keep this page or take a screenshot."}
              {duplicate && " This email was already registered, so this is your existing pass."}
            </p>

            <a
              href="/"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#0b1630] px-8 text-xs font-semibold text-white no-underline transition-colors hover:bg-[#16264a]"
            >
              Back to home
            </a>
          </div>
        ) : (
          <div className={`max-w-[520px] mx-auto pt-6 sm:pt-10 text-left ${riseIn}`}>
            <div className="mb-8">
              <h1 className="m-0 text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0b1630]">
                Reserve your seat
              </h1>
              <p className="mt-3 mb-0 text-sm text-[#5a6275] leading-relaxed">
                Eureses Creative Summit &apos;26 · 21 November 2026 · Florence Bamitale Owolabi Civic Center, Ikole Ekiti · Free
              </p>
            </div>

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

                  {/* Full Name */}
                  <div className="mb-5">
                    <label htmlFor="register-name" className={label}>
                      <span>Full Name</span>
                    </label>
                    <input
                      id="register-name"
                      ref={(node) => {
                        fieldRefs.current.name = node;
                      }}
                      name="name"
                      type="text"
                      autoComplete="name"
                      autoCapitalize="words"
                      enterKeyHint="next"
                      placeholder="e.g. Chioma Adeyemi"
                      value={values.name}
                      onChange={(e) => setField("name", e.target.value)}
                      aria-invalid={errors.name ? "true" : undefined}
                      className={`${field} ${errors.name ? errorField : ""}`}
                    />
                    {errors.name && (
                      <span role="alert" className={errorText}>
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-5">
                    <label htmlFor="register-email" className={label}>
                      <span>Email Address</span>
                    </label>
                    <input
                      id="register-email"
                      ref={(node) => {
                        fieldRefs.current.email = node;
                      }}
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="next"
                      placeholder="e.g. name@email.com"
                      value={values.email}
                      onChange={(e) => setField("email", e.target.value)}
                      aria-invalid={errors.email ? "true" : undefined}
                      className={`${field} ${errors.email ? errorField : ""}`}
                    />
                    {errors.email && (
                      <span role="alert" className={errorText}>
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="mb-5">
                    <label htmlFor="register-phone" className={label}>
                      <span>Phone / WhatsApp Number</span>
                    </label>
                    <input
                      id="register-phone"
                      ref={(node) => {
                        fieldRefs.current.phone = node;
                      }}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      enterKeyHint="go"
                      placeholder="e.g. 08012345678"
                      value={values.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      aria-invalid={errors.phone ? "true" : undefined}
                      className={`${field} ${errors.phone ? errorField : ""}`}
                    />
                    {errors.phone && (
                      <span role="alert" className={errorText}>
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  {/* Student? */}
                  <fieldset className="mb-5 m-0 p-0 border-0 min-w-0">
                    <legend className={`${label} p-0`}>
                      <span>Are you a student?</span>
                    </legend>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Yes, I'm a student", value: true },
                        { label: "No", value: false },
                      ].map((option) => {
                        const selected = values.is_student === option.value;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => setField("is_student", option.value)}
                            aria-pressed={selected}
                            className={`h-[46px] rounded-xl border text-sm font-medium ${fade} ${focusRing} ${
                              selected
                                ? "border-[#157a45] bg-[#157a45]/[0.08] text-[#0b1630]"
                                : "border-black/[0.12] bg-white text-[#2a3350] hover:border-black/[0.28] hover:text-[#0b1630]"
                            } ${errors.is_student ? errorField : ""}`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    {errors.is_student && (
                      <span role="alert" className={errorText}>
                        {errors.is_student}
                      </span>
                    )}
                  </fieldset>

                  {values.is_student === true && (
                    <div className={`mb-5 space-y-4 ${riseIn}`}>
                      <div>
                        <label htmlFor="register-school" className={label}>
                          <span>School</span>
                        </label>
                        <input
                          id="register-school"
                          ref={(node) => {
                            fieldRefs.current.institution = node;
                          }}
                          name="school"
                          type="text"
                          list="register-school-options"
                          autoComplete="organization"
                          autoCapitalize="words"
                          enterKeyHint="next"
                          placeholder="e.g. FUOYE, ABUAD, EKSU"
                          value={values.institution}
                          onChange={(e) => setField("institution", e.target.value)}
                          aria-invalid={errors.institution ? "true" : undefined}
                          className={`${field} ${errors.institution ? errorField : ""}`}
                        />
                        <datalist id="register-school-options">
                          {SCHOOLS.map((school) => (
                            <option key={school} value={school} />
                          ))}
                        </datalist>
                        {errors.institution && (
                          <span role="alert" className={errorText}>
                            {errors.institution}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="register-level" className={label}>
                            <span>Level</span>
                          </label>
                          <select
                            id="register-level"
                            ref={(node) => {
                              fieldRefs.current.level = node;
                            }}
                            value={values.level}
                            onChange={(e) => setField("level", e.target.value)}
                            aria-invalid={errors.level ? "true" : undefined}
                            className={`${selectField} ${errors.level ? errorField : ""}`}
                          >
                            <option value="" className="bg-white text-[#0b1630]">
                              Select level…
                            </option>
                            {STUDENT_LEVELS.map((lvl) => (
                              <option key={lvl} value={lvl} className="bg-white text-[#0b1630]">
                                {lvl}
                              </option>
                            ))}
                          </select>
                          {errors.level && (
                            <span role="alert" className={errorText}>
                              {errors.level}
                            </span>
                          )}
                        </div>

                        <div>
                          <label htmlFor="register-department" className={label}>
                            <span>Department</span>
                          </label>
                          <input
                            id="register-department"
                            ref={(node) => {
                              fieldRefs.current.department = node;
                            }}
                            name="department"
                            type="text"
                            autoCapitalize="words"
                            enterKeyHint="go"
                            placeholder="e.g. Mechatronics Engineering"
                            value={values.department}
                            onChange={(e) => setField("department", e.target.value)}
                            aria-invalid={errors.department ? "true" : undefined}
                            className={`${field} ${errors.department ? errorField : ""}`}
                          />
                          {errors.department && (
                            <span role="alert" className={errorText}>
                              {errors.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shuttle: one tap, stays visible */}
                  <label className="mb-5 flex items-center gap-3 p-3.5 rounded-xl border border-black/[0.1] bg-white cursor-pointer hover:border-black/[0.25] transition-colors">
                    <input
                      type="checkbox"
                      checked={values.needs_transport}
                      onChange={(e) => setField("needs_transport", e.target.checked)}
                      className="w-4 h-4 flex-none rounded border-black/[0.25] bg-white accent-[#157a45]"
                    />
                    <span className="flex items-center gap-2 text-sm text-[#0b1630]">
                      <FaBus className="text-[#5a6275] text-xs flex-none" />
                      <span>I need the free shuttle from FUOYE Oye campus</span>
                    </span>
                  </label>

                  {/* Optional details, collapsed by default */}
                  <div className="mb-7">
                    <button
                      type="button"
                      onClick={() => setMoreOpen((open) => !open)}
                      aria-expanded={moreOpen}
                      aria-controls="register-more"
                      className={`group inline-flex items-center gap-2 text-[13px] font-medium text-[#5a6275] hover:text-[#0b1630] cursor-pointer p-0 ${controlReset} ${focusRing} ${fade}`}
                    >
                      <FaPlus
                        className={`text-[10px] transition-transform duration-300 motion-reduce:transition-none ${
                          moreOpen ? "rotate-45" : ""
                        }`}
                      />
                      <span>{moreOpen ? "Hide extra details" : "Add more about you (optional)"}</span>
                    </button>

                    <div
                      id="register-more"
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                        moreOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className={moreOpen ? "overflow-visible" : "overflow-hidden"}>
                        <div className="pt-5 space-y-5" inert={!moreOpen}>
                          {/* Role */}
                          <div>
                            <span className={label}>I am joining as</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {ROLES.map((roleOption) => {
                                const Icon = roleOption.icon;
                                const isSelected = values.role === roleOption.id;
                                return (
                                  <button
                                    key={roleOption.id}
                                    type="button"
                                    onClick={() => setField("role", roleOption.id)}
                                    aria-pressed={isSelected}
                                    className={`p-4 rounded-xl border text-left transition-all relative ${
                                      isSelected
                                        ? "border-[#157a45] bg-[#157a45]/[0.06] text-[#0b1630]"
                                        : "border-black/[0.1] bg-white text-[#5a6275] hover:border-black/[0.25] hover:text-[#0b1630]"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <div className="flex items-center gap-2.5">
                                        <div
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                                            isSelected
                                              ? "bg-[#157a45] text-white"
                                              : "bg-black/[0.05] text-[#5a6275]"
                                          }`}
                                        >
                                          <Icon />
                                        </div>
                                        <span className="font-medium text-sm text-[#0b1630]">
                                          {roleOption.title}
                                        </span>
                                      </div>
                                      {isSelected && <FaCheckCircle className="text-[#157a45] text-xs" />}
                                    </div>
                                    <p className="text-xs text-[#5a6275] m-0">{roleOption.desc}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* What do you do / study */}
                          <div>
                            <label htmlFor="register-profession" className={label}>
                              <span>What do you do or study?</span>
                            </label>
                            <input
                              id="register-profession"
                              name="profession"
                              type="text"
                              placeholder="e.g. 300L Mechatronics student, 3D designer"
                              value={values.profession}
                              onChange={(e) => setField("profession", e.target.value)}
                              className={field}
                            />
                          </div>

                          {/* Interest */}
                          <div>
                            <label htmlFor="register-interest" className={label}>
                              <span>Primary Skill or Interest Area</span>
                            </label>
                            <select
                              id="register-interest"
                              value={values.skill_interest}
                              onChange={(e) => setField("skill_interest", e.target.value)}
                              className={selectField}
                            >
                              <option value="" className="bg-white text-[#0b1630]">
                                Select…
                              </option>
                              {SKILL_INTERESTS.map((interest) => (
                                <option key={interest} value={interest} className="bg-white text-[#0b1630]">
                                  {interest}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Founder idea */}
                          {values.role === "Founder / Builder" && (
                            <div className="p-4 rounded-xl border border-black/[0.1] bg-white animate-[ec-rise_.2s_ease-out]">
                              <label htmlFor="register-idea" className={label}>
                                <span className="flex items-center gap-2 text-[#0b1630]">
                                  <FaLightbulb className="text-[#0b1630]" />
                                  <span>What are you building? (optional)</span>
                                </span>
                              </label>
                              <textarea
                                id="register-idea"
                                rows={3}
                                placeholder="A line or two is enough. This helps us pick builders for the live stage panel."
                                value={values.startup_idea}
                                onChange={(e) => setField("startup_idea", e.target.value)}
                                className="w-full p-3 rounded-xl border border-black/[0.12] bg-white text-[#0b1630] placeholder:text-[#9aa0ad] text-sm focus:border-white focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`group w-full h-11 rounded-full bg-[#0b1630] hover:bg-[#16264a] text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all duration-150 shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-progress ${controlReset} ${focusRing}`}
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className={`${spin} text-sm`} />
                          <span>Issuing your pass…</span>
                        </>
                      ) : (
                        <>
                          <span>Get my pass</span>
                          <FaArrowRight className="text-[11px] transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <div className="mt-4 text-center">
                      <p className="m-0 text-xs text-[#5a6275] leading-relaxed">
                        Free admission. Your pass and QR code appear instantly and are emailed to you.
                      </p>
                      <p className="mt-1 text-[11px] text-[#8a90a0]">
                        We only use your details for your pass and summit updates.
                      </p>
                    </div>
                  </div>
                </form>
          </div>
        )}

      </main>
    </div>
  );
}
