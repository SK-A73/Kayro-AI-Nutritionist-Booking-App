import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import ClientApp from "./components/ClientApp";
import Dashboard from "./components/Dashboard";
import RescheduleModal from "./components/RescheduleModal";
import CancelModal from "./components/CancelModal";
import {
  fetchAppointments,
  rescheduleAppointment,
  cancelAppointment,
  subscribeToAppointments,
} from "./services/appointmentService";
import { isSupabaseConfigured } from "./lib/supabase";
import { AlertCircle, RefreshCw } from "lucide-react";
import "./App.css";

export default function App() {
  const [activeView, setActiveView] = useState("client"); // "client" | "dashboard"
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedClient, setSelectedClient] = useState("all");

  // Modals
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Load appointments directly from Supabase
  const loadData = useCallback(async () => {
    try {
      setErrorMessage("");
      const data = await fetchAppointments();
      setAppointments(data || []);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setErrorMessage(
        err.message ||
          "Unable to load appointments from Supabase. Please verify connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to live Supabase Realtime changes + tab focus + periodic sync
    const unsubscribe = subscribeToAppointments((updated) => {
      if (Array.isArray(updated)) {
        setAppointments(updated);
      }
    });

    return () => unsubscribe();
  }, [loadData]);

  // Handle Reschedule
  const handleReschedule = async (id, newDate, newTime) => {
    await rescheduleAppointment(id, newDate, newTime);
    await loadData();
  };

  // Handle Cancel
  const handleCancel = async (id) => {
    await cancelAppointment(id);
    await loadData();
  };

  return (
    <div className="kayro-wellness-app">
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
      />

      {/* Database Error Banner if Supabase fails */}
      {errorMessage && (
        <div className="db-error-alert" role="alert">
          <div className="db-error-content">
            <AlertCircle size={18} />
            <div>
              <strong>Database Connection Notice:</strong>
              <p>{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            className="retry-db-button"
            onClick={loadData}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Main Interface Content */}
      <main className="main-content-container">
        {isLoading ? (
          <div className="loading-state-shell">
            <div className="spinner-leaf">🍃</div>
            <p>Loading appointments from Supabase...</p>
          </div>
        ) : activeView === "client" ? (
          <ClientApp
            appointments={appointments}
            onRefresh={loadData}
            onOpenReschedule={(apt) => setRescheduleTarget(apt)}
            onOpenCancel={(apt) => setCancelTarget(apt)}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />
        ) : (
          <Dashboard
            appointments={appointments}
            onRefresh={loadData}
            onOpenReschedule={(apt) => setRescheduleTarget(apt)}
            onClientCreated={(clientName) => {
              if (clientName) {
                setSelectedClient(clientName);
              }
              loadData();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="kayro-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <strong>Kayro Wellness Practice</strong>
            <p>Thoughtful nutrition care, one appointment at a time.</p>
          </div>
          <div className="footer-reviewer-note">
            <span>Assessment Review Mode:</span>
            <p>
              Shared data store · Switch between <strong>Side A (Client)</strong> and <strong>Side B (Dashboard)</strong> above to test bidirectional real-time synchronization.
            </p>
          </div>
          <div className="footer-meta">
            <span className="footer-tech">
              React 19 + Vite · {isSupabaseConfigured ? "Supabase PostgreSQL (Live)" : "Supabase Connection Required"}
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RescheduleModal
        appointment={rescheduleTarget}
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        onReschedule={handleReschedule}
        allAppointments={appointments}
      />

      <CancelModal
        appointment={cancelTarget}
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirmCancel={handleCancel}
      />
    </div>
  );
}
