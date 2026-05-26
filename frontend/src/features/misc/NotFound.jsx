import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5">
      <div className="card nt-card">
        <div className="card-body">
          <h4 className="mb-2">Not found</h4>
          <p className="text-muted mb-3">The page you’re looking for doesn’t exist.</p>
          <Link to="/" className="btn btn-primary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

