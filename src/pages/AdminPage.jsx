import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaTrash } from "react-icons/fa";

import PageHeader from "../components/PageHeader";

import {
  AUTH_TOKEN_KEY,
  checkInParticipant,
  deleteParticipant,
  fetchParticipants,
  setParticipantPresent,
} from "../lib/api";

const filters = ["All", "Visitors", "Speakers", "Present", "Not present"];

// Preflight is off, so controls keep the browser's own font, border and
// background. Every control below opts out explicitly.
const controlReset = "appearance-none border-0 bg-transparent font-[inherit]";
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#111] focus-visible:outline-offset-2";
// Replaces the .ec-fade rule from the deleted focus.css.
const fade =
  "transition-[color,background-color,opacity,transform,border-color,box-shadow] duration-[180ms] ease-in-out motion-reduce:transition-none";
const smooth = "transition-all duration-300 ease-in-out motion-reduce:transition-none";
const spin = "animate-[ec-spin_.7s_linear_infinite] motion-reduce:animate-none";
const riseIn =
  "animate-[ec-rise_.4s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none";

const pill = `px-[17px] py-[9px] rounded-full border border-[#dedbd4] text-[13px] whitespace-nowrap cursor-pointer select-none enabled:hover:bg-[#ebe7df] enabled:hover:border-[#c9c3b7] enabled:active:scale-[.97] disabled:opacity-70 disabled:cursor-not-allowed ${controlReset} ${focusRing} ${fade}`;
// Label for the search box stays in the accessibility tree without changing the layout.
const visuallyHidden =
  "absolute w-px h-px -m-px p-0 overflow-hidden [clip-path:inset(50%)] whitespace-nowrap border-0";
const muted = "mt-[10px] mb-0 text-[13px] text-[#9c2929]";
const feedback = "mt-[10px] mb-0 text-[13px] text-[#58534d]";
// `pill` carries arbitrary padding (`px-[17px] py-[9px]`), and Tailwind emits
// arbitrary values *after* named ones in the same utility — so any plain
// `px-*`/`py-*` appended below would silently lose and render at full pill
// padding. These overrides are flagged important to actually win.
const cellButton = `${pill} w-[130px] !py-2 !px-3 disabled:opacity-70`;
const confirmBox =
  "flex flex-wrap items-center gap-2 text-[13px] rounded-[10px] border border-[#e0ddd6] bg-white/[.55] px-[9px] py-[6px]";
// Same box, tinted to read as destructive. Flagged important for the same
// reason as the button hovers: two arbitrary values of one property otherwise
// resolve by stylesheet order.
const confirmBoxDanger = `${confirmBox} !border-[#e5c3c3] !bg-[rgba(156,41,41,.05)]`;
const confirmButton = `${pill} !py-[7px] !px-[11px] text-[12px]`;
// `pill` already owns a hover background, and which of two `hover:bg-*`
// utilities wins would otherwise depend on Tailwind's arbitrary-value sort
// order. The destructive tones are flagged important so they always win.
const solidButton =
  "!bg-black text-white hover:!bg-black hover:!border-black border-black";
const dangerButton =
  "text-[#9c2929] hover:!bg-[rgba(156,41,41,.09)] hover:!border-[#d9a7a7]";
const dangerSolid =
  "bg-[#9c2929] text-white border-[#9c2929] hover:!bg-[#7d1f1f] hover:!border-[#7d1f1f]";
const trashButton = `${pill} w-[38px] !px-0 flex-none ${dangerButton}`;
const skeleton =
  "block h-[13px] rounded-full bg-[#e6e2da] animate-pulse motion-reduce:animate-none";
// Every panel on the page shares one edge colour and radius so the grid of
// cards reads as a set.
const card = "rounded-[18px] border border-[#e0ddd6]";
// Rows carry a bottom rule except the last, which would otherwise sit one pixel
// above the table's own border and read as a doubled line.
const cellBase = "border border-black px-[14px] py-[13px] align-middle";
const cellRule = "border border-black";

const matchesQuery = (person, query) => {
  const needle = String(query).trim().toLowerCase();
  return (
    person.serial.toLowerCase() === needle ||
    person.name.toLowerCase() === needle
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
    setLoadError("Could not load participants.");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  // Deleting a row removes the element that currently holds focus. Wait for the
  // next render, then hand focus to the row that slid into its place so the
  // keyboard user never gets dropped back on <body>.
  // `undefined` = nothing pending, `null` = that row is gone, use the search box.
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
        `${person.name} ${person.phone}`.toLowerCase().includes(needle);
      const filterMatch =
        filter === "All" ||
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
    // One inline confirmation at a time; opening one closes the other.
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
        message: "Enter a serial number or a name first.",
      });
      return;
    }

    setCheckIn({ status: "pending", message: "" });
    const result = await checkInParticipant(query);

    if (!result?.ok) {
      setCheckIn({
        status: "error",
        message: result?.error || "No match found",
      });
      return;
    }

    const matched = people.find((person) => matchesQuery(person, query));
    if (matched) setPresent(matched.id, true);
    setSerial("");
    setCheckIn({
      status: "ok",
      message: matched
        ? `${matched.name} (${matched.serial}) is checked in.`
        : "Checked in.",
    });
  };

  const handleLogout = (event) => {
    event.preventDefault();
    try {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // Storage blocked: navigate regardless so the user leaves the dashboard.
    }
    setConfirmId(null);
    setDeleteId(null);
    navigate("/admin/login", { replace: true });
  };

  const checkingIn = checkIn.status === "pending";

  return (
    <div className="tw-scope min-h-screen text-[#111] [font-family:'DM_Sans',sans-serif] bg-[#f7f4ef]">
      <PageHeader
        action="Log out"
        href="/admin/login"
        onAction={handleLogout}
      />
      <main className="max-w-[1120px] mx-auto mt-[22px] mb-[60px] px-7">
        <h1 className="mt-5 mb-3 text-[34px] tracking-[-.04em]">
          Participants
        </h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px] mb-[18px]">
          {[
            ["Total registered", people.length],
            ["Checked in", people.filter((person) => person.present).length],
            [
              "Speakers",
              people.filter((person) => person.role === "Speaker").length,
            ],
          ].map(([title, n]) => (
            <article
              key={title}
              className={`px-[22px] py-[18px] rounded-[17px] border border-[#e0ddd6] ${smooth} hover:-translate-y-0.5 hover:border-[#d2cdc3] hover:shadow-[0_12px_28px_rgba(20,18,15,.07)] motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none`}
            >
              <div className="text-[14px] text-[#5c5750]">{title}</div>
              <strong className="block mt-2 text-[31px] tabular-nums">{n}</strong>
            </article>
          ))}
        </div>
        <section
          className={`${card} pt-[17px] px-5 pb-5 mb-[25px] ${smooth} hover:border-[#d2cdc3] hover:shadow-[0_12px_28px_rgba(20,18,15,.06)] motion-reduce:hover:shadow-none`}
        >
          <label
            htmlFor="check-in-query"
            className="block mb-2.5 text-[15px] font-bold"
          >
            Check in by serial number
          </label>
          <form onSubmit={handleCheckIn} className="flex gap-3">
            <input
              id="check-in-query"
              name="check-in-query"
              value={serial}
              onChange={(event) => {
                setSerial(event.target.value);
                setCheckIn({ status: "idle", message: "" });
              }}
              placeholder="Serial number or name"
              autoComplete="off"
              aria-describedby={
                checkIn.message ? "check-in-feedback" : undefined
              }
              className={`flex-1 min-w-0 px-[15px] py-3 rounded-[13px] border border-[#dedbd4] placeholder:text-[#9a948b] hover:border-[#b9b2a7] focus:border-[#8f887e] active:border-[#8f887e] ${controlReset} ${focusRing} ${fade} text-[14px] text-[#111]`}
            />
            <button
              type="submit"
              disabled={checkingIn}
              aria-busy={checkingIn}
              className={`${pill} ${solidButton} min-w-[145px] flex-none`}
            >
              {checkingIn ? (
                <>
                  <FaSpinner aria-hidden="true" className={spin} />
                  Checking in…
                </>
              ) : (
                "Check in"
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
        <div
          className={`${card} flex flex-wrap items-center gap-2.5 px-5 py-[14px] mb-[17px] ${smooth} hover:border-[#d2cdc3] hover:shadow-[0_12px_28px_rgba(20,18,15,.06)] motion-reduce:hover:shadow-none`}
        >
          <label htmlFor="participant-search" className={visuallyHidden}>
            Search by name or phone number
          </label>
          <input
            ref={searchRef}
            id="participant-search"
            name="participant-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="⌕  Search by name or phone number..."
            className={`w-[min(100%,290px)] px-[14px] py-2.5 rounded-full border border-[#dedbd4] placeholder:text-[#9a948b] hover:border-[#b9b2a7] focus:border-[#8f887e] active:border-[#8f887e] ${controlReset} ${focusRing} ${fade} text-[13px] text-[#111]`}
          />
          <div
            role="group"
            aria-label="Filter participants"
            className="flex flex-wrap gap-2.5"
          >
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                className={`${pill} ${
                  filter === item ? solidButton : "text-[#222]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <p aria-live="polite" className={visuallyHidden}>
            {loading
              ? "Loading participants"
              : `${shown.length} of ${people.length} participants shown`}
          </p>
        </div>
        {loadError && (
          <div
            role="alert"
            className={`mb-[17px] px-4 py-[13px] rounded-[12px] border border-[#e2c2c2] bg-[rgba(156,41,41,.06)] text-[14px] text-[#9c2929] ${riseIn}`}
          >
            <span>{loadError}</span>{" "}
            <button
              type="button"
              onClick={load}
              className={`${pill} py-[6px] px-3 ml-2`}
            >
              Retry
            </button>
          </div>
        )}
<div
           className={`${card} overflow-x-auto border-2 border-black ${smooth} hover:border-black hover:shadow-[0_12px_28px_rgba(20,18,15,.06)] motion-reduce:hover:shadow-none`}
         >
           <table className="w-full border border-black text-left text-[13px]">
            <caption className={visuallyHidden}>
              Registered participants and their check-in status
            </caption>
            <thead>
<tr>
                 {["Serial No.", "Name", "Phone number", "Present", "Actions"].map(
                   (h) => (
                     <th
                       key={h}
                       scope="col"
                       className="border border-black px-[14px] py-3 text-[#49453f]"
                     >
                       {h}
                     </th>
                   ),
                 )}
               </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className={`${cellBase} ${cellRule}`}>
                      <span className={`${skeleton} w-[190px] h-[11px]`} />
                    </td>
                    <td className={`${cellBase} ${cellRule}`}>
                      <span className={`${skeleton} w-[86px] mb-[7px]`} />
                      <span className={`${skeleton} w-[190px] h-[11px]`} />
                    </td>
                    <td className={`${cellBase} ${cellRule}`}>
                      <span className={`${skeleton} w-[112px]`} />
                    </td>
                    <td className={`px-[14px] py-[15px] ${cellRule}`}>
                      <span
                        className={`${skeleton} w-[130px] h-[34px] rounded-full`}
                      />
                    </td>
                    <td className="px-[14px] py-[15px] align-middle">
                      <span
                        className={`${skeleton} w-[38px] h-[36px] rounded-full ml-auto`}
                      />
                    </td>
                  </tr>
                ))}
              {!loading && shown.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-[14px] py-[22px] text-[#58534d]"
                  >
                    No participants match your search.
                  </td>
                </tr>
              )}
              {!loading &&
                shown.map((person, index) => {
                  const rule = index === shown.length - 1 ? "" : cellRule;
                  return (
                    <tr
                      key={person.id}
                      className="transition-colors duration-200 ease-out hover:bg-[#f6f3ec] motion-reduce:transition-none"
                    >
                      <td className={`${cellBase} ${rule}`}>{person.serial}</td>
                      <td className={`${cellBase} ${rule}`}>
                        <strong className="text-[14px]">{person.name}</strong>
                        <div className="mt-[5px] text-[13px] text-[#58534d]">
                          <span className="py-1 px-[9px] rounded-full mr-[9px] bg-[#ebe7df]">
                            {person.role}
                          </span>
                          {person.profession}
                        </div>
                      </td>
                      <td className={`${cellBase} ${rule}`}>{person.phone}</td>
                      <td className={`px-[14px] py-2.5 ${rule}`}>
                      {confirmId === person.id ? (
                        <div
                          className={confirmBox}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") cancelUndo(person);
                          }}
                        >
                          <span>Undo check-in?</span>
                          <button
                            type="button"
                            autoFocus
                            onClick={(event) => confirmUndo(person, event)}
                            className={`${confirmButton} ${solidButton}`}
                          >
                            Yes, undo
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
                          aria-busy={busyId === person.id}
                          onClick={() => handleRowButton(person)}
                          className={`${cellButton} ${
                            person.present ? solidButton : "text-[#222]"
                          }`}
                        >
                          {busyId === person.id ? (
                            <>
                              <FaSpinner
                                aria-hidden="true"
                                className={`${spin} mr-[7px]`}
                              />
                              …
                            </>
                          ) : person.present ? (
                            "Present ✓"
                          ) : (
                            "Check in"
                          )}
                        </button>
                      )}
                    </td>
                    <td className={`px-[14px] py-2.5 align-middle ${rule}`}>
                      {deleteId === person.id ? (
                        <div
                          className={confirmBoxDanger}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") cancelDelete(person);
                          }}
                        >
                          <span className="text-[#9c2929]">
                            {person.present
                              ? "Checked in — delete?"
                              : "Delete?"}
                          </span>
                          <button
                            type="button"
                            autoFocus
                            onClick={(event) => confirmDelete(person, event)}
                            className={`${confirmButton} ${dangerSolid}`}
                          >
                            Yes, delete
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
                          disabled={busyId !== null}
                          aria-label={`Delete ${person.name} (${person.serial})`}
                          title="Delete participant"
                          onClick={() => requestDelete(person)}
                          className={trashButton}
                        >
                          <FaTrash aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
