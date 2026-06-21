import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Evidence() {
  const { canWrite } = useAuth();
  const [evidence, setEvidence] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [caseFilter, setCaseFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    evidenceName: "",
    evidenceType: "Image",
    description: "",
    relatedCase: "",
    file: null,
  });

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (caseFilter) params.append("caseId", caseFilter);
      const res = await API.get(`/evidence?${params}`);
      setEvidence(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load evidence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    API.get("/cases").then((res) => setCases(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchEvidence, 300);
    return () => clearTimeout(timer);
  }, [search, caseFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) {
      setError("Please select a file");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("evidenceName", form.evidenceName);
      formData.append("evidenceType", form.evidenceType);
      formData.append("description", form.description);
      formData.append("relatedCase", form.relatedCase);
      formData.append("file", form.file);

      await API.post("/evidence", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModalOpen(false);
      setForm({ evidenceName: "", evidenceType: "Image", description: "", relatedCase: "", file: null });
      fetchEvidence();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await API.delete(`/evidence/${deleteId}`);
      setDeleteId(null);
      fetchEvidence();
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
          <h1>Evidence Management</h1>
          <p className="page-subtitle">Upload and manage case evidence files</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Upload Evidence</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-bar">
        <input className="form-control" placeholder="Search evidence..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-control" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} style={{ maxWidth: 250 }}>
          <option value="">All Cases</option>
          {cases.map((c) => (
            <option key={c._id} value={c._id}>{c.caseNumber}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : evidence.length === 0 ? (
        <EmptyState title="No evidence found" message="Upload evidence or adjust your filters." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Case</th>
                <th>Description</th>
                <th>Upload Date</th>
                <th>File</th>
                {canWrite && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {evidence.map((ev) => (
                <tr key={ev._id}>
                  <td>{ev.evidenceName}</td>
                  <td>{ev.evidenceType}</td>
                  <td>
                    <Link to={`/cases/${ev.relatedCase?._id}`}>{ev.relatedCase?.caseNumber || "N/A"}</Link>
                  </td>
                  <td>{ev.description || "—"}</td>
                  <td>{new Date(ev.uploadDate).toLocaleDateString()}</td>
                  <td>
                    <a href={`http://localhost:5000/uploads/${ev.filePath}`} target="_blank" rel="noreferrer">
                      {ev.fileName}
                    </a>
                  </td>
                  {canWrite && (
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(ev._id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        title="Upload Evidence"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Uploading..." : "Upload"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Evidence Name</label>
            <input className="form-control" value={form.evidenceName} onChange={(e) => setForm({ ...form, evidenceName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Related Case</label>
            <select className="form-control" value={form.relatedCase} onChange={(e) => setForm({ ...form, relatedCase: e.target.value })} required>
              <option value="">Select case</option>
              {cases.map((c) => (
                <option key={c._id} value={c._id}>{c.caseNumber} — {c.crimeType}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Evidence Type</label>
            <select className="form-control" value={form.evidenceType} onChange={(e) => setForm({ ...form, evidenceType: e.target.value })}>
              <option value="Image">Image</option>
              <option value="PDF">PDF</option>
              <option value="Document">Document</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>File</label>
            <input className="form-control" type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} required />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Evidence"
        message="Are you sure you want to delete this evidence?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={submitting}
      />
    </Layout>
  );
}

export default Evidence;
