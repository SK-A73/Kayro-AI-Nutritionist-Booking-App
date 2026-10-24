import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  SAMPLE_APPOINTMENTS,
  normalizeDate,
  normalizeTime,
} from "../data/initialData";

const STORAGE_KEY = "kayro_appointments_v1";
const SYNC_EVENT = "kayro:appointments_changed";

/**
 * Initialize or get local storage appointments
 */
function getLocalAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_APPOINTMENTS));
      return SAMPLE_APPOINTMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : SAMPLE_APPOINTMENTS;
  } catch (err) {
    console.warn("Error reading localStorage, using initial sample data:", err);
    return SAMPLE_APPOINTMENTS;
  }
}

/**
 * Save appointments to local storage and broadcast to other tabs/listeners
 */
function saveLocalAppointments(appointments) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT, { detail: appointments })
    );
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
}

/**
 * Check if a slot is already booked
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
 * Fetch all appointments from Supabase (if configured) or localStorage fallback
 */
export async function fetchAppointments() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) {
        console.warn("Supabase query failed, falling back to local storage:", error.message);
        return getLocalAppointments();
      }

      if (data && data.length > 0) {
        // Cache to local storage
        saveLocalAppointments(data);
        return data;
      } else {
        // If Supabase table is empty, seed it with sample data
        for (const item of SAMPLE_APPOINTMENTS) {
          const { id, ...cleanItem } = item;
          await supabase.from("appointments").insert(cleanItem);
        }
        return SAMPLE_APPOINTMENTS;
      }
    } catch (err) {
      console.warn("Supabase connection exception:", err);
      return getLocalAppointments();
    }
  }

  return getLocalAppointments();
}

/**
 * Create a new appointment
 */
export async function createAppointment(appointment) {
  const current = getLocalAppointments();
  const normDate = normalizeDate(appointment.appointment_date);
  const normTime = normalizeTime(appointment.appointment_time);

  if (checkSlotConflict(current, normDate, normTime)) {
    throw new Error("This slot is already booked. Please choose another time.");
  }

  const newAppointment = {
    ...appointment,
    id: `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    appointment_date: normDate,
    appointment_time: normTime,
    status: appointment.status || "Booked",
    is_confirmed: Boolean(appointment.is_confirmed),
    consultation_focus: appointment.consultation_focus || "General Nutrition Checkup",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { id, ...payload } = newAppointment;
      const { data, error } = await supabase
        .from("appointments")
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        const updated = [...current, data];
        saveLocalAppointments(updated);
        return data;
      }
    } catch (err) {
      console.warn("Supabase insert failed, storing locally:", err);
    }
  }

  const updated = [...current, newAppointment];
  saveLocalAppointments(updated);
  return newAppointment;
}

/**
 * Update an appointment (e.g. status, reschedule date/time, attendance confirmation)
 */
export async function updateAppointment(id, updates) {
  const current = getLocalAppointments();

  // If date or time changed, check conflict
  if (updates.appointment_date || updates.appointment_time) {
    const existing = current.find((a) => String(a.id) === String(id));
    const targetDate = updates.appointment_date || existing?.appointment_date;
    const targetTime = updates.appointment_time || existing?.appointment_time;

    if (checkSlotConflict(current, targetDate, targetTime, id)) {
      throw new Error("Selected time slot is already reserved. Please choose another slot.");
    }
  }

  if (updates.appointment_date) {
    updates.appointment_date = normalizeDate(updates.appointment_date);
  }
  if (updates.appointment_time) {
    updates.appointment_time = normalizeTime(updates.appointment_time);
  }

  const updatedList = current.map((item) =>
    String(item.id) === String(id) ? { ...item, ...updates } : item
  );
  saveLocalAppointments(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      // If id is numeric in Supabase or UUID
      await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id);
    } catch (err) {
      console.warn("Supabase update error:", err);
    }
  }

  return updatedList.find((a) => String(a.id) === String(id));
}

/**
 * Reschedule appointment to a new date and time
 */
export async function rescheduleAppointment(id, newDate, newTime) {
  return updateAppointment(id, {
    appointment_date: newDate,
    appointment_time: newTime,
    is_confirmed: false, // Reset confirmation so client confirms new time
    status: "Booked",
  });
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id) {
  return updateAppointment(id, {
    status: "Cancelled",
  });
}

/**
 * Confirm attendance (1-tap no-show solution)
 */
export async function confirmAttendance(id) {
  return updateAppointment(id, {
    is_confirmed: true,
  });
}

/**
 * Reset data back to assignment sample data
 */
export async function resetToSampleData() {
  saveLocalAppointments(SAMPLE_APPOINTMENTS);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("appointments").delete().neq("id", 0);
      for (const item of SAMPLE_APPOINTMENTS) {
        const { id, ...cleanItem } = item;
        await supabase.from("appointments").insert(cleanItem);
      }
    } catch (err) {
      console.warn("Supabase reset failed:", err);
    }
  }
  return SAMPLE_APPOINTMENTS;
}

/**
 * Real-time synchronization subscriber
 */
export function subscribeToAppointments(onUpdate) {
  const handleCustomSync = (e) => {
    if (e.detail) {
      onUpdate(e.detail);
    } else {
      fetchAppointments().then(onUpdate);
    }
  };

  const handleStorageSync = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        onUpdate(JSON.parse(e.newValue));
      } catch {
        fetchAppointments().then(onUpdate);
      }
    }
  };

  window.addEventListener(SYNC_EVENT, handleCustomSync);
  window.addEventListener("storage", handleStorageSync);

  let supabaseChannel = null;
  if (isSupabaseConfigured && supabase) {
    try {
      supabaseChannel = supabase
        .channel("public:appointments")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "appointments" },
          () => {
            fetchAppointments().then(onUpdate);
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("Supabase realtime subscription failed:", e);
    }
  }

  return () => {
    window.removeEventListener(SYNC_EVENT, handleCustomSync);
    window.removeEventListener("storage", handleStorageSync);
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}
