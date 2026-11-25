import { useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { useHospital } from "./context/HospitalContext";

function Receptionist({ logout: propLogout }) {
  const navigate = useNavigate();
  const { logout: contextLogout } = useHospital();

  const handleLogoutClick = () => {
    if (propLogout) {
      propLogout();
    } else if (contextLogout) {
      contextLogout();
      navigate("/login");
    }
  };

  return (
    <div className="receptionist-portal-wrapper">
      <div className="portal-sub-banner">
        <span>👩‍💼 Hospital Receptionist Administration Desk</span>
        <button type="button" className="sub-banner-logout-btn" onClick={handleLogoutClick}>
          Sign Out Desk
        </button>
      </div>
      <Dashboard />
    </div>
  );
}

export default Receptionist;
