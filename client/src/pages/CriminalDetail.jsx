import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import API from "../services/api";

function CriminalDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/criminals/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load criminal"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout showSearch={false}><LoadingSpinner /></Layout>;
  if (error) return <Layout showSearch={false}><div className="alert alert-error">{error}</div></Layout>;

  const { criminal, cases } = data;

  return (
    <Layout showSearch={false}>
      <div className="page-header">
        <div>
          <Link to="/criminals" className="page-subtitle">&larr; Back to Criminals</Link>
          <h1>{criminal.name}</h1>
          <StatusBadge status={criminal.status} />
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Profile</h3>
          <div className="detail-item"><label>Age</label><p>{criminal.age}</p></div>
          <div className="detail-item"><label>Gender</label><p>{criminal.gender}</p></div>
          <div className="detail-item"><label>Address</label><p>{criminal.address}</p></div>
          <div className="detail-item"><label>Crime History</label><p>{criminal.crimeHistory}</p></div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Associated Cases ({cases.length})</h3>
          {cases.length === 0 ? (
            <p className="page-subtitle">No cases linked to this criminal.</p>
          ) : (
            <ul className="recent-list">
              {cases.map((c) => (
                <li key={c._id}>
                  <div>
                    <Link to={`/cases/${c._id}`}>{c.caseNumber}</Link>
                    <div className="page-subtitle">{c.crimeType}</div>
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

export default CriminalDetail;
