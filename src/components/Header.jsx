import { useNavigate, Link } from "react-router-dom";
import { useHospital } from "../context/HospitalContext";

function Header({ title, subtitle, onToggleMobileMenu }) {
  const navigate = useNavigate();
  const { currentUser, logout, backendStatus } = useHospital();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = currentUser?.role || "Receptionist";
  const avatar = currentUser?.avatar || "👩‍💼";
  const name = currentUser?.name || "Receptionist";
  const titleText = currentUser?.title || "Hospital Staff";

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <div>
          <h1>{title || "MediCare Dashboard"}</h1>
          <p>{subtitle || "Manage patients, medical queues, and appointments."}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className={`live-status-pill ${backendStatus !== "offline" ? "api-connected" : "api-offline"}`}>
          <span className={`live-dot ${backendStatus !== "offline" ? "dot-green" : "dot-amber"}`}></span>
          <span>{backendStatus !== "offline" ? "System Online" : "Offline Backup"}</span>
        </div>

        {currentUser ? (
          <>
            <div className="profile">
              <span className="profile-avatar" role="img" aria-label={`${role} profile avatar`}>
                {avatar}
              </span>
              <div>
                <strong>{name}</strong>
                <small>{titleText} • {currentDate}</small>
              </div>
            </div>

            <div className="header-auth-actions">
              <Link to="/login" className="switch-role-pill-btn" title="Switch account or role">
                <span>⇄ Account</span>
              </Link>
              <button
                type="button"
                className="logout-header-btn"
                onClick={handleLogout}
                title="Sign out of current account"
              >
                <span>🚪</span>
              </button>
            </div>
          </>
        ) : (
          <div className="header-auth-actions">
            <Link to="/login" className="primary-action-btn" style={{ padding: "8px 16px", fontSize: "13px" }}>
              <span>🔐 Sign In / Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
