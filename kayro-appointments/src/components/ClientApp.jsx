import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Calendar,
  Clock,
  Phone,
  User,
  Sparkles,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
  XCircle,
  HeartHandshake,
  AlertCircle,
  ArrowRight,
  Globe,
} from "lucide-react";
import {
  AVAILABLE_SLOTS,
  CONSULTATION_TYPES,
  formatDisplayDate,
  formatDisplayTime,
  formatPhoneDisplay,
  normalizeDate,
  normalizeTime,
} from "../data/initialData";
import {
  checkSlotConflict,
  createAppointment,
  confirmAttendance,
} from "../services/appointmentService";
import {
  getGoogleCalendarUrl,
  downloadIcsFile,
} from "../utils/calendarAndWhatsapp";

export default function ClientApp({
  appointments = [],
  onRefresh,
  onOpenReschedule,
  onOpenCancel,
  selectedClient = "all",
  setSelectedClient,
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Booking Form State
  const [formData, setFormData] = useState({
    name: selectedClient && selectedClient !== "all" ? selectedClient : "",
    phone: "",
    date: "2026-10-26",
    time: "10:00",
    focus: "Gut Health & Digestion",
    notes: "",
  });

  const [formError, setFormError] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [justBooked, setJustBooked] = useState(null);
  const [clientTab, setClientTab] = useState("upcoming");

  // Dynamically derive client profiles from live Supabase appointments
  const clientProfiles = useMemo(() => {
    const clientMap = new Map();

    // Default base clients from initial data
    const defaults = ["Riya Shah", "Arjun Mehta", "Meera Iyer", "Kabir Rao"];
    defaults.forEach((name) => {
      clientMap.set(name.toLowerCase(), {
        name,
        phone: "",
        count: 0,
      });
    });

    // Merge in all actual clients from Supabase
    appointments.forEach((apt) => {
      const rawName = apt.client_name?.trim();
      if (!rawName) return;
      const key = rawName.toLowerCase();
      if (clientMap.has(key)) {
        const item = clientMap.get(key);
        item.count += 1;
        if (!item.phone && apt.client_phone) item.phone = apt.client_phone;
      } else {
        clientMap.set(key, {
          name: rawName,
          phone: apt.client_phone || "",
          count: 1,
        });
      }
    });

    return Array.from(clientMap.values());
  }, [appointments]);

  const handleSelectClient = (profile) => {
    setSelectedClient(profile.name);
    setFormData((prev) => ({
      ...prev,
      name: profile.name,
      phone: profile.phone || prev.phone,
    }));
    setJustBooked(null);
    setFormError("");
  };

  // Filter client's appointments based on selected client or "all"
  const clientAppointments = useMemo(() => {
    if (!selectedClient || selectedClient.toLowerCase() === "all") {
      return appointments;
    }
    return appointments.filter(
      (a) =>
        a.client_name?.trim().toLowerCase() ===
        selectedClient.trim().toLowerCase()
    );
  }, [appointments, selectedClient]);

  // Next upcoming appointment
  const nextAppointment = useMemo(() => {
    const upcoming = clientAppointments.filter((a) => a.status === "Booked");
    upcoming.sort((a, b) =>
      `${a.appointment_date} ${a.appointment_time}`.localeCompare(
        `${b.appointment_date} ${b.appointment_time}`
      )
    );
    return upcoming[0] || null;
  }, [clientAppointments]);

  // Upcoming appointments list
  const upcomingAppointmentsList = useMemo(() => {
    return clientAppointments
      .filter((a) => a.status === "Booked")
      .sort((a, b) =>
        `${a.appointment_date} ${a.appointment_time}`.localeCompare(
          `${b.appointment_date} ${b.appointment_time}`
        )
      );
  }, [clientAppointments]);

  // Past appointments list
  const pastAppointmentsList = useMemo(() => {
    return clientAppointments
      .filter(
        (a) =>
          a.status === "Done" ||
          a.status === "No-show" ||
          a.status === "Cancelled"
      )
      .sort((a, b) =>
        `${b.appointment_date} ${b.appointment_time}`.localeCompare(
          `${a.appointment_date} ${a.appointment_time}`
        )
      );
  }, [clientAppointments]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleSlotPick = (slot) => {
    setFormData((prev) => ({ ...prev, time: slot }));
    setFormError("");
  };

  const handleConfirmAttendance = async (id) => {
    try {
      await confirmAttendance(id);
      await onRefresh();
    } catch (err) {
      console.error("Attendance confirmation error:", err);
    }
  };

  // Submit Booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Please enter your contact phone number.");
      return;
    }

    const normDate = normalizeDate(formData.date);
    const normTime = normalizeTime(formData.time);

    // Double-booking check
    const isConflict = checkSlotConflict(appointments, normDate, normTime);
    if (isConflict) {
      setFormError(
        `The ${normTime} slot on ${formatDisplayDate(
          normDate
        )} is already booked. Please pick an alternative time.`
      );
      return;
    }

    setIsBooking(true);
    try {
      const created = await createAppointment({
        client_name: formData.name.trim(),
        client_phone: formData.phone.trim(),
        appointment_date: normDate,
        appointment_time: normTime,
        consultation_focus: formData.focus,
        notes: formData.notes.trim(),
        is_confirmed: true, // Auto-confirm on client direct booking
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#5C7C68", "#C87A53", "#3B5A45", "#E8C872"],
        });
      } catch {
        // Safe fallback
      }

      setJustBooked(created);
      setSelectedClient(formData.name.trim());
      await onRefresh();
    } catch (err) {
      setFormError(err.message || "Failed to schedule appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  const isAllView = !selectedClient || selectedClient.toLowerCase() === "all";

  return (
    <div className="client-app-shell">
      {/* Reviewer / Active Client Selector Bar */}
      <section className="reviewer-context-bar" aria-label="Reviewer Client Selector">
        <div className="reviewer-bar-inner">
          <span className="reviewer-label">
            <User size={14} /> Active Client View:
          </span>
          <div className="client-pills">
            <button
              type="button"
              className={`client-pill ${isAllView ? "active" : ""}`}
              onClick={() => {
                setSelectedClient("all");
                setJustBooked(null);
                setFormError("");
              }}
            >
              <Globe size={13} />
              <span>All Practice Visits ({appointments.length})</span>
              {isAllView && <CheckCircle2 size={12} />}
            </button>

            {clientProfiles.map((profile) => {
              const isSelected =
                !isAllView &&
                selectedClient.toLowerCase() === profile.name.toLowerCase();
              return (
                <button
                  key={profile.name}
                  type="button"
                  className={`client-pill ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectClient(profile)}
                >
                  <span>{profile.name}</span>
                  {profile.count > 0 && (
                    <span className="pill-count">({profile.count})</span>
                  )}
                  {isSelected && <CheckCircle2 size={12} />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hero Welcome */}
      <section className="client-hero">
        <div className="hero-eyebrow">
          <Sparkles size={14} className="sparkle-icon" />
          <span>PERSONALIZED NUTRITION CARE</span>
        </div>
        <h1 className="hero-title">
          Wellness starts with<br />showing up for yourself.
        </h1>
        <p className="hero-subtitle">
          {isAllView
            ? "Practice-wide schedule synchronized in real time with the Nutritionist Dashboard."
            : `Viewing consultations for ${selectedClient}. Calm, evidence-based nutrition care designed around your life.`}
        </p>
      </section>

      {/* Main Grid: Next Visit Card + Booking Form */}
      <div className="client-main-grid">
        {/* Next Visit Spotlight */}
        <section className="client-spotlight-panel" aria-label="Next Visit">
          <div className="panel-badge-row">
            <span className="panel-eyebrow">
              {isAllView ? "NEXT UPCOMING PRACTICE CONSULTATION" : `NEXT VISIT FOR ${selectedClient.toUpperCase()}`}
            </span>
            {nextAppointment?.is_confirmed && (
              <span className="attendance-pill confirmed">
                ✓ Attendance Confirmed
              </span>
            )}
          </div>

          {nextAppointment ? (
            <div className="spotlight-content">
              <h2 className="spotlight-title">
                {isAllView
                  ? `Upcoming: ${nextAppointment.client_name}`
                  : "You're making time for your health."}
              </h2>

              <div className="spotlight-card">
                <div className="spotlight-time-box">
                  <div className="calendar-tile">
                    <span className="cal-weekday">
                      {formatDisplayDate(nextAppointment.appointment_date).split(",")[0]}
                    </span>
                    <span className="cal-day">
                      {nextAppointment.appointment_date.split("-")[2]}
                    </span>
                  </div>
                  <div className="spotlight-details">
                    <strong className="spotlight-datetime">
                      {formatDisplayDate(nextAppointment.appointment_date)} at{" "}
                      {formatDisplayTime(nextAppointment.appointment_time)}
                    </strong>
                    <p className="spotlight-type">
                      {nextAppointment.client_name} · {nextAppointment.consultation_focus || "Holistic Nutrition"}
                    </p>
                    <p className="spotlight-doctor">
                      With Senior Clinical Nutritionist · 45 mins
                    </p>
                  </div>
                </div>

                {/* 1-Tap Attendance Confirmation */}
                {!nextAppointment.is_confirmed ? (
                  <div className="nudge-action-box">
                    <div className="nudge-text">
                      <strong>Can you still attend this session?</strong>
                      <p>
                        A quick confirmation gives our nutritionist peace of mind to prepare your personalized diet review.
                      </p>
                    </div>
                    <div className="nudge-buttons">
                      <button
                        type="button"
                        className="button-confirm-tap"
                        onClick={() => handleConfirmAttendance(nextAppointment.id)}
                      >
                        <CheckCircle2 size={15} />
                        <span>Yes, I will be there!</span>
                      </button>
                      <button
                        type="button"
                        className="button-text-reschedule"
                        onClick={() => onOpenReschedule(nextAppointment)}
                      >
                        Need to reschedule?
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="confirmed-celebration-box">
                    <CheckCircle2 size={16} className="confirmed-icon" />
                    <span>Attendance confirmed. We look forward to seeing you!</span>
                  </div>
                )}

                {/* Calendar Sync & Controls */}
                <div className="spotlight-controls">
                  <div className="calendar-dropdown-wrap">
                    <a
                      href={getGoogleCalendarUrl(nextAppointment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="control-button calendar-btn"
                    >
                      <CalendarPlus size={14} />
                      <span>Add to Google Calendar</span>
                    </a>
                    <button
                      type="button"
                      className="control-button ics-btn"
                      onClick={() => downloadIcsFile(nextAppointment)}
                      title="Download .ics for Apple Calendar or Outlook"
                    >
                      <span>.ICS</span>
                    </button>
                  </div>

                  <div className="change-actions">
                    <button
                      type="button"
                      className="control-button outline"
                      onClick={() => onOpenReschedule(nextAppointment)}
                    >
                      <RefreshCw size={13} />
                      <span>Reschedule</span>
                    </button>
                    <button
                      type="button"
                      className="control-button danger-outline"
                      onClick={() => onOpenCancel(nextAppointment)}
                    >
                      <XCircle size={13} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="wellness-tip-card">
                <HeartHandshake size={18} className="tip-icon" />
                <p>
                  <strong>Zero-Guilt Rescheduling:</strong> Rescheduling frees this slot for someone on our waitlist. No awkward phone calls required.
                </p>
              </div>
            </div>
          ) : (
            <div className="empty-spotlight">
              <div className="empty-icon-wrap">
                <Calendar size={28} />
              </div>
              <h3>No upcoming visits scheduled</h3>
              <p>
                {isAllView
                  ? "There are currently no active booked appointments. Reserve one using the form on the right!"
                  : `No upcoming visits scheduled for ${selectedClient}. Choose a time to book a consultation.`}
              </p>
            </div>
          )}
        </section>

        {/* Book a Consultation Form */}
        <section className="client-booking-panel" aria-label="Book a consultation">
          <div className="panel-badge-row">
            <span className="panel-eyebrow">RESERVE A SLOT</span>
            <span className="slot-guarantee-pill">Supabase Verified</span>
          </div>
          <h2 className="booking-title">Book a consultation</h2>
          <p className="booking-subtitle">
            Choose your preferred date and slot. Saves directly to Supabase.
          </p>

          {/* Success Banner if just booked */}
          {justBooked && (
            <div className="booking-success-banner" role="status">
              <div className="success-icon">
                <CheckCircle2 size={24} />
              </div>
              <div className="success-text">
                <strong>Appointment Confirmed & Saved to Supabase!</strong>
                <p>
                  Reserved for <strong>{justBooked.client_name}</strong> on{" "}
                  <strong>{formatDisplayDate(justBooked.appointment_date)}</strong> at{" "}
                  <strong>{formatDisplayTime(justBooked.appointment_time)}</strong>.
                </p>
                <div className="success-calendar-row">
                  <a
                    href={getGoogleCalendarUrl(justBooked)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-cal-small"
                  >
                    <CalendarPlus size={13} />
                    <span>Add to Google Calendar</span>
                  </a>
                  <button
                    type="button"
                    className="button-cal-small secondary"
                    onClick={() => downloadIcsFile(justBooked)}
                  >
                    Download .ICS
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="booking-form">
            <div className="form-group-row">
              <label className="form-label">
                <span>Your Full Name</span>
                <div className="input-with-icon">
                  <User size={15} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ananya Rao"
                    required
                  />
                </div>
              </label>

              <label className="form-label">
                <span>WhatsApp / Phone Number</span>
                <div className="input-with-icon">
                  <Phone size={15} className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 98200 44444"
                    required
                  />
                </div>
              </label>
            </div>

            {/* Consultation Focus */}
            <div className="form-section">
              <span className="form-label-text">Consultation Focus</span>
              <div className="focus-pills">
                {CONSULTATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`focus-pill ${
                      formData.focus === type.label ? "active" : ""
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, focus: type.label }))
                    }
                  >
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="form-group-row">
              <label className="form-label full-width">
                <span>Consultation Date</span>
                <div className="input-with-icon">
                  <Calendar size={15} className="input-icon" />
                  <input
                    type="date"
                    name="date"
                    min={todayStr}
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </label>
            </div>

            {/* Available Time Slots */}
            <div className="form-section">
              <div className="slots-header-row">
                <span className="form-label-text">Select Available Time</span>
                <span className="slots-instruction">
                  Slots automatically lock out conflicts
                </span>
              </div>

              <div className="slot-grid client-slots">
                {AVAILABLE_SLOTS.map((slot) => {
                  const isConflict = checkSlotConflict(
                    appointments,
                    formData.date,
                    slot
                  );
                  const isSelected = formData.time === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isConflict}
                      className={`slot-chip ${isSelected ? "selected" : ""} ${
                        isConflict ? "disabled" : ""
                      }`}
                      onClick={() => handleSlotPick(slot)}
                    >
                      <Clock size={13} />
                      <span>{formatDisplayTime(slot)}</span>
                      {isConflict && <span className="slot-tag-booked">Taken</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="alert-box error" role="alert">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              className="button-primary-large"
              disabled={isBooking}
            >
              <span>{isBooking ? "Saving to Supabase..." : "Confirm My Consultation"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </section>
      </div>

      {/* Appointment History / Journey Section */}
      <section className="client-journey-section" aria-label="Appointment History">
        <div className="journey-header">
          <div>
            <span className="panel-eyebrow">YOUR WELLNESS LOG</span>
            <h2 className="journey-title">
              {isAllView
                ? `All Consultations (${appointments.length})`
                : `Consultation history for ${selectedClient}`}
            </h2>
          </div>

          <div className="journey-tabs">
            <button
              type="button"
              className={`journey-tab ${clientTab === "upcoming" ? "active" : ""}`}
              onClick={() => setClientTab("upcoming")}
            >
              Upcoming ({upcomingAppointmentsList.length})
            </button>
            <button
              type="button"
              className={`journey-tab ${clientTab === "past" ? "active" : ""}`}
              onClick={() => setClientTab("past")}
            >
              Past & Notes ({pastAppointmentsList.length})
            </button>
          </div>
        </div>

        <div className="appointment-card-list">
          {clientTab === "upcoming" ? (
            upcomingAppointmentsList.length > 0 ? (
              upcomingAppointmentsList.map((apt) => (
                <div key={apt.id} className="appointment-journey-card">
                  <div className="card-left">
                    <div className="card-cal-pill">
                      <span className="cal-day-num">
                        {apt.appointment_date.split("-")[2]}
                      </span>
                      <span className="cal-month">
                        {formatDisplayDate(apt.appointment_date).split(" ")[2]}
                      </span>
                    </div>
                    <div className="card-info">
                      <strong className="card-datetime">
                        {apt.client_name} · {formatDisplayDate(apt.appointment_date)} at{" "}
                        {formatDisplayTime(apt.appointment_time)}
                      </strong>
                      <p className="card-focus">
                        {apt.consultation_focus || "Nutrition Consultation"}
                        {apt.client_phone && ` · ${formatPhoneDisplay(apt.client_phone)}`}
                      </p>
                      <div className="card-badges">
                        <span className="status-badge booked">Booked</span>
                        {apt.is_confirmed ? (
                          <span className="confirmed-chip">
                            ✓ Attendance Confirmed
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="confirm-link-chip"
                            onClick={() => handleConfirmAttendance(apt.id)}
                          >
                            Tap to confirm attendance
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="button-sm outline"
                      onClick={() => onOpenReschedule(apt)}
                    >
                      <RefreshCw size={12} />
                      <span>Reschedule</span>
                    </button>
                    <button
                      type="button"
                      className="button-sm danger-text"
                      onClick={() => onOpenCancel(apt)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-history-box">
                <p>
                  {isAllView
                    ? "No upcoming consultations scheduled across the practice."
                    : `No upcoming consultations scheduled for ${selectedClient}.`}
                </p>
              </div>
            )
          ) : pastAppointmentsList.length > 0 ? (
            pastAppointmentsList.map((apt) => (
              <div key={apt.id} className="appointment-journey-card past">
                <div className="card-left">
                  <div className="card-info">
                    <strong className="card-datetime">
                      {apt.client_name} · {formatDisplayDate(apt.appointment_date)} at{" "}
                      {formatDisplayTime(apt.appointment_time)}
                    </strong>
                    <p className="card-focus">
                      {apt.consultation_focus || "Nutrition Consultation"}
                    </p>
                    {apt.notes && <p className="card-notes">"{apt.notes}"</p>}
                  </div>
                </div>
                <div className="card-right">
                  <span
                    className={`status-badge ${apt.status
                      .toLowerCase()
                      .replace("-", "")}`}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-history-box">
              <p>
                {isAllView
                  ? "No past consultations on record."
                  : `No past consultations on record for ${selectedClient}.`}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
