import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon">🏥 404</div>
        <h1>Page Not Found</h1>
        <p>
          The clinical route or page you are trying to access does not exist or has been moved.
        </p>

        <div className="not-found-links">
          <Link to="/" className="primary-action-btn">
            <span>Return to Home</span>
          </Link>
          <Link to="/dashboard" className="secondary-action-btn">
            <span>Hospital Dashboard</span>
          </Link>
          <Link to="/appointments" className="secondary-action-btn">
            <span>Appointments</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
