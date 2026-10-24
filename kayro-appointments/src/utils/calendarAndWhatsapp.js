import { normalizeDate, normalizeTime, formatDisplayDate, formatDisplayTime } from "../data/initialData";

/**
 * Generates a Google Calendar "Add Event" URL
 */
export function getGoogleCalendarUrl(appointment) {
  const normDate = normalizeDate(appointment.appointment_date);
  const normTime = normalizeTime(appointment.appointment_time);
  
  // Format YYYYMMDDTHHmm00
  const dateParts = normDate.split("-");
  const timeParts = normTime.split(":");
  
  if (dateParts.length !== 3 || timeParts.length !== 2) return "#";

  const startYear = dateParts[0];
  const startMonth = dateParts[1];
  const startDay = dateParts[2];
  const startHour = timeParts[0];
  const startMinute = timeParts[1];

  // Duration 45 minutes
  const startDate = new Date(
    parseInt(startYear, 10),
    parseInt(startMonth, 10) - 1,
    parseInt(startDay, 10),
    parseInt(startHour, 10),
    parseInt(startMinute, 10)
  );
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

  const formatCalTime = (d) => {
    return d.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const title = encodeURIComponent(`Nutrition Consultation · Kayro Wellness (${appointment.consultation_focus || "Consultation"})`);
  const details = encodeURIComponent(
    `Your personalized nutrition consultation with Dr. Kayro.\nClient: ${appointment.client_name}\nFocus: ${appointment.consultation_focus || "General Wellness"}\n\nNeed to reschedule? Please inform at least 2 hours prior.`
  );
  const location = encodeURIComponent("Kayro Wellness Studio / Video Consultation");

  const datesParam = `${formatCalTime(startDate)}/${formatCalTime(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
}

/**
 * Downloads a universal iCalendar (.ics) file for Apple Calendar, Outlook, and Android
 */
export function downloadIcsFile(appointment) {
  const normDate = normalizeDate(appointment.appointment_date);
  const normTime = normalizeTime(appointment.appointment_time);
  const dateParts = normDate.split("-");
  const timeParts = normTime.split(":");

  if (dateParts.length !== 3 || timeParts.length !== 2) return;

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  const hour = timeParts[0];
  const minute = timeParts[1];

  const startDate = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10)
  );
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

  const formatIcsTime = (d) => {
    return d.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kayro Wellness//Appointment Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:kayro-${appointment.id}-${Date.now()}@kayro.io`,
    `DTSTAMP:${formatIcsTime(new Date())}`,
    `DTSTART:${formatIcsTime(startDate)}`,
    `DTEND:${formatIcsTime(endDate)}`,
    `SUMMARY:Nutrition Consultation · Kayro Wellness (${appointment.client_name})`,
    `DESCRIPTION:Personalized Nutrition Consultation. Focus: ${appointment.consultation_focus || "General Wellness"}`,
    "LOCATION:Kayro Wellness Studio",
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT120M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Upcoming Kayro Nutrition Consultation in 2 hours",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `kayro-consultation-${normDate}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds pre-filled WhatsApp reminders for Nutritionist -> Client
 */
export function getWhatsAppReminderLink(appointment) {
  if (!appointment.client_phone) return null;
  const rawDigits = appointment.client_phone.replace(/[^\d]/g, "");
  if (!rawDigits) return null;

  // Append Indian country code 91 if 10 digits
  const phone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

  const dateStr = formatDisplayDate(appointment.appointment_date);
  const timeStr = formatDisplayTime(appointment.appointment_time);

  const text = encodeURIComponent(
    `Hello ${appointment.client_name}! 🌿 This is Dr. Kayro Nutrition.\n\nLooking forward to your consultation on *${dateStr}* at *${timeStr}* (${appointment.consultation_focus || "Nutrition Review"}).\n\nCould you please reply *YES* to confirm your attendance, or let us know if you need to reschedule?\n\nThank you for prioritizing your wellness!`
  );

  return `https://wa.me/${phone}?text=${text}`;
}
