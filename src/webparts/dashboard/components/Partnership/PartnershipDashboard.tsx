/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion*/
/*eslint-disable no-return-assign */
/*eslint-disable @typescript-eslint/prefer-as-const */
/*eslint-disable react/self-closing-comp  */
/*eslint-disable @rushstack/no-new-null  */

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { sp } from "@pnp/sp";
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
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import "./PartnershipDashboard.css";

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
        boxWidth: 14,
        padding: 12,
        font: {
          size: 13,
          weight: '600',
        },
        color: '#1e293b',
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 14,
      borderColor: 'rgba(102, 126, 234, 0.5)',
      borderWidth: 2,
      cornerRadius: 10,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
      displayColors: true,
      boxPadding: 6,
    },
  },
};

const barOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { 
      enabled: true,
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      padding: 14,
      cornerRadius: 10,
      borderColor: 'rgba(102, 126, 234, 0.5)',
      borderWidth: 2,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { 
        autoSkip: false,
        color: '#64748b',
        font: { size: 11, weight: '500' }
      },
    },
    y: {
      beginAtZero: true,
      ticks: { 
        precision: 0,
        color: '#64748b',
        font: { weight: '500' }
      },
      grid: {
        color: 'rgba(102, 126, 234, 0.1)',
        drawBorder: false,
      },
    },
  },
};

const lineOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { 
      enabled: true,
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      padding: 14,
      cornerRadius: 10,
      borderColor: 'rgba(102, 126, 234, 0.5)',
      borderWidth: 2,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  scales: {
    x: { 
      grid: { 
        display: true,
        color: 'rgba(102, 126, 234, 0.08)',
        drawBorder: false,
      },
      ticks: {
        color: '#64748b',
        font: { size: 11, weight: '500' }
      }
    },
    y: { 
      beginAtZero: true, 
      ticks: { 
        precision: 0,
        color: '#64748b',
        font: { weight: '500' }
      },
      grid: {
        color: 'rgba(102, 126, 234, 0.1)',
        drawBorder: false,
      },
    },
  },
  elements: {
    point: { 
      radius: 5, 
      hoverRadius: 8,
      backgroundColor: '#667eea',
      borderWidth: 3,
    },
    line: { 
      tension: 0.4,
      borderWidth: 3,
    },
  },
};

type Partner = {
  id: number;
  entityName: string;
  parties: number;
  typeOfPartner: string;
  geography: string;
  validTill?: string | null;
  createdOn?: string | null;
  status?: string;
  governingLaw?: string;
  objective?: string;
  contactPersonName?: string;
  signatory?: string;
  typeOfInstrument?: string;
};

// const COLORS = [
//   "#667eea", "#764ba2", "#f093fb", "#4facfe", 
//   "#43e97b", "#fa709a", "#fee140", "#30cfd0",
//   "#a8edea", "#fed6e3", "#c471f5", "#fa8bff"
// ];

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
  const [partners, setPartners] = useState<Partner[]>([]); 
  const operationalPartnership = "PartnershipDetails";

  // Fetch data from the operationalPartnership list
  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle(operationalPartnership)
          .items.get();
        console.log("Fetched items:", items);

        const formattedItems = items.map((item: any) => ({
          id: item.ID,
          entityName: item.EntityName || "N/A",
          parties: item.NoOfParties || 0,
          typeOfPartner: item.TypeOfPartner || "N/A",
          geography: item.Geography || "N/A",
          validTill: item.ValidTill || null,
          createdOn: item.Created || null,
          status: item.JhpiegoStatus || "N/A",
          governingLaw: item.GoverningLaw || "N/A",
          signatory: item.Signatory || "N/A",
          contactPersonName: item.ContactPersonName || "N/A",
          typeOfInstrument: item.TypeOfInstrument || "N/A",
          objective: item.Objective || "N/A",
        }));
        setPartners(formattedItems); 
      } catch (error) {
        console.error(
          "Error fetching data from operationalPartnership list:",
          error
        );
      }
    };

    fetchData();
  }, []);

  // Derived list of geographies
  const geographyOptions = useMemo(() => {
    const s = new Set(partners.map((d) => d.geography));
    const arr: string[] = [];
    s.forEach((v) => arr.push(v));
    return ["All", ...arr];
  }, [partners]);

  // Filter logic
  const filtered = useMemo(() => {
    return partners.filter((p) => {
      if (geography !== "All" && p.geography !== geography) return false;
      if (from || to) {
        const validDate = p.validTill ? new Date(p.validTill) : null;
        if (!validDate) return false;
        if (from && validDate < new Date(from)) return false;
        if (to && validDate > new Date(to)) return false;
      }

      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const statusChecks = [];
      if (filterActive) statusChecks.push(p.status === "Active");
      if (filterClosed) statusChecks.push(p.status === "Inactive");
      if (contracts.valid)
        statusChecks.push(p.validTill && new Date(p.validTill) >= todayStart);
      if (contracts.closed)
        statusChecks.push(p.validTill && new Date(p.validTill) < todayStart);

      if (statusChecks.length > 0 && !statusChecks.some(Boolean)) return false;
      return true;
    });
  }, [from, to, geography, filterActive, filterClosed, contracts, partners]);

  const statusChart = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      if (p.status === "Active") {
        map.set("Active", (map.get("Active") || 0) + 1);
      } else if (p.status === "Inactive") {
        map.set("Inactive", (map.get("Inactive") || 0) + 1);
      }
    });
    const arr: { name: string; value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    return arr;
  }, [filtered]);

  const contractsChart = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      const validTillDate = p.validTill ? new Date(p.validTill) : null;
      if (validTillDate) {
        if (validTillDate >= todayStart) {
          map.set("Valid", (map.get("Valid") || 0) + 1);
        } else {
          map.set("Closed", (map.get("Closed") || 0) + 1);
        }
      }
    });
    const arr: { name: string; value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    return arr;
  }, [filtered]);

  const statusData = useMemo(
    () => ({
      labels: statusChart.map((s) => `${s.name}`),
      datasets: [
        {
          data: statusChart.map((s) => s.value),
          backgroundColor: statusChart.map((s) => 
            s.name === "Active" 
              ? "rgba(67, 233, 123, 0.85)" // Vibrant green
              : "rgba(244, 87, 123, 0.85)" // Coral red
          ),
          borderColor: statusChart.map((s) => 
            s.name === "Active" ? "#43e97b" : "#f4577b"
          ),
          borderWidth: 2,
          hoverOffset: 12,
          hoverBorderWidth: 3,
        },
      ],
    }),
    [statusChart]
  );

  const contractsData = useMemo(
    () => ({
      labels: contractsChart.map((c) => `${c.name}`),
      datasets: [
        {
          data: contractsChart.map((c) => c.value),
          backgroundColor: contractsChart.map((c) =>
            c.name === "Valid" 
              ? "rgba(254, 225, 64, 0.85)" // Golden yellow
              : "rgba(244, 87, 123, 0.85)" // Coral red
          ),
          borderColor: contractsChart.map((c) =>
            c.name === "Valid" ? "#fee140" : "#f4577b"
          ),
          borderWidth: 2,
          hoverOffset: 12,
          hoverBorderWidth: 3,
        },
      ],
    }),
    [contractsChart]
  );

  const geoChart = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      map.set(p.geography, (map.get(p.geography) || 0) + 1);
    });
    const arr: { name: string; value: number }[] = [];
    map.forEach((value, name) => arr.push({ name, value }));
    return arr;
  }, [filtered]);

  const geoData = useMemo(
    () => ({
      labels: geoChart.map((g) => g.name),
      datasets: [
        {
          label: "Partners",
          data: geoChart.map((g) => g.value),
          backgroundColor: geoChart.map((_, i) => {
            const colors = [
              "rgba(102, 126, 234, 0.85)",
              "rgba(118, 75, 162, 0.85)",
              "rgba(240, 147, 251, 0.85)",
              "rgba(79, 172, 254, 0.85)",
              "rgba(67, 233, 123, 0.85)",
              "rgba(250, 112, 154, 0.85)",
              "rgba(254, 225, 64, 0.85)",
              "rgba(48, 207, 208, 0.85)",
            ];
            return colors[i % colors.length];
          }),
          borderColor: geoChart.map((_, i) => {
            const colors = [
              "#667eea", "#764ba2", "#f093fb", "#4facfe",
              "#43e97b", "#fa709a", "#fee140", "#30cfd0"
            ];
            return colors[i % colors.length];
          }),
          borderWidth: 2,
          borderRadius: 12,
          hoverBackgroundColor: geoChart.map((_, i) => {
            const colors = [
              "rgba(102, 126, 234, 1)",
              "rgba(118, 75, 162, 1)",
              "rgba(240, 147, 251, 1)",
              "rgba(79, 172, 254, 1)",
              "rgba(67, 233, 123, 1)",
              "rgba(250, 112, 154, 1)",
              "rgba(254, 225, 64, 1)",
              "rgba(48, 207, 208, 1)",
            ];
            return colors[i % colors.length];
          }),
        },
      ],
    }),
    [geoChart]
  );

  const upcomingValidTill = useMemo(() => {
    const now = new Date();
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      if (!p.validTill) return;
      const d = new Date(p.validTill);
      if (isNaN(d.getTime())) return;
      if (d <= now) return; 
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    });

    const arr: { name: string; value: number }[] = [];
    map.forEach((value, key) => arr.push({ name: key, value }));
    arr.sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    return arr.slice(0, 12); 
  }, [filtered]);

  const timeData = useMemo(
    () => ({
      labels: upcomingValidTill.map((t) => t.name),
      datasets: [
        {
          label: "Contracts",
          data: upcomingValidTill.map((t) => t.value),
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.2)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#667eea",
          pointBorderColor: "#fff",
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: "#764ba2",
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 3,
        },
      ],
    }),
    [upcomingValidTill]
  );

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
          backgroundColor: typeChart.map((_, i) => {
            const colors = [
              "rgba(102, 126, 234, 0.85)",
              "rgba(118, 75, 162, 0.85)",
              "rgba(240, 147, 251, 0.85)",
              "rgba(79, 172, 254, 0.85)",
              "rgba(67, 233, 123, 0.85)",
              "rgba(250, 112, 154, 0.85)",
              "rgba(254, 225, 64, 0.85)",
              "rgba(48, 207, 208, 0.85)",
              "rgba(168, 237, 234, 0.85)",
              "rgba(254, 214, 227, 0.85)",
              "rgba(196, 113, 245, 0.85)",
              "rgba(250, 139, 255, 0.85)",
            ];
            return colors[i % colors.length];
          }),
          borderColor: typeChart.map((_, i) => {
            const colors = [
              "#667eea", "#764ba2", "#f093fb", "#4facfe",
              "#43e97b", "#fa709a", "#fee140", "#30cfd0",
              "#a8edea", "#fed6e3", "#c471f5", "#fa8bff"
            ];
            return colors[i % colors.length];
          }),
          borderWidth: 2,
          hoverOffset: 12,
          hoverBorderWidth: 3,
        },
      ],
    }),
    [typeChart]
  );

  const PartnersByType = () => {
    const legendRef = React.useRef<HTMLDivElement>(null);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "24px",
          padding: "20px",
          width: "100%",
        }}
      >
        <div style={{ width: "45%" }}>
          <Pie
            data={typeData}
            options={{
              ...commonOptions,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      const dataset = tooltipItem.dataset;
                      const total = dataset.data.reduce((acc, v) => acc + v, 0);
                      const value = dataset.data[tooltipItem.dataIndex];
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${tooltipItem.label}: ${percentage}% (${value})`;
                    },
                  },
                },
              },
            }}
            height={350}
          />
        </div>

        <div
          ref={legendRef}
          className="chart-scrollbar"
          style={{
            width: "55%",
            maxHeight: "300px",
            overflowY: "auto",
            padding: "12px",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              fontSize: "13px",
              fontWeight: "700",
              color: "#1e293b",
              borderBottom: "2px solid #e2e8f0",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span>Partner Type</span>
            <span>Count</span>
          </div>

          {typeData.labels.map((label: string, index: number) => {
            const backgroundColor =
              typeData.datasets[0].backgroundColor[
                index % typeData.datasets[0].backgroundColor.length
              ];

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 0",
                  fontSize: "14px",
                  color: "#475569",
                  fontWeight: 500,
                  borderBottom: "1px solid #f1f5f9",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: backgroundColor,
                    marginRight: "12px",
                    flexShrink: 0,
                    boxShadow: `0 2px 8px ${backgroundColor}40`,
                  }}
                ></div>

                <span style={{ flex: 1, color: "#1e293b", fontWeight: 600 }}>{label}</span>

                <span style={{ 
                  fontWeight: "700", 
                  color: "#5865f2",
                  fontSize: "15px",
                }}>
                  {typeData.datasets[0].data[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        {/* <div style={{
          marginBottom: '35px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: '#ffffff',
            margin: '0 0 10px 0',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            letterSpacing: '-0.5px',
          }}>
            🤝 Partnership Dashboard
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            fontWeight: '500',
          }}>
            Strategically analyze and manage contracts and partners
          </p>
        </div> */}

        {/* Filters */}
        <div className="filter-card-partnership">
           <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: 8, borderBottom: '1px solid', padding: 5 }}>
            <div className="filter-icon-partnership">📊</div>

               <button
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setGeography("All");
                  setFilterActive(false);
                  setFilterClosed(false);
                  setContracts({ valid: false, closed: false });
                }}
                className="clear-button-partnership"
              >
                🔄 Clear Filters
              </button>
            </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
           
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: 1, flexWrap: 'wrap', justifyContent:'center' }}>
              <div className="date-input-group-partnership">
                <label>From Date</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="date-input-partnership"
                />
              </div>

              <div className="date-input-group-partnership">
                <label>To Date</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="date-input-partnership"
                />
              </div>

              <div className="location-filter-group-partnership">
                <label>🌍 Geography</label>
                <select
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                  className="location-select-partnership"
                >
                  {geographyOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="checkbox-group-partnership">
                <label>Status</label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <label className="checkbox-label-partnership">
                    <input
                      type="checkbox"
                      checked={filterActive}
                      onChange={(e) => setFilterActive(e.target.checked)}
                      className="checkbox-input-partnership"
                    />
                    <span>Active</span>
                  </label>
                  <label className="checkbox-label-partnership">
                    <input
                      type="checkbox"
                      checked={filterClosed}
                      onChange={(e) => setFilterClosed(e.target.checked)}
                      className="checkbox-input-partnership"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              <div className="checkbox-group-partnership">
                <label>Contracts</label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <label className="checkbox-label-partnership">
                    <input
                      type="checkbox"
                      checked={contracts.valid}
                      onChange={(e) => setContracts({ ...contracts, valid: e.target.checked })}
                      className="checkbox-input-partnership"
                    />
                    <span>Valid</span>
                  </label>
                  <label className="checkbox-label-partnership">
                    <input
                      type="checkbox"
                      checked={contracts.closed}
                      onChange={(e) => setContracts({ ...contracts, closed: e.target.checked })}
                      className="checkbox-input-partnership"
                    />
                    <span>Closed</span>
                  </label>
                </div>
              </div>

             
            </div>
          </div>
        </div>

        {/* Charts Section - First Row */}
        <div className="grid-3-partnership">
          <div className="dashboard-card-partnership">
            <div className="card-header-partnership">
              <h2>📋 Contracts by Status</h2>
              <span className="card-subtitle-partnership">Active vs Inactive</span>
            </div>
            <div style={{ height: '280px', padding: '10px 0' }}>
              <Pie data={statusData} options={commonOptions as any} />
            </div>
          </div>

          <div className="dashboard-card-partnership">
            <div className="card-header-partnership">
              <h2>📅 Contracts Status</h2>
              <span className="card-subtitle-partnership">Valid vs Expired</span>
            </div>
            <div style={{ height: '280px', padding: '10px 0' }}>
              <Pie data={contractsData} options={commonOptions as any} />
            </div>
          </div>

          <div className="dashboard-card-partnership">
            <div className="card-header-partnership">
              <h2>🌍 Partners by Geography</h2>
              <span className="card-subtitle-partnership">Regional Distribution</span>
            </div>
            <div style={{ height: '280px', padding: '10px 0' }}>
              <Bar data={geoData} options={barOptions as any} />
            </div>
          </div>
        </div>

        {/* Charts Section - Second Row */}
        <div className="grid-2-partnership">
          <div className="dashboard-card-partnership">
            <div className="card-header-partnership">
              <h2>📈 Upcoming Valid Till</h2>
              <span className="card-subtitle-partnership">Contract Timeline</span>
            </div>
            <div style={{ height: '280px', padding: '10px 0' }}>
              <Line data={timeData} options={lineOptions as any} />
            </div>
          </div>

          <div className="dashboard-card-partnership">
            <div className="card-header-partnership">
              <h2>🏢 Partners by Type</h2>
              <span className="card-subtitle-partnership">Type Distribution</span>
            </div>
            <PartnersByType />
          </div>
        </div>

        {/* Table Section */}
        <div className="dashboard-card-partnership" style={{ marginBottom: '0' }}>
          <div className="card-header-partnership">
            <h2>📊 Partnership Details</h2>
            <span className="card-subtitle-partnership">Complete Partnership Records</span>
          </div>
          <div style={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={filtered.map((p, idx) => ({ ...p, id: p.id || idx }))}
              columns={[
                { field: "entityName", headerName: "Entity", width: 150 },
                { field: "parties", headerName: "Parties", width: 100 },
                { field: "typeOfPartner", headerName: "Type", width: 150 },
                { field: "geography", headerName: "Geography", width: 150 },
                { field: "validTill", headerName: "Valid Till", width: 120 },
                { field: "status", headerName: "Status", width: 120 },
                { field: "objective", headerName: "Objective", width: 200 },
                {
                  field: "contactPersonName",
                  headerName: "Contact Person",
                  width: 150,
                },
                { field: "createdOn", headerName: "Created", width: 120 },
                {
                  field: "governingLaw",
                  headerName: "Governing Law",
                  width: 150,
                },
                { field: "signatory", headerName: "Signatory", width: 150 },
                {
                  field: "typeOfInstrument",
                  headerName: "Instrument Type",
                  width: 150,
                },
              ]}
              components={{ Toolbar: GridToolbar }}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
              }}
              pageSizeOptions={[10, 20, 50]}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: 'none',
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#5865f2",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "700",
                  borderRadius: '12px 12px 0 0',
                },
                "& .MuiDataGrid-columnHeader": {
                  outline: 'none !important',
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: '1px solid #f1f5f9',
                  color: '#475569',
                  fontSize: '13px',
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: '#f8fafc',
                },
                "& .MuiDataGrid-virtualScroller": {
                  overflowY: "auto",
                },
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                  width: "10px",
                  height: "10px"
                },
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
                  background: "#f1f5f9",
                  borderRadius: "10px",
                },
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
                  background: "#5865f2",
                  borderRadius: "10px",
                },
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover": {
                  background: "#4b52d9",
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: '2px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          .filter-card-partnership {
            background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 28px 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.12);
            margin-bottom: 35px;
            border: 1px solid rgba(255,255,255,0.3);
            transition: all 0.3s ease;
          }

          .filter-card-partnership:hover {
            box-shadow: 0 15px 50px rgba(0,0,0,0.18);
            transform: translateY(-2px);
          }

          .filter-icon-partnership {
            font-size: 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            flex-shrink: 0;
          }

          .date-input-group-partnership {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .date-input-group-partnership label,
          .location-filter-group-partnership label,
          .checkbox-group-partnership label {
            font-weight: 600;
            font-size: 13px;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .date-input-partnership {
            padding: 12px 16px;
            border-radius: 12px;
            border: 2px solid #e2e8f0;
            font-size: 14px;
            font-weight: 500;
            color: #1e293b;
            background: white;
            transition: all 0.2s ease;
            min-width: 160px;
          }

          .date-input-partnership:hover {
            border-color: #cbd5e1;
          }

          .date-input-partnership:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .location-filter-group-partnership {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .location-select-partnership {
            padding: 12px 16px;
            border-radius: 12px;
            border: 2px solid #e2e8f0;
            font-size: 14px;
            font-weight: 500;
            color: #1e293b;
            background: white;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 180px;
          }

          .location-select-partnership:hover {
            border-color: #cbd5e1;
          }

          .location-select-partnership:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .checkbox-group-partnership {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .checkbox-label-partnership {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
            color: #1e293b;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .checkbox-label-partnership:hover {
            color: #5865f2;
          }

          .checkbox-input-partnership {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #5865f2;
          }

          .clear-button-partnership {
            padding: 12px 24px;
            background: linear-gradient(135deg, #5865f2 0%, #764ba2 100%);
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(88, 101, 242, 0.3);
            transition: all 0.3s ease;
            margin-left: auto;
            white-space: nowrap;
          }

          .clear-button-partnership:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(88, 101, 242, 0.4);
          }

          .clear-button-partnership:active {
            transform: translateY(0);
          }

          .grid-3-partnership {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
          }

          .grid-2-partnership {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
          }

          .dashboard-card-partnership {
            background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.12);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255,255,255,0.3);
            position: relative;
            overflow: hidden;
          }

          .dashboard-card-partnership::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s ease;
          }

          .dashboard-card-partnership:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          }

          .dashboard-card-partnership:hover::before {
            transform: scaleX(1);
          }

          .card-header-partnership {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f1f5f9;
          }

          .card-header-partnership h2 {
            margin: 0 0 6px 0;
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: -0.3px;
          }

          .card-subtitle-partnership {
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .chart-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .chart-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }

          .chart-scrollbar::-webkit-scrollbar-thumb {
            background: #5865f2;
            border-radius: 10px;
          }

          .chart-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #4b52d9;
          }

          @media (max-width: 1400px) {
            .grid-2-partnership {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 1200px) {
            .grid-3-partnership {
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }
          }

          @media (max-width: 768px) {
            .filter-card-partnership {
              padding: 20px;
            }

            .dashboard-card-partnership {
              padding: 20px;
            }

            .card-header-partnership h2 {
              font-size: 18px;
            }

            .grid-3-partnership,
            .grid-2-partnership {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
}