import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  age: "",
  gender: "",
  address: "",
  crimeHistory: "",
  status: "Wanted",
};

function Criminals() {
  const { canWrite, isAdmin } = useAuth();
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCriminals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      const res = await API.get(`/criminals?${params}`);
      setCriminals(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load criminals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchCriminals, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (criminal) => {
    setEditId(criminal._id);
    setForm({
      name: criminal.name,
      age: criminal.age,
      gender: criminal.gender,
      address: criminal.address,
      crimeHistory: criminal.crimeHistory,
      status: criminal.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, age: Number(form.age) };
      if (editId) {
        await API.put(`/criminals/${editId}`, payload);
      } else {
        await API.post("/criminals", payload);
      }
      setModalOpen(false);
      fetchCriminals();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await API.delete(`/criminals/${deleteId}`);
      setDeleteId(null);
      fetchCriminals();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Criminal Management</h1>
          <p className="page-subtitle">Manage criminal records and status</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={openAdd}>
            + Add Criminal
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-bar">
        <input
          className="form-control"
          placeholder="Search by name, address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          <option value="">All Statuses</option>
          <option value="Wanted">Wanted</option>
          <option value="Arrested">Arrested</option>
          <option value="Released">Released</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : criminals.length === 0 ? (
        <EmptyState title="No criminals found" message="Add a criminal or adjust your filters." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {criminals.map((c) => (
                <tr key={c._id}>
                  <td><Link to={`/criminals/${c._id}`}>{c.name}</Link></td>
                  <td>{c.age}</td>
                  <td>{c.gender}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{c.address}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/criminals/${c._id}`} className="btn btn-outline btn-sm">View</Link>
                      {canWrite && (
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      )}
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(c._id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        title={editId ? "Edit Criminal" : "Add Criminal"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editId ? "Update" : "Create"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input className="form-control" type="number" name="age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <input className="form-control" name="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Wanted">Wanted</option>
                <option value="Arrested">Arrested</option>
                <option value="Released">Released</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input className="form-control" name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Crime History</label>
            <textarea className="form-control" rows={3} name="crimeHistory" value={form.crimeHistory} onChange={(e) => setForm({ ...form, crimeHistory: e.target.value })} required />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Criminal"
        message="Are you sure you want to delete this criminal? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={submitting}
      />
    </Layout>
  );
}

export default Criminals;
