import { createClient } from "@supabase/supabase-js";

const supabaseurl = import.meta.env.VITE_SUPABASE_URL || "https://rloghizmxlbreuskchzd.supabase.co";
const supabasekey = import.meta.env.VITE_SUPABASE_ANON_KEY || "dummy-anon-key";
export const supabase = createClient(supabaseurl, supabasekey);

const PASSWORD = import.meta.env.VITE_PASSWORD || "admin";
export const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN || "ec-admin-token";

const isValid = (value) => typeof value === "string" && value.trim().length > 0;

/** @returns {Promise<{ok: true, success: true, serial: string, duplicate?: boolean, emailSent?: boolean} | {ok: false, success: false, error: string}>} */
export async function registerParticipant({
  name,
  email,
  phone,
  role = "Attendee",
  profession = "",
  is_student = false,
  institution = "",
  level = "",
  department = "",
  skill_interest = "",
  startup_idea = "",
  needs_transport = false,
} = {}) {
  if (!name || !name.trim() || !email || !email.trim() || !phone || !phone.trim()) {
    return {
      ok: false,
      success: false,
      error: "Please fill in your name, email, and phone number."
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from("participants")
    .select("serial")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing) {
    return {
      ok: true,
      success: true,
      serial: existing.serial,
      duplicate: true,
      emailSent: true,
    };
  }

  // Build composite profession string for rich dashboard details
  // "[Student]" is the marker the admin dashboard counts students by.
  const compositeParts = [
    is_student ? "[Student]" : null,
    profession.trim(),
    institution.trim(),
    level.trim(),
    department.trim() ? `Dept: ${department.trim()}` : null,
    skill_interest.trim() ? `Interest: ${skill_interest.trim()}` : null,
    startup_idea.trim() ? `Idea/Startup: ${startup_idea.trim()}` : null,
    needs_transport ? "[Needs Oye Bus Transport]" : null,
  ].filter(Boolean);

  const compositeProfession = compositeParts.join(" • ") || profession.trim() || "Student / Builder";

  const insertPayload = {
    name: name.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    role: (role || "Attendee").toLowerCase(),
    profession: compositeProfession,
  };

  const { data, error } = await supabase
    .from("participants")
    .insert(insertPayload)
    .select("serial")
    .single();

  if (error) {
    return {
      ok: false,
      success: false,
      error: "We couldn't record your registration. Please check your connection and try again."
    };
  }

  // Attempt to trigger the email edge function in background
  let emailSent = false;
  try {
    const { error: fnErr } = await supabase.functions.invoke("send-serial-email", {
      body: { name: name.trim(), email: cleanEmail, serial: data.serial },
    });
    if (!fnErr) emailSent = true;
  } catch (emailErr) {
    console.warn("Could not send confirmation email:", emailErr);
  }

  return {
    ok: true,
    success: true,
    serial: data.serial,
    emailSent,
  };
}

/** @returns {Promise<{ok: true, token: string} | {ok: false, error: string}>} */
export async function adminLogin(password) {
  if (password && password === PASSWORD) {
    return {
      ok: true,
      token: AUTH_TOKEN_KEY
    };
  }
  return {
    ok: false,
    error: "Incorrect password. Please try again."
  };
}

/** @returns {Promise<Array<{id, serial, name, role, profession, phone, present}>>} */
export async function fetchParticipants() {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return [];
  }
  return data.map(({ id, serial, name, role, profession, phone, present }) => ({
    id,
    serial,
    name,
    role: role === "visitor" ? "Visitor" : role === "speaker" ? "Speaker" : role,
    profession,
    phone,
    present
  }));
}

export async function checkInParticipant(query) {
  const needle = String(query ?? "").trim();
  if (!needle) {
    return {
      ok: false,
      error: "No match found."
    };
  }

  const { data, error } = await supabase
    .from("participants")
    .select("id")
    .or(`serial.ilike.${needle}, name.ilike.${needle}, email.ilike.${needle}`)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      error: "No match found."
    };
  }

  const { error: updateError } = await supabase
    .from("participants")
    .update({ present: true })
    .eq("id", data.id);

  if (updateError) {
    return {
      ok: false,
      error: "Failed to check in participant. Please try again."
    };
  }

  return {
    ok: true,
    message: "Participant checked in successfully."
  };
}

/** @returns {Promise<{ok: true} | {ok: false, error: string}>} */
export async function setParticipantPresent(id, present) {
  const { error } = await supabase
    .from("participants")
    .update({ present })
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      error: "Failed to update participant status. Please try again."
    };
  }

  return {
    ok: true
  };
}

export async function deleteParticipant(id) {
  const { data, error } = await supabase
    .from("participants")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return {
      ok: false,
      error: "Failed to delete participant. Please try again."
    };
  }

  const count = data?.length ?? 0;
  if (!count) {
    return {
      ok: false,
      error: "No participant found with the given ID."
    };
  }

  return {
    ok: true
  };
}
