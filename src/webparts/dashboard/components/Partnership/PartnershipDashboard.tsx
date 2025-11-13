/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion*/
/*eslint-disable no-return-assign */
/*eslint-disable @typescript-eslint/prefer-as-const */
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

const commonOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        boxWidth: 12,
        padding: 8,
      },
    },
    tooltip: {
      enabled: true,
    },
  },
};

const barOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { autoSkip: false },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
    },
  },
};

const lineOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
  elements: {
    point: { radius: 3 },
    line: { tension: 0.3 },
  },
};

type Partner = {
  id: number;
  entityName: string;
  parties: number;
  typeOfPartner: string;
  geography: string;
  validTill: string;
  createdOn: string;
  status: "Active" | "Closed";
  governingLaw?: string;
  objective?: string;
};

const COLORS = ["#5865f2", "#4b91f1", "#a680be", "#4f709c", "#30aabc"];

const mockData: Partner[] = [
  {
    id: 1,
    entityName: "Bhasini (Digital India Bhasini)",
    parties: 2,
    typeOfPartner: "Section 8 Company",
    geography: "National",
    validTill: "2026-05-01",
    createdOn: "2021-06-01",
    status: "Active",
    governingLaw: "JP",
    objective: "Use Bhashini platform",
  },
  {
    id: 2,
    entityName: "Confluence of Health Action",
    parties: 2,
    typeOfPartner: "Non-profit",
    geography: "National",
    validTill: "2027-01-06",
    createdOn: "2025-11-11",
    status: "Closed",
    governingLaw: "JP",
    objective: "Support health systems",
  },
  {
    id: 3,
    entityName: "CSIR (Institute of Genomics)",
    parties: 2,
    typeOfPartner: "Research Institute",
    geography: "National",
    validTill: "2025-04-01",
    createdOn: "2025-10-10",
    status: "Closed",
    governingLaw: "MoU",
    objective: "Collaborative Research",
  },
  {
    id: 4,
    entityName: "Health Department, Govt. Bihar",
    parties: 2,
    typeOfPartner: "State Government",
    geography: "Bihar",
    validTill: "2027-04-01",
    createdOn: "2019-03-20",
    status: "Active",
    governingLaw: "MoU",
    objective: "Primary health care",
  },
  {
    id: 5,
    entityName: "INC (Indian Nursing Council)",
    parties: 2,
    typeOfPartner: "Nursing Council",
    geography: "National",
    validTill: "2026-07-01",
    createdOn: "2023-01-15",
    status: "Active",
    governingLaw: "JP",
    objective: "Standards & training",
  },
  {
    id: 6,
    entityName: "Interhealth",
    parties: 2,
    typeOfPartner: "Not for Profit",
    geography: "MP, Raj, Mah",
    validTill: "2026-07-01",
    createdOn: "2020-09-09",
    status: "Active",
    governingLaw: "JP",
    objective: "Implement eSanjeevani",
  },
  {
    id: 7,
    entityName: "IVA - Indian Veterinary Assoc",
    parties: 2,
    typeOfPartner: "Veterinary Association",
    geography: "National",
    validTill: "2025-01-12",
    createdOn: "2018-12-30",
    status: "Closed",
    governingLaw: "JP",
    objective: "Sustainable animal health",
  },
  {
    id: 8,
    entityName: "National Health Mission (NHM)",
    parties: 3,
    typeOfPartner: "Government Program",
    geography: "National",
    validTill: "2028-12-31",
    createdOn: "2022-01-01",
    status: "Active",
    governingLaw: "MoU",
    objective: "Strengthen healthcare delivery",
  },
  {
    id: 9,
    entityName: "WHO India Office",
    parties: 2,
    typeOfPartner: "International Organization",
    geography: "National",
    validTill: "2027-06-30",
    createdOn: "2023-05-15",
    status: "Active",
    governingLaw: "MoU",
    objective: "Support health initiatives",
  },
  {
    id: 10,
    entityName: "State Health Society, Tamil Nadu",
    parties: 2,
    typeOfPartner: "State Government",
    geography: "Tamil Nadu",
    validTill: "2026-03-31",
    createdOn: "2021-11-20",
    status: "Active",
    governingLaw: "MoU",
    objective: "Improve maternal health",
  },
  {
    id: 11,
    entityName: "UNICEF India",
    parties: 2,
    typeOfPartner: "International Organization",
    geography: "National",
    validTill: "2025-09-30",
    createdOn: "2020-07-10",
    status: "Closed",
    governingLaw: "MoU",
    objective: "Child health and nutrition",
  },
  {
    id: 12,
    entityName: "Public Health Foundation of India (PHFI)",
    parties: 2,
    typeOfPartner: "Non-profit",
    geography: "National",
    validTill: "2029-01-01",
    createdOn: "2024-02-14",
    status: "Active",
    governingLaw: "JP",
    objective: "Public health research",
  },
  {
    id: 13,
    entityName: "AIIMS Delhi",
    parties: 2,
    typeOfPartner: "Research Institute",
    geography: "Delhi",
    validTill: "2024-08-15",
    createdOn: "2022-08-15",
    status: "Active",
    governingLaw: "MoU",
    objective: "Medical research collaboration",
  },
  {
    id: 14,
    entityName: "National Institute of Epidemiology",
    parties: 2,
    typeOfPartner: "Research Institute",
    geography: "Tamil Nadu",
    validTill: "2025-12-31",
    createdOn: "2020-01-01",
    status: "Closed",
    governingLaw: "MoU",
    objective: "Epidemiological studies",
  },
  {
    id: 15,
    entityName: "Jharkhand Rural Health Mission",
    parties: 2,
    typeOfPartner: "State Government",
    geography: "Jharkhand",
    validTill: "2027-10-01",
    createdOn: "2023-03-01",
    status: "Active",
    governingLaw: "MoU",
    objective: "Rural healthcare improvement",
  },
];

export default function PartnershipDashboardTwo(props: any) {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [geography, setGeography] = useState<string>("All");
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [contracts, setContracts] = useState<{
    valid: boolean;
    closed: boolean;
  }>({ valid: false, closed: false });
  const [filterClosed, setFilterClosed] = useState<boolean>(false);

  // derived list of geographies
  const geographyOptions = useMemo(() => {
    const s = new Set(mockData.map((d) => d.geography));
    const arr: string[] = [];
    s.forEach((v) => arr.push(v));
    return ["All", ...arr];
  }, []);

  // filter logic
  const filtered = useMemo(() => {
    return mockData.filter((p) => {
      if (geography !== "All" && p.geography !== geography) return false;
      if (from && new Date(p.createdOn) < new Date(from)) return false;
      if (to && new Date(p.createdOn) > new Date(to)) return false;

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const statusChecks = [];
      if (filterActive) statusChecks.push(p.status === "Active");
      if (filterClosed) statusChecks.push(p.status === "Closed");
      if (contracts.valid) statusChecks.push(p.validTill && new Date(p.validTill) >= todayStart);
      if (contracts.closed) statusChecks.push(p.validTill && new Date(p.validTill) < todayStart);

      if (statusChecks.length > 0 && !statusChecks.some(Boolean)) return false;
      return true;
    });
  }, [from, to, geography, filterActive, filterClosed, contracts]);

  // summary metrics
 /* const totals = useMemo(() => {
    const totalPartners = filtered.length;
    const active = filtered.filter((p) => p.status === "Active").length;
    // derive valid/closed from validTill date (non-expired = valid, expired = closed)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const valid = filtered.filter(p => {
      const d = p.validTill ? new Date(p.validTill) : null;
      return d ? d >= todayStart : false;
    }).length;
    const closed = filtered.filter(p => {
      const d = p.validTill ? new Date(p.validTill) : null;
      return d ? d < todayStart : false;
    }).length;
    // expiring soon: validTill within next 30 days (inclusive)
    const in30 = new Date(todayStart.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiring = filtered.filter(p => {
      const d = p.validTill ? new Date(p.validTill) : null;
      return d ? (d >= todayStart && d <= in30) : false;
    }).length;
    return { totalPartners, active, valid, closed, expiring };
  }, [filtered]);
  */

  // Modify the status chart to show Active and Status Closed Request
  const statusChart = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      if (p.status === "Active") {
        map.set("Active", (map.get("Active") || 0) + 1);
      } else if (p.status === "Closed") {
        // map.set("Status Closed Request", (map.get("Status Closed Request") || 0) + 1);
        map.set("Closed", (map.get("Closed") || 0) + 1);
      }
    });
    const arr: { name: string; value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    return arr;
  }, [filtered]);

  // Modify the contractsChart logic to show all contracts by default
  const contractsChart = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      const validTillDate = p.validTill ? new Date(p.validTill) : null;
      if (validTillDate) {
        if (validTillDate >= todayStart) {
          map.set("Valid", (map.get("Valid") || 0) + 1);
        } else {
          map.set("Expire", (map.get("Expire") || 0) + 1);
        }
      }
    });
    const arr: { name: string, value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    return arr;
  }, [filtered]);

  // Update the Contracts by Status chart to use green for Active and red for Closed
  const statusData = useMemo(
    () => ({
      labels: statusChart.map((s) => s.name),
      datasets: [
        {
          data: statusChart.map((s) => s.value),
          backgroundColor: statusChart.map((s) =>
            s.name === "Active" ? "#55ac83" : "#f4577b" // Green for Active, Red for Closed
          ),
          hoverOffset: 8,
        },
      ],
    }),
    [statusChart]
  );

  // Update the Contracts (Valid / Expired) chart to use yellow for Valid and red for Expired
  const contractsData = useMemo(
    () => ({
      labels: contractsChart.map((c) => c.name),
      datasets: [
        {
          data: contractsChart.map((c) => c.value),
          backgroundColor: contractsChart.map((c) =>
            c.name === "Valid" ? "#f7c948" : "#f4577b" // Yellow for Valid, Red for Expired
          ),
          hoverOffset: 8,
        },
      ],
    }),
    [contractsChart]
  );

  // chart data objects
  // const statusData = useMemo(
  //   () => ({
  //     labels: statusChart.map((s) => s.name),
  //     datasets: [
  //       {
  //         data: statusChart.map((s) => s.value),
  //         backgroundColor: COLORS.slice(0, statusChart.length),
  //         hoverOffset: 8,
  //       },
  //     ],
  //   }),
  //   [statusChart]
  // );

  // derive geography chart data from filtered list
  const geoChart = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      map.set(p.geography, (map.get(p.geography) || 0) + 1);
    });
    const arr: { name: string; value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    return arr;
  }, [filtered]);

  // derive time series chart (group by YYYY-MM) from createdOn
  const timeChart = useMemo(() => {
    const map = new Map<string, number>();
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    filtered.forEach((p) => {
      if (!p.createdOn) return;
      const createdDate = new Date(p.createdOn);
      if (createdDate < oneYearAgo) return; // Exclude data older than 12 months

      const month = (createdDate.getMonth() + 1).toString();
      const key = `${createdDate.getFullYear()}-${("0" + month).slice(-2)}`;
      map.set(key, (map.get(key) || 0) + 1);
    });

    // Sort keys ascending
    const keysArr: string[] = [];
    map.forEach((_, k) => keysArr.push(k));
    const keys = keysArr.sort();
    const arr: { name: string; value: number }[] = keys.map((k) => ({
      name: k,
      value: map.get(k) || 0,
    }));
    return arr;
  }, [filtered]);

  const geoData = useMemo(
    () => ({
      labels: geoChart.map((g) => g.name),
      datasets: [
        {
          label: "Partners",
          data: geoChart.map((g) => g.value),
          backgroundColor: geoChart.map((_, i) => COLORS[i % COLORS.length]),
        },
      ],
    }),
    [geoChart]
  );

  const timeData = useMemo(
    () => ({
      labels: timeChart.map((t) => t.name),
      datasets: [
        {
          label: "Contracts",
          data: timeChart.map((t) => t.value),
          borderColor: "#5865f2",
          backgroundColor: "rgba(88, 101, 242, 0.15)",
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [timeChart]
  );

  // Add a new chart for Partners by Type
  const typeChart = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      map.set(p.typeOfPartner, (map.get(p.typeOfPartner) || 0) + 1);
    });
    const arr: { name: string; value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    return arr;
  }, [filtered]);

  const typeData = useMemo(
    () => ({
      labels: typeChart.map((t) => t.name),
      datasets: [
        {
          data: typeChart.map((t) => t.value),
          backgroundColor: COLORS.slice(0, typeChart.length),
          hoverOffset: 8,
        },
      ],
    }),
    [typeChart]
  );

  // style objects
  // const baseShadow = "0 4px 20px rgba(88,101,242,0.08)";
  const surfaceShadow = "0 2px 12px rgba(88,101,242,0.08)";
  const sectionBorder = "2px solid #e3e7fa";

  const inputStyle = {
    padding: "10px 14px",
    border: "1px solid #d1d9f0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "box-shadow 0.2s, border-color 0.2s",
    background: "#f8fafc",
    color: "#23263b",
  };
  const buttonStyle = {
    padding: "9px 20px",
    background: "linear-gradient(90deg, #5865f2 30%, #675dcd 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(88, 101, 242, 0.14)",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  // Add styles for the table container and scrollbar
  const tableContainerStyle = {
    maxHeight: "400px", // Set the desired height
    overflowY: "auto" as "auto", // Explicitly cast to valid type
    scrollbarColor: "#5865f2 #e3e7fa", // For Firefox
  };

  const exportButtonStyle = {
    ...buttonStyle,
    marginBottom: "15px",
  };

  // Fix type issues for exportToCSV function
  function exportToCSV(data: Partner[]) {
    const csvContent = [
      ["Entity", "Parties", "Type", "Geography", "Valid Till", "Status", "Objective"],
      ...data.map((p: Partner) => [
        p.entityName,
        p.parties,
        p.typeOfPartner,
        p.geography,
        p.validTill || "N/A",
        p.status,
        p.objective,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "PartnershipDetails.csv";
    link.click();
  }

  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        // background: "linear-gradient(120deg, #e3eafc 50%, #f8fafb 100%)",
        minHeight: "100vh",
        padding: "12px",
      }}
    >
      {/* Header */}
      {/* <div style={{
                background: "linear-gradient(90deg, #4b91f1 0%, #8e9ae6 100%)",
                padding: "26px 38px",
                borderRadius: "14px",
                marginBottom: "28px",
                boxShadow: baseShadow,
                position: "relative",
                overflow: "hidden"
            }}>
                <h1 style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: "32px",
                    fontWeight: "800",
                    letterSpacing: "-1px",
                    lineHeight: 1.2
                }}>
                    Partnership Dashboard
                </h1>
                <div style={{
                    marginTop: "7px",
                    color: "#e7ecfa",
                    fontSize: "16px",
                    fontWeight: 500,
                    textShadow: "0 1px 0 #4b91f1"
                }}>Strategically analyze and manage contracts and partners</div>
                <div style={{
                    position: "absolute",
                    top: 0, right: 0, width: 120, height: 120,
                    background: "radial-gradient(circle, #b8bdfc12 50%, transparent 80%)"
                }}/>
            </div> */}

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: "13px",
          padding: "12px",
          marginBottom: "20px",
          // marginBottom: "15px",
          boxShadow: surfaceShadow,
          border: sectionBorder,
        }}
      >
        <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "19px", color: "#23263b" }}>
                    Filters
                </div>
        <div
          style={{
            display: "flex",
            gap: "19px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}
            >
              From
            </span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}
            >
              To
            </span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}
            >
              Geography
            </span>
            <select
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              style={inputStyle}
            >
              {geographyOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}
            >
              Status
            </span>
            <div style={{ display: "flex", gap: "14px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={filterActive}
                  onChange={(e) => setFilterActive(e.target.checked)}
                  style={{
                    width: "17px",
                    height: "17px",
                    cursor: "pointer",
                    accentColor: "#4b91f1",
                  }}
                />
                <span style={{ fontSize: "15px", color: "#23263b" }}>
                  Active
                </span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={filterClosed}
                  onChange={(e) => setFilterClosed(e.target.checked)}
                  style={{
                    width: "17px",
                    height: "17px",
                    cursor: "pointer",
                    accentColor: "#4b91f1",
                  }}
                />
                <span style={{ fontSize: "15px", color: "#23263b" }}>
                  InActive
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}
            >
              Contracts (Valid / Expired)
            </span>
            <div style={{ display: "flex", gap: "14px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={contracts.valid}
                  onChange={(e) =>
                    setContracts({ ...contracts, valid: e.target.checked })
                  }
                  style={{
                    width: "17px",
                    height: "17px",
                    cursor: "pointer",
                    accentColor: "#30aabc",
                  }}
                />
                <span style={{ fontSize: "15px", color: "#23263b" }}>
                  Valid
                </span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={contracts.closed}
                  onChange={(e) =>
                    setContracts({ ...contracts, closed: e.target.checked })
                  }
                  style={{
                    width: "17px",
                    height: "17px",
                    cursor: "pointer",
                    accentColor: "#a680be",
                  }}
                />
                <span style={{ fontSize: "15px", color: "#23263b" }}>
                  Closed
                </span>
              </label>
            </div>
          </div>
          {/* Update the clear filters button to reset all details and checkboxes */}
          <button
            onClick={() => {
              setFrom("");
              setTo("");
              setGeography("All");
              setFilterActive(false);
              setFilterClosed(false);
              setContracts({ valid: false, closed: false });
              // Clear filtered data
              // setFiltered([]);
            }}
            style={{
              ...buttonStyle,
              marginLeft: "auto",
              marginTop: "16px",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 22px rgba(88, 101, 242, 0.26)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = buttonStyle.boxShadow as string;
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {/* <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          // gap: "24px",
          gap: "15px",
          // marginBottom: "32px"
          marginBottom: "15px",
        }}
      >
        {[
          {
            label: "Total Partners",
            value: totals.totalPartners,
            colors: ["#5865f2", "#4b91f1"],
          },
          {
            label: "Active Partners",
            value: totals.active,
            colors: ["#30aabc", "#7bdff2"],
          },
          {
            label: "Valid Contracts",
            value: totals.valid,
            colors: ["#7b6ced", "#a7daff"],
          },
          {
            label: "Expiring (30d)",
            value: totals.expiring,
            colors: ["#ff9a76", "#ffcf8a"],
          },
          {
            label: "Closed Contracts",
            value: totals.closed,
            colors: ["#f4577b", "#fcaf58"],
          },
        ].map((item, idx) => (
          <div
            key={item.label}
            style={{
              background: `linear-gradient(110deg, ${item.colors[0]} 0%, ${item.colors[1]} 100%)`,
              // padding: "30px 0",
              padding: "10px 0",
              borderRadius: "13px",
              color: "#fff",
              boxShadow: baseShadow,
              textAlign: "center",
              transform: "scale(1)",
              transition: "box-shadow 0.2s, transform 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                opacity: 0.89,
                marginBottom: "12px",
                letterSpacing: 0,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "37px",
                fontWeight: 800,
                letterSpacing: "-1px",
                textShadow: "0 1px 0 #3740c7",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div> */}

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          // gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          // gap: "24px",
          gap: "15px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "13px",
            padding: "24px",
            // padding: "10px",
            border: sectionBorder,
            boxShadow: surfaceShadow,
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = surfaceShadow)
          }
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              marginBottom: "17px",
              color: "#5865f2",
            }}
          >
            Contracts by Status
          </div>
          <div style={{ height: 210 }}>
            <Pie data={statusData} options={commonOptions as any} />
          </div>
        </div>
         <div
          style={{
            background: "#f8fafc",
            borderRadius: "13px",
            padding: "24px",
            border: sectionBorder,
            boxShadow: surfaceShadow,
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = surfaceShadow)
          }
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              marginBottom: "17px",
              color: "#a680be",
            }}
          >
            Contracts (Valid / Expired)
          </div>
          <div style={{ height: 210 }}>
            <Pie data={contractsData} options={commonOptions as any} />
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "13px",
            padding: "24px",
            border: sectionBorder,
            boxShadow: surfaceShadow,
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = surfaceShadow)
          }
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              marginBottom: "17px",
              color: "#30aabc",
            }}
          >
            Partners by Geography
          </div>
          <div style={{ height: 210 }}>
            <Bar data={geoData} options={barOptions as any} />
          </div>
        </div>
        
        {/* <div
          style={{
            background: "#f8fafc",
            borderRadius: "13px",
            padding: "24px",
            border: sectionBorder,
            boxShadow: surfaceShadow,
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = surfaceShadow)
          }
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              marginBottom: "17px",
              color: "#7b6ced",
            }}
          >
            Contracts Created Over Time
          </div>
          <div style={{ height: 210 }}>
            <Line data={timeData} options={lineOptions as any} />
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "13px",
            padding: "24px",
            border: sectionBorder,
            boxShadow: surfaceShadow,
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = surfaceShadow)
          }
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              marginBottom: "17px",
              color: "#4f709c",
            }}
          >
            Partners by Type
          </div>
          <div style={{ height: 210 }}>
            <Pie data={typeData} options={commonOptions as any} />
          </div>
        </div> */}
      </div>
       <div
        style={{
          display: "grid",
          // gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          // gap: "24px",
          gap: "15px",
          marginBottom: "32px",
        }}
      >

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "13px",
            padding: "24px",
            border: sectionBorder,
            boxShadow: surfaceShadow,
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = surfaceShadow)
          }
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              marginBottom: "17px",
              color: "#7b6ced",
            }}
          >
            Contracts Created Over Time
          </div>
          <div style={{ height: 210 }}>
            <Line data={timeData} options={lineOptions as any} />
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "13px",
            padding: "24px",
            border: sectionBorder,
            boxShadow: surfaceShadow,
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = surfaceShadow)
          }
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              marginBottom: "17px",
              color: "#4f709c",
            }}
          >
            Partners by Type
          </div>
          <div style={{ height: 210 }}>
            <Pie data={typeData} options={commonOptions as any} />
          </div>
        </div>

      </div>

      {/* Table Section */}
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "29px",
          boxShadow: surfaceShadow,
          border: sectionBorder,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "17px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#23263b",
            }}
          >
            Partnership Details
          </div>
          <button
            style={exportButtonStyle}
            onClick={() => exportToCSV(filtered)}
          >
            Export to CSV
          </button>
        </div>
        <div style={{ ...tableContainerStyle, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "15px",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(110deg, #4b91f1 0%, #8e9ae6 100%)",
                  color: "#fff",
                }}
              >
                <th
                  style={{
                    padding: "16px 13px",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  Entity
                </th>
                <th
                  style={{
                    padding: "16px 13px",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  Parties
                </th>
                <th
                  style={{
                    padding: "16px 13px",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    padding: "16px 13px",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  Geography
                </th>
                <th
                  style={{
                    padding: "16px 13px",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  Valid Till
                </th>
                <th
                  style={{
                    padding: "16px 13px",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "16px 13px",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  Objective
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                // derive validity from validTill
                const validTillDate = p.validTill ? new Date(p.validTill) : null;
                const today = new Date();
                const todayStart = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate()
                );
                const contractIsValid = validTillDate
                  ? validTillDate >= todayStart
                  : false;
                const contractIsClosed = validTillDate
                  ? validTillDate < todayStart
                  : false;

                // determine display label per request
                // - Inactive  -> "Closed Status Request"
                // - Active    -> "Active Status Request"
                // - otherwise use validTill to decide between "Valid" and "Closed"
                let statusLabel: string;
                if (p.status === "Closed") {
                  statusLabel = "Closed";
                } else if (p.status === "Active") {
                  statusLabel = "Active";
                } else {
                  // for other statuses rely on validTill date
                  statusLabel = contractIsValid ? "Valid" : "Closed";
                }

                // colors: Active uses active color, Inactive and closed use closed color, else a neutral color
                const activeBg = "#d9f9ec";
                const closedBg = "#fae2e9";
                const neutralBg = "#fff5e0";
                const activeColor = "#55ac83";
                const closedColor = "#f4577b";
                const neutralColor = "#f79e16";

                const background = p.status === "Active" ? activeBg : (p.status === "Closed" || contractIsClosed) ? closedBg : neutralBg;
                const color = p.status === "Active" ? activeColor : (p.status === "Closed" || contractIsClosed) ? closedColor : neutralColor;

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #e3e7fa",
                      background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                      transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#e3eafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        idx % 2 === 0 ? "#f8fafc" : "#fff")
                    }
                  >
                    <td
                      style={{
                        padding: "13px",
                        fontWeight: "600",
                        color: "#23263b",
                      }}
                    >
                      {p.entityName}
                    </td>
                    <td style={{ padding: "13px", color: "#4f709c" }}>
                      {p.parties}
                    </td>
                    <td style={{ padding: "13px", color: "#4f709c" }}>
                      {p.typeOfPartner}
                    </td>
                    <td style={{ padding: "13px", color: "#4f709c" }}>
                      {p.geography}
                    </td>
                    <td style={{ padding: "13px", color: "#4f709c" }}>
                      {p.validTill ? new Date(p.validTill).toLocaleDateString() : "N/A"}
                    </td>
                    <td style={{ padding: "13px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 14px",
                          borderRadius: "14px",
                          fontSize: "13px",
                          fontWeight: 700,
                          background,
                          color,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td style={{ padding: "13px", color: "#7b7b94" }}>
                      {p.objective}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "36px",
                      textAlign: "center",
                      color: "#b6c0e1",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    No records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
