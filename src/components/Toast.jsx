import { useHospital } from "../context/HospitalContext";

function Toast() {
  const { notification, dismissNotification } = useHospital();

  if (!notification) return null;

  const iconMap = {
    success: "✅",
    error: "⚠️",
    info: "ℹ️"
  };

  return (
    <div
      className={`toast-notification toast-${notification.type}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon">{iconMap[notification.type] || "🔔"}</span>
      <span className="toast-message">{notification.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={dismissNotification}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
