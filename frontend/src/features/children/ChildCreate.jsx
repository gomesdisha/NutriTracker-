import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios.js";
import { useAuth } from "../../app/AuthContext.jsx";

export default function ChildCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [centers, setCenters] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultCenterId = useMemo(() => (user?.role === "WORKER" ? user.centerId : ""), [user]);

  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "M",
    centerId: defaultCenterId || "",
    fatherName: "",
    motherName: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/centers");
        setCenters(data.centers || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load centers");
      }
    })();
  }, []);

  useEffect(() => {
    if (defaultCenterId) setForm((s) => ({ ...s, centerId: defaultCenterId }));
  }, [defaultCenterId]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        dob: form.dob,
        gender: form.gender,
        centerId: form.centerId,
        parent: {
          fatherName: form.fatherName,
          motherName: form.motherName,
          phone: form.phone,
          address: form.address
        }
      };
      const { data } = await axios.post("/children", payload);
      navigate(`/children/${data.child._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to register child");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">Register Child</h4>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card nt-card">
        <div className="card-body">
          <form onSubmit={onSubmit} className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Child name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">DOB</label>
              <input type="date" className="form-control" value={form.dob} onChange={(e) => setForm((s) => ({ ...s, dob: e.target.value }))} required />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value }))}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Anganwadi Center</label>
              <select
                className="form-select"
                value={form.centerId}
                onChange={(e) => setForm((s) => ({ ...s, centerId: e.target.value }))}
                disabled={user?.role === "WORKER"}
                required
              >
                <option value="" disabled>
                  Select center...
                </option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              {user?.role === "WORKER" && <div className="form-text">Center is fixed for worker accounts.</div>}
            </div>

            <div className="col-12">
              <hr />
              <h6 className="mb-0">Parent / Guardian details</h6>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Father name</label>
              <input className="form-control" value={form.fatherName} onChange={(e) => setForm((s) => ({ ...s, fatherName: e.target.value }))} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Mother name</label>
              <input className="form-control" value={form.motherName} onChange={(e) => setForm((s) => ({ ...s, motherName: e.target.value }))} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label">Address</label>
              <input className="form-control" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
            </div>

            <div className="col-12">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Register Child"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

