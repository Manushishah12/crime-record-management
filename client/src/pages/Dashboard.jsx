import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import API from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><LoadingSpinner message="Loading dashboard..." /></Layout>;
  if (error) return <Layout><div className="alert alert-error">{error}</div></Layout>;

  const cards = [
    { label: "Total Criminals", value: stats.totalCriminals, class: "" },
    { label: "Total Cases", value: stats.totalCases, class: "info" },
    { label: "Open Cases", value: stats.openCases, class: "warning" },
    { label: "Under Investigation", value: stats.underInvestigation, class: "accent" },
    { label: "Closed Cases", value: stats.closedCases, class: "success" },
    { label: "Wanted Criminals", value: stats.wantedCriminals, class: "danger" },
    { label: "Arrested Criminals", value: stats.arrestedCriminals, class: "success" },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of crime records and case statistics</p>
        </div>
      </div>

      <div className="card-grid">
        {cards.map((card) => (
          <div key={card.label} className={`stat-card ${card.class}`}>
            <h3>{card.label}</h3>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Recent Criminals</h3>
          {stats.recentCriminals?.length === 0 ? (
            <p className="page-subtitle">No criminals recorded yet.</p>
          ) : (
            <ul className="recent-list">
              {stats.recentCriminals?.map((c) => (
                <li key={c._id}>
                  <Link to={`/criminals/${c._id}`}>{c.name}</Link>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Recent Cases</h3>
          {stats.recentCases?.length === 0 ? (
            <p className="page-subtitle">No cases recorded yet.</p>
          ) : (
            <ul className="recent-list">
              {stats.recentCases?.map((c) => (
                <li key={c._id}>
                  <Link to={`/cases/${c._id}`}>{c.caseNumber}</Link>
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

export default Dashboard;
