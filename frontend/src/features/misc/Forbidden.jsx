import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="container py-5">
      <div className="card nt-card">
        <div className="card-body">
          <h4 className="mb-2">Forbidden</h4>
          <p className="text-muted mb-3">You do not have access to this page.</p>
          <Link to="/" className="btn btn-primary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

