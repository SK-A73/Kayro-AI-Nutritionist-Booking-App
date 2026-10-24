import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { formatDisplayDate, formatDisplayTime } from "../data/initialData";

export default function CancelModal({
  appointment,
  isOpen,
  onClose,
  onConfirmCancel,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmCancel(appointment.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-sheet modal-danger" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon danger">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="modal-badge danger">CANCELLATION NOTICE</span>
            <h3>Cancel consultation?</h3>
          </div>
          <button className="icon-close-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-copy">
          <p>
            Are you sure you want to cancel your consultation for{" "}
            <strong>{appointment.client_name}</strong> on{" "}
            <strong>{formatDisplayDate(appointment.appointment_date)}</strong> at{" "}
            <strong>{formatDisplayTime(appointment.appointment_time)}</strong>?
          </p>
          <div className="modal-note-box">
            🌿 <strong>Why early cancellation matters:</strong> Notifying us releases your slot for another client in need and helps our nutritionist plan her clinic hours effectively.
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="button-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Keep Appointment
          </button>
          <button
            type="button"
            className="button-danger"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cancelling..." : "Yes, Cancel Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
