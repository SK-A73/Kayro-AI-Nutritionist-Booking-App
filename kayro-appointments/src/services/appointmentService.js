import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  normalizeDate,
  normalizeTime,
  formatDisplayDate,
} from "../data/initialData";

/**
 * Cleanly format database record from Supabase PostgreSQL
 */
export function formatAppointmentRecord(row) {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    appointment_date: normalizeDate(row.appointment_date),
    appointment_time: normalizeTime(row.appointment_time),
    is_confirmed: Boolean(row.is_confirmed),
    client_name: row.client_name ? String(row.client_name).trim() : "Unknown Client",
    client_phone: row.client_phone ? String(row.client_phone).trim() : "",
    consultation_focus: row.consultation_focus || "General Nutrition Checkup",
    notes: row.notes || "",
    status: row.status || "Booked",
  };
}

/**
 * Check if a slot is already booked in an array of appointments
 */
export function checkSlotConflict(appointments, date, time, excludeId = null) {
  const normDate = normalizeDate(date);
  const normTime = normalizeTime(time);

  return appointments.some((apt) => {
    if (excludeId && String(apt.id) === String(excludeId)) return false;
    return (
      normalizeDate(apt.appointment_date) === normDate &&
      normalizeTime(apt.appointment_time) === normTime &&
      apt.status === "Booked"
    );
  });
}

/**
 * Fetch all appointments from Supabase PostgreSQL (Single source of truth)
 */
export async function fetchAppointments() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "Supabase connection is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message || "Failed to load appointments from Supabase.");
  }

  return (data || []).map(formatAppointmentRecord);
}

/**
 * Create a new appointment in Supabase
 */
export async function createAppointment(appointment) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "Supabase is not configured. Cannot save appointment without live database."
    );
  }

  const normDate = normalizeDate(appointment.appointment_date);
  const normTime = normalizeTime(appointment.appointment_time);

  // 1. Conflict check in Supabase to strictly prevent double booking
  const { data: conflicts, error: checkError } = await supabase
    .from("appointments")
    .select("id, client_name")
    .eq("appointment_date", normDate)
    .eq("appointment_time", normTime)
    .eq("status", "Booked");

  if (checkError) {
    console.error("Supabase conflict check error:", checkError);
  }

  if (conflicts && conflicts.length > 0) {
    throw new Error(
      `The ${normTime} slot on ${formatDisplayDate(
        normDate
      )} is already booked. Please choose an alternative slot.`
    );
  }

  // 2. Insert into Supabase appointments table
  const payload = {
    client_name: appointment.client_name.trim(),
    client_phone: appointment.client_phone ? appointment.client_phone.trim() : "",
    appointment_date: normDate,
    appointment_time: normTime,
    status: appointment.status || "Booked",
    is_confirmed: Boolean(appointment.is_confirmed),
    consultation_focus: appointment.consultation_focus || "General Nutrition Checkup",
    notes: appointment.notes ? appointment.notes.trim() : "",
  };

  const { data, error } = await supabase
    .from("appointments")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message || "Failed to create appointment in Supabase.");
  }

  return formatAppointmentRecord(data);
}

/**
 * Update appointment in Supabase
 */
export async function updateAppointment(id, updates) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }

  const payload = { ...updates };
  if (payload.appointment_date) {
    payload.appointment_date = normalizeDate(payload.appointment_date);
  }
  if (payload.appointment_time) {
    payload.appointment_time = normalizeTime(payload.appointment_time);
  }

  // If rescheduling (date or time changed), verify no conflict in Supabase
  if (payload.appointment_date || payload.appointment_time) {
    const { data: currentApt } = await supabase
      .from("appointments")
      .select("appointment_date, appointment_time")
      .eq("id", id)
      .single();

    const targetDate = payload.appointment_date || currentApt?.appointment_date;
    const targetTime = payload.appointment_time || currentApt?.appointment_time;

    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", targetDate)
      .eq("appointment_time", targetTime)
      .eq("status", "Booked")
      .neq("id", id);

    if (conflicts && conflicts.length > 0) {
      throw new Error("That slot is already booked. Please choose another slot.");
    }
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    throw new Error(error.message || "Failed to update appointment in Supabase.");
  }

  return formatAppointmentRecord(data);
}

/**
 * Reschedule appointment to a new date and time in Supabase
 */
export async function rescheduleAppointment(id, newDate, newTime) {
  return updateAppointment(id, {
    appointment_date: newDate,
    appointment_time: newTime,
    is_confirmed: false, // Reset confirmation so client can re-confirm new slot
    status: "Booked",
  });
}

/**
 * Cancel an appointment in Supabase
 */
export async function cancelAppointment(id) {
  return updateAppointment(id, {
    status: "Cancelled",
  });
}

/**
 * Confirm attendance in Supabase (1-tap no-show solution)
 */
export async function confirmAttendance(id) {
  return updateAppointment(id, {
    is_confirmed: true,
  });
}

/**
 * Reset data back to assignment sample data in Supabase
 */
export async function resetToSampleData() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }

  // Clear existing
  const { error: delError } = await supabase
    .from("appointments")
    .delete()
    .neq("id", 0);

  if (delError) {
    console.warn("Error clearing Supabase appointments:", delError);
  }

  // Seed sample data
  const sampleItems = [
    {
      client_name: "Riya Shah",
      client_phone: "98200 11111",
      appointment_date: "2026-10-24",
      appointment_time: "10:00",
      status: "Booked",
      is_confirmed: true,
      consultation_focus: "Gut Health & Digestion",
      notes: "Follow-up on low-FODMAP meal plan. Client confirmed attendance via 1-tap nudge.",
    },
    {
      client_name: "Arjun Mehta",
      client_phone: "98200 22222",
      appointment_date: "2026-10-24",
      appointment_time: "11:30",
      status: "Booked",
      is_confirmed: false,
      consultation_focus: "Sports Nutrition & Energy",
      notes: "Pre-marathon carb-loading strategy and hydration schedule.",
    },
    {
      client_name: "Riya Shah",
      client_phone: "98200 11111",
      appointment_date: "2026-10-25",
      appointment_time: "16:00",
      status: "Booked",
      is_confirmed: false,
      consultation_focus: "Gut Health & Digestion",
      notes: "Secondary review session to evaluate symptom journal.",
    },
    {
      client_name: "Meera Iyer",
      client_phone: "",
      appointment_date: "2026-10-23",
      appointment_time: "09:00",
      status: "Done",
      is_confirmed: true,
      consultation_focus: "PCOS & Hormonal Nutrition",
      notes: "Initial consultation completed. Shared blood work review & high protein recipe pack.",
    },
    {
      client_name: "Kabir Rao",
      client_phone: "98200 33333",
      appointment_date: "2026-10-22",
      appointment_time: "14:00",
      status: "No-show",
      is_confirmed: false,
      consultation_focus: "Holistic Weight Wellness",
      notes: "Did not attend consultation. No prior message received.",
    },
  ];

  const { data, error } = await supabase
    .from("appointments")
    .insert(sampleItems)
    .select();

  if (error) {
    throw new Error(error.message || "Failed to reset sample data in Supabase.");
  }

  return (data || []).map(formatAppointmentRecord);
}

/**
 * Real-time synchronization subscriber via Supabase Realtime + Focus listener + Polling fallback
 */
export function subscribeToAppointments(onUpdate) {
  if (!isSupabaseConfigured || !supabase) return () => {};

  // 1. Supabase Realtime Channel
  let channel = null;
  try {
    channel = supabase
      .channel("public:appointments_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          fetchAppointments().then(onUpdate).catch(console.error);
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("Supabase realtime subscription failed:", err);
  }

  // 2. Refetch on Window Focus (instant synchronization when switching tabs or browser windows)
  const handleFocus = () => {
    fetchAppointments().then(onUpdate).catch(() => {});
  };
  window.addEventListener("focus", handleFocus);

  // 3. Polling interval every 4 seconds to guarantee sync even across devices
  const pollInterval = setInterval(() => {
    fetchAppointments().then(onUpdate).catch(() => {});
  }, 4000);

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
    window.removeEventListener("focus", handleFocus);
    clearInterval(pollInterval);
  };
}
