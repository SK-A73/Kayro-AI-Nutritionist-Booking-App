import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, AlertCircle, Check } from "lucide-react";
import {
  AVAILABLE_SLOTS,
  formatDisplayDate,
  formatDisplayTime,
  normalizeDate,
} from "../data/initialData";
import { checkSlotConflict } from "../services/appointmentService";

export default function RescheduleModal({
  appointment,
  isOpen,
  onClose,
  onReschedule,
  allAppointments,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      setSelectedDate(appointment.appointment_date);
      setSelectedTime(appointment.appointment_time);
      setError("");
    }
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  const todayStr = new Date().toISOString().split("T")[0];

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setError("");
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Please select both a new date and a time slot.");
      return;
    }

    if (
      selectedDate === appointment.appointment_date &&
      selectedTime === appointment.appointment_time
    ) {
      setError("Please select a different date or time to reschedule.");
      return;
    }

    // Check conflict
    const isConflict = checkSlotConflict(
      allAppointments,
      selectedDate,
      selectedTime,
      appointment.id
    );

    if (isConflict) {
      setError("That slot is already booked. Please pick another time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReschedule(appointment.id, selectedDate, selectedTime);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to reschedule appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-badge">CHANGE CONSULTATION TIME</span>
            <h3>Reschedule your appointment</h3>
          </div>
          <button className="icon-close-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-current-info">
          <p className="modal-current-label">Current Booking</p>
          <div className="modal-current-row">
            <strong>{appointment.client_name}</strong>
            <span>
              {formatDisplayDate(appointment.appointment_date)} at{" "}
              {formatDisplayTime(appointment.appointment_time)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="form-label">
            <span>Select New Date</span>
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={handleDateChange}
                required
              />
            </div>
          </label>

          <div className="slot-picker-section">
            <span className="form-label-text">Select Available Time</span>
            <div className="slot-grid">
              {AVAILABLE_SLOTS.map((slot) => {
                const isConflict = checkSlotConflict(
                  allAppointments,
                  selectedDate,
                  slot,
                  appointment.id
                );
                const isSelected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isConflict}
                    className={`slot-chip ${isSelected ? "selected" : ""} ${
                      isConflict ? "disabled" : ""
                    }`}
                    onClick={() => handleTimeSelect(slot)}
                  >
                    <Clock size={13} />
                    <span>{formatDisplayTime(slot)}</span>
                    {isConflict && <span className="slot-booked-tag">Booked</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="alert-box error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="button-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Confirm New Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
