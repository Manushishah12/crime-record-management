import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import API from "../services/api";
import { exportReportToPDF } from "../utils/pdfExport";

const REPORTS = [
  { key: "open-cases", label: "Open Cases", endpoint: "/reports/open-cases" },
  { key: "closed-cases", label: "Closed Cases", endpoint: "/reports/closed-cases" },
  { key: "criminals", label: "Criminal Report", endpoint: "/reports/criminals" },
  { key: "officers", label: "Officer Report", endpoint: "/reports/officers" },
];

function Reports() {
  const [activeReport, setActiveReport] = useState("open-cases");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const config = REPORTS.find((r) => r.key === activeReport);
      let url = config.endpoint;
      if (activeReport === "criminals" && statusFilter) {
        url += `?status=${statusFilter}`;
      }
      const res = await API.get(url);
      setReport(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport, statusFilter]);

  const renderTable = () => {
    if (!report || report.data.length === 0) {
      return <EmptyState title="No data" message="No records match this report." />;
    }

    if (activeReport === "open-cases" || activeReport === "closed-cases") {
      return (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Case #</th>
                <th>Crime Type</th>
                <th>Status</th>
                <th>Location</th>
                <th>Criminal</th>
                <th>Officer</th>
              </tr>
            </thead>
            <tbody>
              {report.data.map((c) => (
                <tr key={c._id}>
                  <td>{c.caseNumber}</td>
                  <td>{c.crimeType}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{c.location}</td>
                  <td>{c.criminal?.name || "N/A"}</td>
                  <td>{c.assignedOfficer?.name || "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeReport === "criminals") {
      return (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {report.data.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.age}</td>
                  <td>{c.gender}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{c.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeReport === "officers") {
      return (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Badge #</th>
                <th>Rank</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Assigned Cases</th>
              </tr>
            </thead>
            <tbody>
              {report.data.map((o) => (
                <tr key={o._id}>
                  <td>{o.name}</td>
                  <td>{o.badgeNumber}</td>
                  <td>{o.rank}</td>
                  <td>{o.phoneNumber}</td>
                  <td>{o.email}</td>
                  <td>{o.assignedCaseCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Generate and export system reports</p>
        </div>
        {report && (
          <button className="btn btn-primary" onClick={() => exportReportToPDF(report)}>
            Export to PDF
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="report-tabs">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            className={`report-tab ${activeReport === r.key ? "active" : ""}`}
            onClick={() => setActiveReport(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {activeReport === "criminals" && (
        <div className="filters-bar">
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">All Statuses</option>
            <option value="Wanted">Wanted</option>
            <option value="Arrested">Arrested</option>
            <option value="Released">Released</option>
          </select>
        </div>
      )}

      {report && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <strong>{report.reportType}</strong>
          <span className="page-subtitle" style={{ marginLeft: "1rem" }}>
            Total: {report.total} | Generated: {new Date(report.generatedAt).toLocaleString()}
          </span>
        </div>
      )}

      {loading ? <LoadingSpinner /> : renderTable()}
    </Layout>
  );
}

export default Reports;
