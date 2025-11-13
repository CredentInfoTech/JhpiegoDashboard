/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion*/
import * as React from "react";
import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  ChartTooltip,
  ChartLegend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

type Partner = {
  id: number;
  entityName: string;
  parties: number;
  typeOfPartner: string;
  geography: string;
  validTill: string;
  createdOn: string;
  status: "Active" | "Valid" | "Closed";
  governingLaw?: string;
  objective?: string;
};

const COLORS = ["#4CAF50", "#FF9800", "#F44336", "#2196F3", "#9C27B0"];

const mockData: Partner[] = [
  { id: 1, entityName: "Bhasini (Digital India Bhasini)", parties: 2, typeOfPartner: "Section 8 Company", geography: "National", validTill: "2026-05-01", createdOn: "2021-06-01", status: "Active", governingLaw: "JP", objective: "Use Bhashini platform" },
  { id: 2, entityName: "Confluence of Health Action", parties: 2, typeOfPartner: "Non-profit", geography: "National", validTill: "2027-01-06", createdOn: "2022-02-10", status: "Valid", governingLaw: "JP", objective: "Support health systems" },
  { id: 3, entityName: "CSIR (Institute of Genomics)", parties: 2, typeOfPartner: "Research Institute", geography: "National", validTill: "2025-04-01", createdOn: "2020-11-12", status: "Closed", governingLaw: "MoU", objective: "Collaborative Research" },
  { id: 4, entityName: "Health Department, Govt. Bihar", parties: 2, typeOfPartner: "State Government", geography: "Bihar", validTill: "2027-04-01", createdOn: "2019-03-20", status: "Active", governingLaw: "MoU", objective: "Primary health care" },
  { id: 5, entityName: "INC (Indian Nursing Council)", parties: 2, typeOfPartner: "Nursing Council", geography: "National", validTill: "2026-07-01", createdOn: "2023-01-15", status: "Valid", governingLaw: "JP", objective: "Standards & training" },
  { id: 6, entityName: "Interhealth", parties: 2, typeOfPartner: "Not for Profit", geography: "MP, Raj, Mah", validTill: "2026-07-01", createdOn: "2020-09-09", status: "Active", governingLaw: "JP", objective: "Implement eSanjeevani" },
  { id: 7, entityName: "IVA - Indian Veterinary Assoc", parties: 2, typeOfPartner: "Veterinary Association", geography: "National", validTill: "2025-01-12", createdOn: "2018-12-30", status: "Closed", governingLaw: "JP", objective: "Sustainable animal health" }
];

export default function PartnershipDashboard(props: any) {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [geography, setGeography] = useState<string>("All");
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [filterValid, setFilterValid] = useState<boolean>(false);
  const [filterClosed, setFilterClosed] = useState<boolean>(false);

  const geographyOptions = useMemo(() => {
    const s = new Set(mockData.map((d) => d.geography));
    const arr: string[] = [];
    s.forEach((v) => arr.push(v));
    return ["All", ...arr];
  }, []);

  const filtered = useMemo(() => {
    return mockData.filter((p) => {
      if (geography !== "All" && p.geography !== geography) return false;
      if (from && new Date(p.createdOn) < new Date(from)) return false;
      if (to && new Date(p.createdOn) > new Date(to)) return false;
      const statusChecks = [];
      if (filterActive) statusChecks.push(p.status === "Active");
      if (filterValid) statusChecks.push(p.status === "Valid");
      if (filterClosed) statusChecks.push(p.status === "Closed");
      if (statusChecks.length > 0 && !statusChecks.some(Boolean)) return false;
      return true;
    });
  }, [from, to, geography, filterActive, filterValid, filterClosed]);

  const totals = useMemo(() => {
    const totalPartners = filtered.length;
    const active = filtered.filter((p) => p.status === "Active").length;
    const valid = filtered.filter((p) => p.status === "Valid").length;
    const closed = filtered.filter((p) => p.status === "Closed").length;
    return { totalPartners, active, valid, closed };
  }, [filtered]);

  const statusChart = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => map.set(p.status, (map.get(p.status) || 0) + 1));
    const arr: { name: string; value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    return arr;
  }, [filtered]);

  const geoChart = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => map.set(p.geography, (map.get(p.geography) || 0) + 1));
    const arr: { name: string; value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    return arr;
  }, [filtered]);

  const timeChart = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      const year = new Date(p.createdOn).getFullYear().toString();
      map.set(year, (map.get(year) || 0) + 1);
    });
    const arr: { name: string; value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    arr.sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10));
    return arr;
  }, [filtered]);

  const statusData = {
    labels: statusChart.map((s) => s.name),
    datasets: [
      {
        data: statusChart.map((s) => s.value),
        backgroundColor: COLORS.slice(0, statusChart.length),
        hoverOffset: 8,
      },
    ],
  };

  const geoData = {
    labels: geoChart.map((g) => g.name),
    datasets: [
      {
        label: "Partners",
        data: geoChart.map((g) => g.value),
        backgroundColor: geoChart.map((_, i) => COLORS[i % COLORS.length]),
      },
    ],
  };

  const timeData = {
    labels: timeChart.map((t) => t.name),
    datasets: [
      {
        label: "Contracts",
        data: timeChart.map((t) => t.value),
        borderColor: "#673AB7",
        backgroundColor: "rgba(103,58,183,0.15)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const commonOptions = {
    plugins: {
      legend: { display: true, position: "bottom" as const },
      title: { display: false },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  const barOptions = {
    ...commonOptions,
    scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true, precision: 0 } },
  };

  const lineOptions = {
    ...commonOptions,
    scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true, precision: 0 } },
  };

  const cardStyle = {
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  };

  return (
    <div style={{ fontFamily: "Segoe UI, Arial, sans-serif", padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: 20, color: "#2C3E50" }}>🤝 Partnership Dashboard</h2>

      {/* Filters */}
      <div
        style={{
          ...cardStyle,
          marginBottom: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        <label>
          From: <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ marginLeft: 6 }} />
        </label>
        <label>
          To: <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ marginLeft: 6 }} />
        </label>
        <label>
          Geography:
          <select value={geography} onChange={(e) => setGeography(e.target.value)} style={{ marginLeft: 6 }}>
            {geographyOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: 10 }}>
          <input type="checkbox" checked={filterActive} onChange={(e) => setFilterActive(e.target.checked)} /> Active
        </label>
        <label>
          <input type="checkbox" checked={filterValid} onChange={(e) => setFilterValid(e.target.checked)} /> Valid
        </label>
        <label>
          <input type="checkbox" checked={filterClosed} onChange={(e) => setFilterClosed(e.target.checked)} /> Closed
        </label>

        <button
          onClick={() => {
            setFrom("");
            setTo("");
            setGeography("All");
            setFilterActive(false);
            setFilterValid(false);
            setFilterClosed(false);
          }}
          style={{
            marginLeft: "auto",
            background: "#2196F3",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Total Partners", value: totals.totalPartners, color: "#1565C0" },
          { label: "Active Partners", value: totals.active, color: "#2E7D32" },
          { label: "Valid Contracts", value: totals.valid, color: "#00897B" },
          { label: "Closed Contracts", value: totals.closed, color: "#C62828" },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              flex: "1 1 200px",
              ...cardStyle,
              background: c.color,
              color: "#fff",
              textAlign: "center",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 12, opacity: 0.85 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Contracts by Status</div>
          <div style={{ height: 200 }}>
            <Pie data={statusData} options={commonOptions as any} />
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Partners by Geography</div>
          <div style={{ height: 200 }}>
            <Bar data={geoData} options={barOptions as any} />
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Contracts Created Over Time</div>
          <div style={{ height: 200 }}>
            <Line data={timeData} options={lineOptions as any} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Partnership Details</div>
          <div style={{ fontSize: 12, color: "#777" }}>{filtered.length} records</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f0f2f5", textAlign: "left" }}>
              <th style={{ padding: "10px 6px" }}>Entity</th>
              <th style={{ padding: "10px 6px" }}>Parties</th>
              <th style={{ padding: "10px 6px" }}>Type</th>
              <th style={{ padding: "10px 6px" }}>Geography</th>
              <th style={{ padding: "10px 6px" }}>Valid Till</th>
              <th style={{ padding: "10px 6px" }}>Status</th>
              <th style={{ padding: "10px 6px" }}>Objective</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={p.id}
                style={{
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#eef7ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa")}
              >
                <td style={{ padding: "8px 6px" }}>{p.entityName}</td>
                <td style={{ padding: "8px 6px" }}>{p.parties}</td>
                <td style={{ padding: "8px 6px" }}>{p.typeOfPartner}</td>
                <td style={{ padding: "8px 6px" }}>{p.geography}</td>
                <td style={{ padding: "8px 6px" }}>{p.validTill}</td>
                <td
                  style={{
                    padding: "8px 6px",
                    fontWeight: 600,
                    color:
                      p.status === "Active"
                        ? "#2E7D32"
                        : p.status === "Closed"
                        ? "#C62828"
                        : "#F57C00",
                  }}
                >
                  {p.status}
                </td>
                <td style={{ padding: "8px 6px" }}>{p.objective}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 12, color: "#888", textAlign: "center" }}>
                  No records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
