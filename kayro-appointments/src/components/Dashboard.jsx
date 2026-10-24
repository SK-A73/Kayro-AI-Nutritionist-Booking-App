import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Phone,
  User,
  PlusCircle,
  Filter,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Search,
  Check,
  TrendingDown,
  CalendarCheck,
  ChevronDown,
  ExternalLink,
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
  createAppointment,
  updateAppointment,
  checkSlotConflict,
  resetToSampleData,
} from "../services/appointmentService";
import { getWhatsAppReminderLink } from "../utils/calendarAndWhatsapp";

export default function Dashboard({
  appointments,
  onRefresh,
  onOpenReschedule,
}) {
  const todayStr = "2026-10-24"; // Practice today anchor matching assignment context

  // Filters & State
  const [onlyToday, setOnlyToday] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Manual Add Form
  const [manualForm, setManualForm] = useState({
    name: "",
    phone: "",
    date: todayStr,
    time: "10:00",
    focus: "General Nutrition Checkup",
    notes: "",
  });
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Compute Practice Metrics
  const metrics = useMemo(() => {
    const total = appointments.length;
    const booked = appointments.filter((a) => a.status === "Booked").length;
    const done = appointments.filter((a) => a.status === "Done").length;
    const noshow = appointments.filter((a) => a.status === "No-show").length;
    const confirmed = appointments.filter((a) => a.is_confirmed).length;
    
    // Past completed or missed
    const completedOrMissed = done + noshow;
    const noShowRate =
      completedOrMissed > 0
        ? Math.round((noshow / completedOrMissed) * 100)
        : 0;

    return { total, booked, done, noshow, confirmed, noShowRate };
  }, [appointments]);

  // Filtered Appointments
  const visibleAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        // Today filter
        if (onlyToday && normalizeDate(a.appointment_date) !== todayStr) {
          return false;
        }
        // Status filter
        if (statusFilter !== "all" && a.status !== statusFilter) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = a.client_name.toLowerCase().includes(q);
          const matchPhone = (a.client_phone || "").includes(q);
          const matchFocus = (a.consultation_focus || "").toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchFocus) return false;
        }
        return true;
      })
      .sort((a, b) =>
        `${a.appointment_date} ${a.appointment_time}`.localeCompare(
          `${b.appointment_date} ${b.appointment_time}`
        )
      );
  }, [appointments, onlyToday, statusFilter, searchQuery]);

  // Status Change Handler
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointment(id, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Toggle Attendance Confirmation
  const handleToggleConfirmed = async (id, currentVal) => {
    try {
      await updateAppointment(id, { is_confirmed: !currentVal });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Manual Appointment
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualError("");
    setManualSuccess("");

    if (!manualForm.name.trim()) {
      setManualError("Please enter client's name.");
      return;
    }

    const normDate = normalizeDate(manualForm.date);
    const normTime = normalizeTime(manualForm.time);

    // Double-booking check
    const isConflict = checkSlotConflict(appointments, normDate, normTime);
    if (isConflict) {
      setManualError(
        `Slot ${normTime} on ${formatDisplayDate(normDate)} is already booked. Please choose another.`
      );
      return;
    }

    setIsAdding(true);
    try {
      await createAppointment({
        client_name: manualForm.name.trim(),
        client_phone: manualForm.phone.trim(),
        appointment_date: normDate,
        appointment_time: normTime,
        consultation_focus: manualForm.focus,
        notes: manualForm.notes.trim(),
        status: "Booked",
        is_confirmed: false,
      });

      setManualSuccess("Appointment successfully scheduled!");
      setManualForm({
        name: "",
        phone: "",
        date: todayStr,
        time: "10:00",
        focus: "General Nutrition Checkup",
        notes: "",
      });
      onRefresh();
      setTimeout(() => setManualSuccess(""), 4000);
    } catch (err) {
      setManualError(err.message || "Failed to add appointment.");
    } finally {
      setIsAdding(false);
    }
  };

  // Reset to Sample Data
  const handleResetData = async () => {
    if (window.confirm("Reset all appointments back to original assignment sample data?")) {
      setIsResetting(true);
      try {
        await resetToSampleData();
        onRefresh();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="dashboard-shell">
      {/* Header and Controls */}
      <section className="dashboard-header">
        <div className="dashboard-title-row">
          <div>
            <span className="panel-eyebrow">CLINIC PRACTICE OVERVIEW</span>
            <h1 className="dashboard-heading">Consultation Management</h1>
            <p className="dashboard-subtitle">
              Real-time schedule synchronized with the client booking experience.
            </p>
          </div>

          <div className="dashboard-top-actions">
            <button
              type="button"
              className="button-ghost-outline"
              onClick={handleResetData}
              disabled={isResetting}
              title="Reset data back to assignment sample data"
            >
              <RotateCcw size={14} />
              <span>{isResetting ? "Resetting..." : "Reset Sample Data"}</span>
            </button>
            <button
              type="button"
              className="button-primary-compact"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <PlusCircle size={15} />
              <span>{showAddForm ? "Hide Form" : "Add by Hand"}</span>
            </button>
          </div>
        </div>

        {/* Practice Stats Cards */}
        <div className="dashboard-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon total">
              <CalendarCheck size={18} />
            </div>
            <div className="metric-text">
              <span className="metric-label">Total Appointments</span>
              <strong className="metric-value">{metrics.total}</strong>
              <span className="metric-hint">Across all dates</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon booked">
              <Clock size={18} />
            </div>
            <div className="metric-text">
              <span className="metric-label">Booked & Active</span>
              <strong className="metric-value">{metrics.booked}</strong>
              <span className="metric-hint">
                {metrics.confirmed} confirmed attendance
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon done">
              <CheckCircle size={18} />
            </div>
            <div className="metric-text">
              <span className="metric-label">Completed Consultations</span>
              <strong className="metric-value">{metrics.done}</strong>
              <span className="metric-hint">Diet plans provided</span>
            </div>
          </div>

          <div className={`metric-card ${metrics.noShowRate > 20 ? "alert" : ""}`}>
            <div className="metric-icon noshow">
              <AlertTriangle size={18} />
            </div>
            <div className="metric-text">
              <span className="metric-label">No-Shows</span>
              <div className="metric-value-row">
                <strong className="metric-value">{metrics.noshow}</strong>
                <span className="metric-badge-noshow">
                  {metrics.noShowRate}% historical rate
                </span>
              </div>
              <span className="metric-hint">Target: under 10%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Manual Booking Drawer / Card */}
      {showAddForm && (
        <section className="dashboard-manual-panel" aria-label="Manual Booking">
          <div className="panel-badge-row">
            <span className="panel-eyebrow">RECEPTION DESK</span>
            <h3>+ Add appointment by hand</h3>
          </div>

          <form onSubmit={handleManualSubmit} className="manual-form-grid">
            <label className="form-label">
              <span>Client Full Name</span>
              <input
                type="text"
                value={manualForm.name}
                onChange={(e) =>
                  setManualForm({ ...manualForm, name: e.target.value })
                }
                placeholder="e.g. Priyesh Patel"
                required
              />
            </label>

            <label className="form-label">
              <span>Phone / WhatsApp</span>
              <input
                type="tel"
                value={manualForm.phone}
                onChange={(e) =>
                  setManualForm({ ...manualForm, phone: e.target.value })
                }
                placeholder="e.g. 98200 44444"
              />
            </label>

            <label className="form-label">
              <span>Date</span>
              <input
                type="date"
                value={manualForm.date}
                onChange={(e) =>
                  setManualForm({ ...manualForm, date: e.target.value })
                }
                required
              />
            </label>

            <label className="form-label">
              <span>Time Slot</span>
              <select
                value={manualForm.time}
                onChange={(e) =>
                  setManualForm({ ...manualForm, time: e.target.value })
                }
              >
                {AVAILABLE_SLOTS.map((slot) => {
                  const isConflict = checkSlotConflict(
                    appointments,
                    manualForm.date,
                    slot
                  );
                  return (
                    <option key={slot} value={slot} disabled={isConflict}>
                      {formatDisplayTime(slot)} {isConflict ? "(Taken)" : ""}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="form-label">
              <span>Consultation Focus</span>
              <select
                value={manualForm.focus}
                onChange={(e) =>
                  setManualForm({ ...manualForm, focus: e.target.value })
                }
              >
                {CONSULTATION_TYPES.map((t) => (
                  <option key={t.id} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              <span>Initial Notes</span>
              <input
                type="text"
                value={manualForm.notes}
                onChange={(e) =>
                  setManualForm({ ...manualForm, notes: e.target.value })
                }
                placeholder="e.g. Referred by Dr. Verma, gluten sensitivity"
              />
            </label>

            <div className="manual-form-actions">
              <button
                type="submit"
                className="button-primary-compact"
                disabled={isAdding}
              >
                {isAdding ? "Saving..." : "Save Appointment"}
              </button>
              <button
                type="button"
                className="button-ghost"
                onClick={() => setShowAddForm(false)}
              >
                Close
              </button>
            </div>

            {manualError && (
              <div className="form-full-row alert-box error">
                <span>{manualError}</span>
              </div>
            )}
            {manualSuccess && (
              <div className="form-full-row alert-box success">
                <span>{manualSuccess}</span>
              </div>
            )}
          </form>
        </section>
      )}

      {/* Filter and Table Section */}
      <section className="dashboard-table-section">
        <div className="table-toolbar">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by client name, phone or focus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <button
              type="button"
              className={`filter-toggle-button ${onlyToday ? "active" : ""}`}
              onClick={() => setOnlyToday(!onlyToday)}
            >
              <Calendar size={14} />
              <span>{onlyToday ? "Showing: Today Only" : "Filter: Today Only"}</span>
            </button>

            <div className="status-filter-select-wrap">
              <Filter size={14} className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="Booked">Booked</option>
                <option value="Done">Done</option>
                <option value="No-show">No-show</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="table-responsive-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Phone / WhatsApp</th>
                <th>Consultation Date & Time</th>
                <th>Focus & Notes</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleAppointments.length > 0 ? (
                visibleAppointments.map((apt) => {
                  const whatsappLink = getWhatsAppReminderLink(apt);
                  const isToday =
                    normalizeDate(apt.appointment_date) === todayStr;

                  return (
                    <tr
                      key={apt.id}
                      className={`appointment-row-item ${
                        isToday ? "row-today" : ""
                      }`}
                    >
                      {/* Client */}
                      <td className="cell-client">
                        <strong className="client-name">{apt.client_name}</strong>
                        {isToday && (
                          <span className="badge-today-visit">TODAY</span>
                        )}
                      </td>

                      {/* Phone & WhatsApp Nudge */}
                      <td className="cell-phone">
                        <div className="phone-wrapper">
                          <span>{formatPhoneDisplay(apt.client_phone)}</span>
                          {whatsappLink && apt.status === "Booked" && (
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="whatsapp-nudge-btn"
                              title="Send 1-Click WhatsApp Reminder"
                            >
                              <MessageSquare size={13} />
                              <span>Nudge</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="cell-datetime">
                        <div className="datetime-stack">
                          <strong className="date-text">
                            {formatDisplayDate(apt.appointment_date)}
                          </strong>
                          <span className="time-text">
                            {formatDisplayTime(apt.appointment_time)}
                          </span>
                        </div>
                      </td>

                      {/* Focus */}
                      <td className="cell-focus">
                        <span className="focus-title">
                          {apt.consultation_focus || "General Wellness"}
                        </span>
                        {apt.notes && (
                          <p className="cell-notes-snippet" title={apt.notes}>
                            {apt.notes}
                          </p>
                        )}
                      </td>

                      {/* Attendance Confirmation Badge (No-Show Solver) */}
                      <td className="cell-confirmation">
                        {apt.status === "Booked" ? (
                          <button
                            type="button"
                            className={`confirm-toggle-badge ${
                              apt.is_confirmed ? "confirmed" : "pending"
                            }`}
                            onClick={() =>
                              handleToggleConfirmed(apt.id, apt.is_confirmed)
                            }
                            title="Click to toggle client attendance confirmation"
                          >
                            <Check size={12} />
                            <span>
                              {apt.is_confirmed ? "Confirmed" : "Unconfirmed"}
                            </span>
                          </button>
                        ) : (
                          <span className="text-muted-dash">—</span>
                        )}
                      </td>

                      {/* Status Dropdown with Custom Colors */}
                      <td className="cell-status">
                        <div className="status-dropdown-wrap">
                          <select
                            className={`status-select ${apt.status
                              .toLowerCase()
                              .replace("-", "")}`}
                            value={apt.status}
                            onChange={(e) =>
                              handleStatusChange(apt.id, e.target.value)
                            }
                          >
                            <option value="Booked">Booked</option>
                            <option value="Done">Done</option>
                            <option value="No-show">No-show</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Reschedule Button */}
                      <td className="cell-actions">
                        {apt.status === "Booked" && (
                          <button
                            type="button"
                            className="button-table-action"
                            onClick={() => onOpenReschedule(apt)}
                            title="Reschedule client appointment"
                          >
                            Reschedule
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="table-empty-cell">
                    <div className="table-empty-content">
                      <p>No appointments match the selected filter.</p>
                      {onlyToday && (
                        <button
                          type="button"
                          className="button-link"
                          onClick={() => setOnlyToday(false)}
                        >
                          Show all dates
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
