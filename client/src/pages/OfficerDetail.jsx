import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import API from "../services/api";

function OfficerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/officers/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load officer"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout showSearch={false}><LoadingSpinner /></Layout>;
  if (error) return <Layout showSearch={false}><div className="alert alert-error">{error}</div></Layout>;

  const { officer, cases } = data;

  return (
    <Layout showSearch={false}>
      <div className="page-header">
        <div>
          <Link to="/officers" className="page-subtitle">&larr; Back to Officers</Link>
          <h1>{officer.name}</h1>
          <p className="page-subtitle">{officer.rank} — Badge #{officer.badgeNumber}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Contact Info</h3>
          <div className="detail-item"><label>Phone</label><p>{officer.phoneNumber}</p></div>
          <div className="detail-item"><label>Email</label><p>{officer.email}</p></div>
          <div className="detail-item"><label>Rank</label><p>{officer.rank}</p></div>
          <div className="detail-item"><label>Badge Number</label><p>{officer.badgeNumber}</p></div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Assigned Cases ({cases.length})</h3>
          {cases.length === 0 ? (
            <p className="page-subtitle">No cases assigned to this officer.</p>
          ) : (
            <ul className="recent-list">
              {cases.map((c) => (
                <li key={c._id}>
                  <div>
                    <Link to={`/cases/${c._id}`}>{c.caseNumber}</Link>
                    <div className="page-subtitle">{c.crimeType} — {c.criminal?.name}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default OfficerDetail;
