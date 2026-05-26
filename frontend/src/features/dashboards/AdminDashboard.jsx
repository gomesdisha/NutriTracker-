import { useEffect, useState } from "react";
import axios from "../../api/axios.js";

export default function AdminDashboard() {
  const [centers, setCenters] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [newCenter, setNewCenter] = useState({ name: "", code: "", district: "", taluka: "", pincode: "", address: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "WORKER", centerId: "" });

  async function refresh() {
    const [c, u] = await Promise.all([axios.get("/centers"), axios.get("/users")]);
    setCenters(c.data.centers || []);
    setUsers(u.data.users || []);
  }

  useEffect(() => {
    (async () => {
      setError("");
      try {
        await refresh();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load admin data");
      }
    })();
  }, []);

  async function createCenter(e) {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/centers", newCenter);
      setNewCenter({ name: "", code: "", district: "", taluka: "", pincode: "", address: "" });
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create center");
    }
  }

  async function createUser(e) {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/users", { ...newUser, centerId: newUser.centerId || null });
      setNewUser({ name: "", email: "", password: "", role: "WORKER", centerId: "" });
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create user");
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-3">Admin Dashboard</h4>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card nt-card">
            <div className="card-body">
              <h6 className="mb-3">Create Center</h6>
              <form onSubmit={createCenter} className="row g-2">
                <div className="col-12 col-md-7">
                  <input className="form-control" placeholder="Center name" value={newCenter.name} onChange={(e) => setNewCenter((s) => ({ ...s, name: e.target.value }))} required />
                </div>
                <div className="col-12 col-md-5">
                  <input className="form-control" placeholder="Code (e.g. CTR001)" value={newCenter.code} onChange={(e) => setNewCenter((s) => ({ ...s, code: e.target.value }))} required />
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="District" value={newCenter.district} onChange={(e) => setNewCenter((s) => ({ ...s, district: e.target.value }))} />
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Taluka" value={newCenter.taluka} onChange={(e) => setNewCenter((s) => ({ ...s, taluka: e.target.value }))} />
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Pincode" value={newCenter.pincode} onChange={(e) => setNewCenter((s) => ({ ...s, pincode: e.target.value }))} />
                </div>
                <div className="col-12">
                  <input className="form-control" placeholder="Address" value={newCenter.address} onChange={(e) => setNewCenter((s) => ({ ...s, address: e.target.value }))} />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary">Create Center</button>
                </div>
              </form>

              <hr />
              <h6 className="mb-2">Centers</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th className="text-muted">District</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centers.map((c) => (
                      <tr key={c._id}>
                        <td className="fw-semibold">{c.name}</td>
                        <td className="text-muted">{c.code}</td>
                        <td className="text-muted">{c.district || "-"}</td>
                      </tr>
                    ))}
                    {centers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-muted">
                          No centers yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card nt-card">
            <div className="card-body">
              <h6 className="mb-3">Create User</h6>
              <form onSubmit={createUser} className="row g-2">
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))} required />
                </div>
                <div className="col-12 col-md-6">
                  <select className="form-select" value={newUser.role} onChange={(e) => setNewUser((s) => ({ ...s, role: e.target.value }))}>
                    <option value="WORKER">WORKER</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))} required />
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))} required />
                </div>
                <div className="col-12">
                  <select className="form-select" value={newUser.centerId} onChange={(e) => setNewUser((s) => ({ ...s, centerId: e.target.value }))}>
                    <option value="">(optional) Assign center</option>
                    {centers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <button className="btn btn-primary">Create User</button>
                </div>
              </form>

              <hr />
              <h6 className="mb-2">Users</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th className="text-muted">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="fw-semibold">{u.name}</td>
                        <td className="text-muted">{u.email}</td>
                        <td>
                          <span className="badge bg-secondary">{u.role}</span>
                        </td>
                        <td className="text-muted">{u.isActive ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-muted">
                          No users yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

