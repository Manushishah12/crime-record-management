import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportReportToPDF(report) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setTextColor(30, 58, 95);
  doc.text(report.reportType, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated: ${new Date(report.generatedAt).toLocaleString()} | Total: ${report.total}`,
    pageWidth / 2,
    28,
    { align: "center" }
  );

  let columns = [];
  let rows = [];

  if (report.reportType === "Open Cases Report" || report.reportType === "Closed Cases Report") {
    columns = ["Case #", "Crime Type", "Status", "Location", "Criminal", "Officer"];
    rows = report.data.map((c) => [
      c.caseNumber,
      c.crimeType,
      c.status,
      c.location,
      c.criminal?.name || "N/A",
      c.assignedOfficer?.name || "Unassigned",
    ]);
  } else if (report.reportType === "Criminal Report") {
    columns = ["Name", "Age", "Gender", "Status", "Address"];
    rows = report.data.map((c) => [c.name, c.age, c.gender, c.status, c.address]);
  } else if (report.reportType === "Officer Report") {
    columns = ["Name", "Badge #", "Rank", "Phone", "Email", "Cases"];
    rows = report.data.map((o) => [
      o.name,
      o.badgeNumber,
      o.rank,
      o.phoneNumber,
      o.email,
      o.assignedCaseCount ?? 0,
    ]);
  }

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 58, 95] },
  });

  const filename = `${report.reportType.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}
