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
  caseNumber: "",
  crimeType: "",
  description: "",
  location: "",
  date: new Date().toISOString().split("T")[0],
  status: "Open",
  criminal: "",
  assignedOfficer: "",
};

function Cases() {
  const { canWrite } = useAuth();
  const [cases, setCases] = useState([]);
  const [criminals, setCriminals] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [crimeFilter, setCrimeFilter] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (crimeFilter) params.append("crimeType", crimeFilter);
      const res = await API.get(`/cases?${params}`);
      setCases(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    API.get("/criminals").then((res) => setCriminals(res.data)).catch(() => {});
    API.get("/officers").then((res) => setOfficers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchCases, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, crimeFilter]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (caseItem) => {
    setEditId(caseItem._id);
    setForm({
      caseNumber: caseItem.caseNumber,
      crimeType: caseItem.crimeType,
      description: caseItem.description,
      location: caseItem.location,
      date: caseItem.date ? new Date(caseItem.date).toISOString().split("T")[0] : "",
      status: caseItem.status,
      criminal: caseItem.criminal?._id || caseItem.criminal || "",
      assignedOfficer: caseItem.assignedOfficer?._id || caseItem.assignedOfficer || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        assignedOfficer: form.assignedOfficer || undefined,
        date: form.date ? new Date(form.date) : undefined,
      };
      if (editId) {
        await API.put(`/cases/${editId}`, payload);
      } else {
        await API.post("/cases", payload);
      }
      setModalOpen(false);
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await API.delete(`/cases/${deleteId}`);
      setDeleteId(null);
      fetchCases();
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
          <h1>Case Management</h1>
          <p className="page-subtitle">Track and manage criminal cases</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={openAdd}>+ Add Case</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-bar">
        <input className="form-control" placeholder="Search cases..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Closed">Closed</option>
        </select>
        <input className="form-control" placeholder="Filter by crime type" value={crimeFilter} onChange={(e) => setCrimeFilter(e.target.value)} style={{ maxWidth: 200 }} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : cases.length === 0 ? (
        <EmptyState title="No cases found" message="Create a case or adjust your filters." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Case #</th>
                <th>Crime Type</th>
                <th>Criminal</th>
                <th>Officer</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c._id}>
                  <td><Link to={`/cases/${c._id}`}>{c.caseNumber}</Link></td>
                  <td>{c.crimeType}</td>
                  <td>{c.criminal?.name || "N/A"}</td>
                  <td>{c.assignedOfficer?.name || "Unassigned"}</td>
                  <td>{c.location}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/cases/${c._id}`} className="btn btn-outline btn-sm">View</Link>
                      {canWrite && (
                        <>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(c._id)}>Delete</button>
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
        title={editId ? "Edit Case" : "Add Case"}
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
              <label>Case Number</label>
              <input className="form-control" value={form.caseNumber} onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Crime Type</label>
              <input className="form-control" value={form.crimeType} onChange={(e) => setForm({ ...form, crimeType: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Criminal</label>
              <select className="form-control" value={form.criminal} onChange={(e) => setForm({ ...form, criminal: e.target.value })} required>
                <option value="">Select criminal</option>
                {criminals.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Assigned Officer</label>
              <select className="form-control" value={form.assignedOfficer} onChange={(e) => setForm({ ...form, assignedOfficer: e.target.value })}>
                <option value="">Unassigned</option>
                {officers.map((o) => (
                  <option key={o._id} value={o._id}>{o.name} ({o.badgeNumber})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input className="form-control" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Case"
        message="Are you sure you want to delete this case and all related evidence?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={submitting}
      />
    </Layout>
  );
}

export default Cases;
