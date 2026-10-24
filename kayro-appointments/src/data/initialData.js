/**
 * KAYRO WELLNESS APPOINTMENTS — INITIAL SAMPLE DATA & NORMALIZERS
 * Implements clean ingestion of inconsistent dates/times from Excel/WhatsApp
 */

export const AVAILABLE_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "11:30",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export const CONSULTATION_TYPES = [
  { id: "gut", label: "Gut Health & Digestion", duration: "45 min" },
  { id: "hormone", label: "PCOS & Hormonal Nutrition", duration: "45 min" },
  { id: "energy", label: "Energy & Sports Performance", duration: "45 min" },
  { id: "weight", label: "Holistic Weight Wellness", duration: "45 min" },
  { id: "general", label: "General Nutrition Checkup", duration: "30 min" },
];

/**
 * Normalizes varied date strings (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) into standard YYYY-MM-DD
 */
export function normalizeDate(input) {
  if (!input) return "";
  const trimmed = String(input).trim();
  
  // Matches DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Matches YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

/**
 * Normalizes varied time strings ("4 pm", "11:30am", "14:00", "09:00") into standard HH:mm (24-hour)
 */
export function normalizeTime(input) {
  if (!input) return "10:00";
  const trimmed = String(input).trim().toLowerCase();

  // Match e.g. "4 pm", "4pm", "11:30am", "9:00 am"
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minute = ampmMatch[2] ? ampmMatch[2] : "00";
    const period = ampmMatch[3];

    if (period === "pm" && hour < 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;

    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  // Match 24-hr format like "14:00" or "9:00"
  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const hour = h24Match[1].padStart(2, "0");
    const minute = h24Match[2];
    return `${hour}:${minute}`;
  }

  return trimmed;
}

/**
 * Normalizes phone numbers for display and WhatsApp link generation
 */
export function normalizePhone(input) {
  if (!input) return "";
  return String(input).replace(/[^\d+]/g, "").trim();
}

/**
 * Clean phone formatter with readable spaces for UI display
 */
export function formatPhoneDisplay(phone) {
  if (!phone) return "Not provided";
  const digits = String(phone).replace(/[^\d]/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Format date for friendly human display (e.g., "Sat, 24 Oct 2026")
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const iso = normalizeDate(dateStr);
  const parts = iso.split("-");
  if (parts.length === 3) {
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return dateStr;
}

/**
 * Format time to 12-hour AM/PM display (e.g. "10:00 AM", "04:00 PM")
 */
export function formatDisplayTime(timeStr) {
  if (!timeStr) return "";
  const normalized = normalizeTime(timeStr);
  const [h, m] = normalized.split(":").map((v) => parseInt(v, 10));
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m || 0).padStart(2, "0")} ${period}`;
}

/**
 * Required sample appointments from prompt, fully standardized
 */
export const SAMPLE_APPOINTMENTS = [
  {
    id: "apt-1",
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
    id: "apt-2",
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
    id: "apt-3",
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
    id: "apt-4",
    client_name: "Meera Iyer",
    client_phone: "",
    appointment_date: "2026-10-23",
    appointment_time: "09:00",
    status: "Done",
    is_confirmed: true,
    consultation_focus: "PCOS & Hormonal Nutrition",
    notes: "Initial consultation completed. Shared blood work review & high protein breakfast recipe pack.",
  },
  {
    id: "apt-5",
    client_name: "Kabir Rao",
    client_phone: "98200 33333",
    appointment_date: "2026-10-22",
    appointment_time: "14:00",
    status: "No-show",
    is_confirmed: false,
    consultation_focus: "Holistic Weight Wellness",
    notes: "Did not attend consultation. No prior message received. Flagged for follow-up message.",
  },
];
