import { Navigate, useLocation } from "react-router-dom";
import { useHospital } from "../context/HospitalContext";

function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, isAuthenticated } = useHospital();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to the user's appropriate workspace if they try accessing another role's restricted route
    const fallbackRoute =
      currentUser.role === "Doctor"
        ? "/doctor-dashboard"
        : currentUser.role === "Patient"
        ? "/patient-portal"
        : "/dashboard";
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
}

export default ProtectedRoute;
