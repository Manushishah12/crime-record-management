function StatusBadge({ status }) {
  const map = {
    Wanted: "badge-wanted",
    Arrested: "badge-arrested",
    Released: "badge-released",
    Open: "badge-open",
    "Under Investigation": "badge-investigation",
    Closed: "badge-closed",
  };

  return <span className={`badge ${map[status] || ""}`}>{status}</span>;
}

export default StatusBadge;
