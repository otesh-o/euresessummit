import { createClient } from "@supabase/supabase-js";

const supabaseurl = import.meta.env.VITE_SUPABASE_URL;
const supabasekey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseurl, supabasekey);

/**
 * Single seam between the UI and the (not yet existing) backend.
 *
 * Every export is an async function that resolves plain data and never
 * throws for an expected failure — business errors come back as
 * `{ ok: false, error }`. Callers therefore stay identical whether the body
 * below is a mock or a real request:
 *
 *   // mock (now)                      // real (later)
 *   await adminLogin(password)        await request("/api/admin/login", {...})
 *   return { ok: true, token }        return parse(await request(...))
 *
 * To go live, replace each `mockBody` with a fetch() and keep the exported
 * signature, the arguments and the resolved shape exactly as they are here.
 * Nothing outside this file needs to change.
 */

const PASSWORD = import.meta.env.VITE_PASSWORD;

export const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN;

const isFailed = (value) => typeof value === "string" && value.trim().length > 0;

/** @returns {Promise<{ok: true, serial: string, duplicate?: boolean} | {ok: false, error: string}>} */
export async function registerParticipant({
  name,
  email,
  phone,
  role,
  profession,
} = {}) {
  if (![name, email, phone, role, profession].every(isFailed)) {
    return {
      ok: false,
      error: "All fields are required to be filled before submitting the form."
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
      serial: existing.serial,
      duplicate: true,
    };
  }

  const { data, error } = await supabase
    .from("participants")
    .insert({
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: role.toLowerCase(),
      profession: profession.trim(),
    })
    .select("serial")
    .single();

  if (error) {
    return {
      ok: false,
      error: "We couldn't reach the server. Please check your internet connection and try again."
    }
  }

  return {
    ok: true,
    serial: data.serial
  };
}

/** @returns {Promise<{ok: true, token: string} | {ok: false, error: string}>} */
export async function adminLogin(password) {
  if (password === PASSWORD) {
    return {
      ok: true,
      token: "AUTH_TOKEN_KEY"
    };
  }
  return {
    ok: false,
    error: "Incorrect password. Please try again."
  }
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
      error: "No match Found"
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
      error: "No match found"
    }
  }

  const { error: updtaeError } = await supabase
    .from("participants")
    .update({ present: true })
    .eq("id", data.id);

  if (updtaeError) {
    return {
      ok: false,
      error: "Failed to check in participant. Please try again."
    }
  }

  return {
    ok: true,
    message: "Participant checked in successfully."
  }
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
    }
  }

  return {
    ok: true
  }
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
    }
  }

  const count = data?.length ?? 0;
  if (!count) {
    return {
      ok: false,
      error: "No participant found with the given ID."
    }
  }
}
