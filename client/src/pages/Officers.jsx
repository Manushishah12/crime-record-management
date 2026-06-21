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
  badgeNumber: "",
  rank: "",
  phoneNumber: "",
  email: "",
};

function Officers() {
  const { isAdmin } = useAuth();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await API.get(`/officers${params}`);
      setOfficers(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load officers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchOfficers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (officer) => {
    setEditId(officer._id);
    setForm({
      name: officer.name,
      badgeNumber: officer.badgeNumber,
      rank: officer.rank,
      phoneNumber: officer.phoneNumber,
      email: officer.email,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await API.put(`/officers/${editId}`, form);
      } else {
        await API.post("/officers", form);
      }
      setModalOpen(false);
      fetchOfficers();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await API.delete(`/officers/${deleteId}`);
      setDeleteId(null);
      fetchOfficers();
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
          <h1>Officer Management</h1>
          <p className="page-subtitle">Manage police officers and assignments</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openAdd}>+ Add Officer</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-bar">
        <input className="form-control" placeholder="Search officers..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : officers.length === 0 ? (
        <EmptyState title="No officers found" message="Add an officer to get started." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Badge #</th>
                <th>Rank</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((o) => (
                <tr key={o._id}>
                  <td><Link to={`/officers/${o._id}`}>{o.name}</Link></td>
                  <td>{o.badgeNumber}</td>
                  <td>{o.rank}</td>
                  <td>{o.phoneNumber}</td>
                  <td>{o.email}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/officers/${o._id}`} className="btn btn-outline btn-sm">View</Link>
                      {isAdmin && (
                        <>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(o)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(o._id)}>Delete</button>
                        </>
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
        title={editId ? "Edit Officer" : "Add Officer"}
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
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Badge Number</label>
              <input className="form-control" value={form.badgeNumber} onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Rank</label>
              <input className="form-control" value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input className="form-control" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Officer"
        message="Are you sure you want to delete this officer?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={submitting}
      />
    </Layout>
  );
}

export default Officers;
