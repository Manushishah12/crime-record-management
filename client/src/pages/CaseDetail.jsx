import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function CaseDetail() {
  const { id } = useParams();
  const { canWrite } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timelineModal, setTimelineModal] = useState(false);
  const [evidenceModal, setEvidenceModal] = useState(false);
  const [timelineForm, setTimelineForm] = useState({ event: "", description: "" });
  const [evidenceForm, setEvidenceForm] = useState({ evidenceName: "", evidenceType: "Image", description: "", file: null });
  const [deleteEvidenceId, setDeleteEvidenceId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const fetchCase = () => {
    setLoading(true);
    API.get(`/cases/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load case"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const addTimeline = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post(`/cases/${id}/timeline`, timelineForm);
      setTimelineModal(false);
      setTimelineForm({ event: "", description: "" });
      fetchCase();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add timeline entry");
    } finally {
      setSubmitting(false);
    }
  };

  const uploadEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceForm.file) {
      setError("Please select a file");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("evidenceName", evidenceForm.evidenceName);
      formData.append("evidenceType", evidenceForm.evidenceType);
      formData.append("description", evidenceForm.description);
      formData.append("relatedCase", id);
      formData.append("file", evidenceForm.file);

      await API.post("/evidence", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEvidenceModal(false);
      setEvidenceForm({ evidenceName: "", evidenceType: "Image", description: "", file: null });
      fetchCase();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload evidence");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvidence = async () => {
    setSubmitting(true);
    try {
      await API.delete(`/evidence/${deleteEvidenceId}`);
      setDeleteEvidenceId(null);
      fetchCase();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete evidence");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <Layout showSearch={false}><LoadingSpinner /></Layout>;
  if (error && !data) return <Layout showSearch={false}><div className="alert alert-error">{error}</div></Layout>;

  const { case: caseDoc, evidence } = data;
  const askAI = async (promptText = question) => {
  if (!promptText) return;

  setAiLoading(true);

  try {
    const res = await API.post("/ai/chat", {
      question: promptText,
      caseData: caseDoc,
      evidence,
    });

    setMessages((prev) => [
      ...prev,
      { role: "user", text: promptText },
      { role: "ai", text: res.data.answer },
    ]);

    setQuestion("");
  } catch (err) {
    console.error(err);
  } finally {
    setAiLoading(false);
  }
};



  return (
    
    <Layout showSearch={false}>
      <div className="page-header">
        <div>
          <Link to="/cases" className="page-subtitle">&larr; Back to Cases</Link>
          <h1>Case {caseDoc.caseNumber}</h1>
          <StatusBadge status={caseDoc.status} />
        </div>
        {canWrite && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-outline" onClick={() => setTimelineModal(true)}>Add Timeline</button>
            <button className="btn btn-primary" onClick={() => setEvidenceModal(true)}>Upload Evidence</button>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="detail-grid">
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Case Details</h3>
          <div className="detail-item"><label>Crime Type</label><p>{caseDoc.crimeType}</p></div>
          <div className="detail-item"><label>Description</label><p>{caseDoc.description}</p></div>
          <div className="detail-item"><label>Location</label><p>{caseDoc.location}</p></div>
          <div className="detail-item"><label>Date</label><p>{new Date(caseDoc.date).toLocaleDateString()}</p></div>
          <div className="detail-item">
            <label>Criminal</label>
            <p>
              {caseDoc.criminal ? (
                <Link to={`/criminals/${caseDoc.criminal._id}`}>{caseDoc.criminal.name}</Link>
              ) : "N/A"}
            </p>
          </div>
          <div className="detail-item">
            <label>Assigned Officer</label>
            <p>
              {caseDoc.assignedOfficer ? (
                <Link to={`/officers/${caseDoc.assignedOfficer._id}`}>
                  {caseDoc.assignedOfficer.name} ({caseDoc.assignedOfficer.badgeNumber})
                </Link>
              ) : "Unassigned"}
            </p>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Case Timeline</h3>
          {caseDoc.timeline?.length === 0 ? (
            <p className="page-subtitle">No timeline events yet.</p>
          ) : (
            <div className="timeline">
              {[...(caseDoc.timeline || [])].reverse().map((entry, i) => (
                <div key={entry._id || i} className="timeline-item">
                  <h4>{entry.event}</h4>
                  {entry.description && <p>{entry.description}</p>}
                  <div className="timeline-date">
                    {new Date(entry.date).toLocaleString()}
                    {entry.createdBy?.name && ` — ${entry.createdBy.name}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Evidence ({evidence?.length || 0})</h3>
        {evidence?.length === 0 ? (
          <p className="page-subtitle">No evidence uploaded for this case.</p>
        ) : (
          <div className="table-container" style={{ boxShadow: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
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
                    <td>{ev.description || "—"}</td>
                    <td>{new Date(ev.uploadDate).toLocaleDateString()}</td>
                    <td>
                      <a href={`http://localhost:5000/uploads/${ev.filePath}`} target="_blank" rel="noreferrer">
                        {ev.fileName}
                      </a>
                    </td>
                    {canWrite && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteEvidenceId(ev._id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={timelineModal}
        title="Add Timeline Entry"
        onClose={() => setTimelineModal(false)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setTimelineModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={addTimeline} disabled={submitting}>
              {submitting ? "Adding..." : "Add Entry"}
            </button>
          </>
        }
      >
        <form onSubmit={addTimeline}>
          <div className="form-group">
            <label>Event</label>
            <input className="form-control" value={timelineForm.event} onChange={(e) => setTimelineForm({ ...timelineForm, event: e.target.value })} required placeholder="e.g. Witness Interview" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={3} value={timelineForm.description} onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })} />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={evidenceModal}
        title="Upload Evidence"
        onClose={() => setEvidenceModal(false)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setEvidenceModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={uploadEvidence} disabled={submitting}>
              {submitting ? "Uploading..." : "Upload"}
            </button>
          </>
        }
      >
        <form onSubmit={uploadEvidence}>
          <div className="form-group">
            <label>Evidence Name</label>
            <input className="form-control" value={evidenceForm.evidenceName} onChange={(e) => setEvidenceForm({ ...evidenceForm, evidenceName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Evidence Type</label>
            <select className="form-control" value={evidenceForm.evidenceType} onChange={(e) => setEvidenceForm({ ...evidenceForm, evidenceType: e.target.value })}>
              <option value="Image">Image</option>
              <option value="PDF">PDF</option>
              <option value="Document">Document</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={2} value={evidenceForm.description} onChange={(e) => setEvidenceForm({ ...evidenceForm, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>File</label>
            <input className="form-control" type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={(e) => setEvidenceForm({ ...evidenceForm, file: e.target.files[0] })} required />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteEvidenceId}
        title="Delete Evidence"
        message="Are you sure you want to delete this evidence file?"
        onConfirm={deleteEvidence}
        onCancel={() => setDeleteEvidenceId(null)}
        loading={submitting}
      />
      <button
  onClick={() => setAiOpen(!aiOpen)}
  style={{
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 9999,
  }}
>
  🤖
</button>
{aiOpen && (
  <div
    style={{
      position: "fixed",
      bottom: "90px",
      right: "20px",
      width: "350px",
      height: "500px",
      background: "white",
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "10px",
      zIndex: 9999,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <h3>AI Case Assistant</h3>
     <div style={{ marginBottom: "10px" }}>
  <button onClick={() => askAI("Summarize this case")}>
    Summary
  </button>

  <button onClick={() => askAI("What evidence exists?")}>
    Evidence
  </button>

  <button onClick={() => askAI("Who is assigned to this case?")}>
    Officer
  </button>

  <button onClick={() => askAI("Give timeline summary")}>
    Timeline
  </button>
</div>
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        marginBottom: "10px",
      }}
    >
      {messages.map((msg, index) => (
        <div key={index}>
          <strong>{msg.role === "ai" ? "AI" : "You"}:</strong>
          <p>{msg.text}</p>
        </div>
      ))}
    </div>
   {aiLoading && <p>AI is thinking...</p>}
    <div style={{ display: "flex", gap: "5px" }}>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about this case..."
        className="form-control"
      />
      <button
        className="btn btn-primary"
        onClick={() => askAI()}
        disabled={aiLoading}
      >
        Send
      </button>
      
    </div>
  </div>
)}
    </Layout>
  );
}

export default CaseDetail;
