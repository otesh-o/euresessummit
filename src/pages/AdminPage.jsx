import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaSearch, FaSpinner, FaTrash, FaUserCheck, FaUsers } from "react-icons/fa";

import PageHeader from "../components/PageHeader";
import {
  AUTH_TOKEN_KEY,
  checkInParticipant,
  deleteParticipant,
  fetchParticipants,
  setParticipantPresent,
} from "../lib/api";

const filters = ["All", "Students", "Visitors", "Speakers", "Present", "Not present"];

const isStudent = (person) => String(person.profession || "").includes("[Student]");

const controlReset = "appearance-none border-0 bg-transparent font-[inherit]";
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:outline-offset-2";
const fade =
  "transition-[color,background-color,opacity,transform,border-color,box-shadow] duration-[180ms] ease-in-out motion-reduce:transition-none";
const smooth = "transition-all duration-300 ease-in-out motion-reduce:transition-none";
const spin = "animate-[ec-spin_.7s_linear_infinite] motion-reduce:animate-none";
const riseIn =
  "animate-[ec-rise_.4s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";

const pill = `px-4 py-2 rounded-full border border-zinc-800 text-[13px] whitespace-nowrap cursor-pointer select-none text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 active:scale-[.97] disabled:opacity-50 disabled:cursor-not-allowed ${controlReset} ${focusRing} ${fade}`;
const visuallyHidden =
  "absolute w-px h-px -m-px p-0 overflow-hidden [clip-path:inset(50%)] whitespace-nowrap border-0";
const muted = "mt-2 mb-0 text-[13px] text-red-400";
const feedback = "mt-2 mb-0 text-[13px] text-emerald-400";

const cellButton = `${pill} w-[130px] !py-1.5 !px-3 disabled:opacity-50`;
const confirmBox =
  "flex flex-wrap items-center gap-2 text-[13px] rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200";
const confirmBoxDanger = `${confirmBox} !border-red-900/60 !bg-red-950/40`;
const confirmButton = `${pill} !py-1 !px-2.5 text-[12px]`;

const solidButton =
  "!bg-white !text-zinc-950 font-bold hover:!bg-zinc-200 hover:!border-white border-white";
const dangerButton =
  "text-red-400 hover:!bg-red-950/40 hover:!border-red-900/60";
const dangerSolid =
  "!bg-red-600 text-white !border-red-600 hover:!bg-red-700";
const trashButton = `${pill} w-[36px] h-[36px] !p-0 flex items-center justify-center flex-none ${dangerButton}`;
const skeleton =
  "block h-[13px] rounded-full bg-zinc-800 animate-pulse motion-reduce:animate-none";
const card = "rounded-[28px] border border-zinc-800/90 bg-zinc-900/40 backdrop-blur-xl shadow-xl";
const cellBase = "px-4 py-3.5 align-middle text-zinc-200 border-b border-zinc-800/70";

const matchesQuery = (person, query) => {
  const needle = String(query).trim().toLowerCase();
  if (!needle) return true;
  return (
    (person.serial && person.serial.toLowerCase().includes(needle)) ||
    (person.name && person.name.toLowerCase().includes(needle)) ||
    (person.email && person.email.toLowerCase().includes(needle)) ||
    (person.phone && person.phone.toLowerCase().includes(needle)) ||
    (person.profession && person.profession.toLowerCase().includes(needle))
  );
};

export default function AdminPage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [serial, setSerial] = useState("");
  const [checkIn, setCheckIn] = useState({ status: "idle", message: "" });
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [pendingFocus, setPendingFocus] = useState();
  const rowRefs = useRef({});
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const result = await fetchParticipants();
    if (Array.isArray(result)) {
      setPeople(result);
      setLoading(false);
      return;
    }
    setLoadError("Could not load participants from the database.");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (pendingFocus === undefined) return;
    const row = pendingFocus === null ? null : rowRefs.current[pendingFocus];
    (row ?? searchRef.current)?.focus();
    setPendingFocus(undefined);
  }, [pendingFocus, people]);

  const shown = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    return people.filter((person) => {
      const textMatch =
        !needle ||
        `${person.name} ${person.phone} ${person.serial}`.toLowerCase().includes(needle);
      const filterMatch =
        filter === "All" ||
        (filter === "Students" && isStudent(person)) ||
        (filter === "Visitors" && person.role === "Visitor") ||
        (filter === "Speakers" && person.role === "Speaker") ||
        (filter === "Present" && person.present) ||
        (filter === "Not present" && !person.present);
      return textMatch && filterMatch;
    });
  }, [people, filter, debouncedSearch]);

  const setPresent = (id, present) =>
    setPeople((list) =>
      list.map((person) =>
        person.id === id ? { ...person, present } : person,
      ),
    );

  const handleRowButton = async (person) => {
    if (busyId !== null) return;

    if (person.present) {
      setConfirmId(person.id);
      return;
    }

    setBusyId(person.id);
    const result = await setParticipantPresent(person.id, true);
    setBusyId(null);
    if (result?.ok) setPresent(person.id, true);
  };

  const requestDelete = (person) => {
    if (busyId !== null) return;
    setConfirmId(null);
    setDeleteId(person.id);
  };

  const cancelDelete = (person) => {
    setDeleteId(null);
    rowRefs.current[person.id]?.focus();
  };

  const confirmDelete = async (person, event) => {
    if (event) event.stopPropagation();
    setDeleteId(null);
    setBusyId(person.id);

    const result = await deleteParticipant(person.id);
    setBusyId(null);

    if (!result?.ok) return;

    const index = people.findIndex((p) => p.id === person.id);
    const neighbour = people[index + 1] || people[index - 1];
    setPeople((list) => list.filter((p) => p.id !== person.id));
    setPendingFocus(neighbour ? neighbour.id : null);
  };

  const cancelUndo = (person) => {
    setConfirmId(null);
    rowRefs.current[person.id]?.focus();
  };

  const confirmUndo = async (person, event) => {
    if (event) event.stopPropagation();
    setConfirmId(null);
    setBusyId(person.id);
    const result = await setParticipantPresent(person.id, false);
    setBusyId(null);
    if (result?.ok) setPresent(person.id, false);
    rowRefs.current[person.id]?.focus();
  };

  const handleCheckIn = async (event) => {
    event.preventDefault();
    if (checkIn.status === "pending") return;

    const query = serial.trim();
    if (!query) {
      setCheckIn({
        status: "error",
        message: "Enter a serial number, email, or name first.",
      });
      return;
    }

    setCheckIn({ status: "pending", message: "" });
    const result = await checkInParticipant(query);

    if (!result?.ok) {
      setCheckIn({
        status: "error",
        message: result?.error || "No matching attendee found.",
      });
      return;
    }

    const matched = people.find((person) => matchesQuery(person, query));
    if (matched) setPresent(matched.id, true);
    setSerial("");
    setCheckIn({
      status: "ok",
      message: matched
        ? `Checked in: ${matched.name} (${matched.serial})`
        : "Checked in successfully.",
    });
  };

  const handleLogout = (event) => {
    event.preventDefault();
    try {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // ignore
    }
    setConfirmId(null);
    setDeleteId(null);
    navigate("/admin/login", { replace: true });
  };

  const checkingIn = checkIn.status === "pending";

  return (
    <div className="tw-scope min-h-screen text-zinc-100 [font-family:'DM_Sans',sans-serif] bg-[#0c0e12]">
      {/* Subtle Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_60%)]"
      />

      <PageHeader
        action="Log out"
        href="/admin/login"
        onAction={handleLogout}
        dark={true}
      />

      <main className="relative z-10 max-w-[1120px] mx-auto mt-6 mb-16 px-4 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Admin Portal
            </div>
            <h1 className="text-[30px] font-bold tracking-tight text-white mb-1">
              Summit Participants
            </h1>
            <p className="text-sm text-zinc-400">
              Manage registrations, attendee check-ins, and serial verification.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              title: "Total Registered",
              count: people.length,
              icon: <FaUsers className="text-zinc-500" />,
            },
            {
              title: "Students",
              count: people.filter(isStudent).length,
              icon: <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/60">STU</span>,
            },
            {
              title: "Checked In (Present)",
              count: people.filter((p) => p.present).length,
              icon: <FaUserCheck className="text-emerald-400" />,
            },
            {
              title: "Speakers Registered",
              count: people.filter((p) => p.role === "Speaker").length,
              icon: <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/60">VIP</span>,
            },
          ].map((stat) => (
            <article
              key={stat.title}
              className={`${card} p-6 ${smooth} hover:border-zinc-700 hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <span>{stat.title}</span>
                {stat.icon}
              </div>
              <strong className="block mt-2 text-[32px] font-bold text-white tabular-nums">
                {stat.count}
              </strong>
            </article>
          ))}
        </div>

        {/* Quick Check-in Section */}
        <section className={`${card} p-6 mb-6 ${smooth}`}>
          <label
            htmlFor="check-in-query"
            className="block mb-2 text-[14px] font-bold text-white"
          >
            Quick Check-in
          </label>
          <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-3">
            <input
              id="check-in-query"
              name="check-in-query"
              value={serial}
              onChange={(event) => {
                setSerial(event.target.value);
                setCheckIn({ status: "idle", message: "" });
              }}
              placeholder="e.g. EC0001, email address, or name"
              autoComplete="off"
              className={`flex-1 min-w-0 px-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 text-white placeholder:text-zinc-500 hover:border-zinc-700 focus:border-zinc-400 ${controlReset} ${focusRing} ${fade} text-[14px]`}
            />
            <button
              type="submit"
              disabled={checkingIn}
              className={`${pill} ${solidButton} min-w-[130px] h-[48px] flex items-center justify-center`}
            >
              {checkingIn ? (
                <>
                  <FaSpinner aria-hidden="true" className={`${spin} mr-2`} />
                  Checking…
                </>
              ) : (
                "Check In"
              )}
            </button>
          </form>
          {checkIn.message && (
            <p
              id="check-in-feedback"
              role={checkIn.status === "error" ? "alert" : "status"}
              className={`${riseIn} ${
                checkIn.status === "error" ? muted : feedback
              }`}
            >
              {checkIn.message}
            </p>
          )}
        </section>

        {/* Search & Filter Bar */}
        <div
          className={`${card} flex flex-wrap items-center justify-between gap-3 p-4 mb-5`}
        >
          <div className="relative w-full sm:w-[300px]">
            <FaSearch className="absolute left-3.5 top-3.5 text-zinc-500 text-xs" />
            <input
              ref={searchRef}
              id="participant-search"
              name="participant-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter by name, serial, phone…"
              className={`w-full pl-9 pr-4 py-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 text-white placeholder:text-zinc-500 hover:border-zinc-700 focus:border-zinc-400 ${controlReset} ${focusRing} ${fade} text-[13px]`}
            />
          </div>
          <div role="group" aria-label="Filter participants" className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                className={`${pill} ${
                  filter === item
                    ? "!bg-white !text-zinc-950 !border-white font-bold"
                    : "text-zinc-400 bg-zinc-950/50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loadError && (
          <div
            role="alert"
            className={`mb-5 px-4 py-3 rounded-2xl border border-red-900/60 bg-red-950/40 text-sm text-red-300 flex items-center justify-between ${riseIn}`}
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={load}
              className={`${pill} py-1 px-3 text-xs`}
            >
              Retry
            </button>
          </div>
        )}

        {/* Participants Table */}
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {["Serial No.", "Name & Role", "Phone", "Status", "Actions"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 4 }, (_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-zinc-800/80">
                    <td className={cellBase}>
                      <span className={`${skeleton} w-20 h-4`} />
                    </td>
                    <td className={cellBase}>
                      <span className={`${skeleton} w-32 h-4 mb-1.5`} />
                      <span className={`${skeleton} w-48 h-3`} />
                    </td>
                    <td className={cellBase}>
                      <span className={`${skeleton} w-28 h-4`} />
                    </td>
                    <td className={cellBase}>
                      <span className={`${skeleton} w-24 h-8 rounded-full`} />
                    </td>
                    <td className={cellBase}>
                      <span className={`${skeleton} w-8 h-8 rounded-full`} />
                    </td>
                  </tr>
                ))}

              {!loading && shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 text-sm">
                    No participants match your current search or filter.
                  </td>
                </tr>
              )}

              {!loading &&
                shown.map((person) => (
                  <tr
                    key={person.id}
                    className="transition-colors hover:bg-zinc-800/40 group"
                  >
                    <td className={`${cellBase} font-mono font-bold text-white tracking-wide`}>
                      {person.serial}
                    </td>
                    <td className={cellBase}>
                      <div className="font-semibold text-white text-[14px]">
                        {person.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                        <span
                          className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                            person.role === "Speaker"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {person.role}
                        </span>
                        <span>{person.profession}</span>
                      </div>
                    </td>
                    <td className={`${cellBase} text-zinc-400`}>
                      {person.phone}
                    </td>
                    <td className={cellBase}>
                      {confirmId === person.id ? (
                        <div className={confirmBox}>
                          <span>Undo check-in?</span>
                          <button
                            type="button"
                            onClick={(e) => confirmUndo(person, e)}
                            className={`${confirmButton} ${solidButton}`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelUndo(person)}
                            className={confirmButton}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          ref={(node) => {
                            rowRefs.current[person.id] = node;
                          }}
                          type="button"
                          disabled={busyId === person.id}
                          onClick={() => handleRowButton(person)}
                          className={`${cellButton} ${
                            person.present
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          {busyId === person.id ? (
                            <FaSpinner className={`${spin} inline mr-1`} />
                          ) : person.present ? (
                            <>
                              <FaCheck className="inline mr-1.5 text-xs text-emerald-400" />
                              Present
                            </>
                          ) : (
                            "Mark Present"
                          )}
                        </button>
                      )}
                    </td>
                    <td className={cellBase}>
                      {deleteId === person.id ? (
                        <div className={confirmBoxDanger}>
                          <span className="text-red-300 text-xs">Delete?</span>
                          <button
                            type="button"
                            onClick={(e) => confirmDelete(person, e)}
                            className={`${confirmButton} ${dangerSolid}`}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelDelete(person)}
                            className={confirmButton}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          title="Delete attendee record"
                          aria-label={`Delete ${person.name}`}
                          onClick={() => requestDelete(person)}
                          className={trashButton}
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
