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
  validTill?: string | null;
  createdOn?: string | null;
  status?: string;
  governingLaw?: string;
  objective?: string;
  contactPersonName?: string;
  signatory?: string;
  typeOfInstrument?: string;
};

const COLORS = ["#5865f2", "#4b91f1", "#a680be", "#4f709c", "#30aabc"];

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
  // const [showAll, setShowAll] = useState<boolean>(false);

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

  // Modify the status chart to show Active and Status Closed Request
  const statusChart = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      if (p.status === "Active") {
        // map.set("Active", (map.get("Active") || 0) + 1);
        map.set("Active", (map.get("Active") || 0) + 1);
      } else if (p.status === "Inactive") {
        // map.set("Status Closed Request", (map.get("Status Closed Request") || 0) + 1);
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
      // labels: statusChart.map((s) => `${s.name} (${s.value})`),
      labels: statusChart.map((s) => `${s.name}`),
      datasets: [
        {
          data: statusChart.map((s) => s.value),
          backgroundColor: statusChart.map(
            (s) => (s.name === "Active" ? "#55ac83" : "#f4577b") // Green for Active, Red for Closed
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
      // labels: contractsChart.map((c) => `${c.name} (${c.value})`),
      labels: contractsChart.map((c) => `${c.name}`),
      datasets: [
        {
          data: contractsChart.map((c) => c.value),
          backgroundColor: contractsChart.map(
            (c) => (c.name === "Valid" ? "#f7c948" : "#f4577b") 
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
  // const timeChart = useMemo(() => {
  //   const map = new Map<string, number>();
  //   const today = new Date();
  //   const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  //   filtered.forEach((p) => {
  //     if (!p.createdOn) return;
  //     const createdDate = new Date(p.createdOn);
  //     if (createdDate < oneYearAgo) return; // Exclude data older than 12 months

  //     const month = (createdDate.getMonth() + 1).toString();
  //     const key = `${createdDate.getFullYear()}-${("0" + month).slice(-2)}`;
  //     map.set(key, (map.get(key) || 0) + 1);
  //   });

  //   // Sort keys ascending
  //   const keysArr: string[] = [];
  //   map.forEach((_, k) => keysArr.push(k));
  //   const keys = keysArr.sort();
  //   const arr: { name: string; value: number }[] = keys.map((k) => ({
  //     name: k,
  //     value: map.get(k) || 0,
  //   }));
  //   return arr;
  // }, [filtered]);

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
          borderColor: "#5865f2",
          backgroundColor: "rgba(88, 101, 242, 0.15)",
          fill: true,
          tension: 0.3,
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
          backgroundColor: COLORS.slice(0, typeChart.length),
          hoverOffset: 8,
        },
      ],
    }),
    [typeChart]
  );

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

  // const PartnersByType = () => (
  //   <div style={{ display: "flex", alignItems: "center", padding: "24px" }}>
  //     {/* Chart on the left */}
  //     <div style={{ flex: 1 }}>
  //       <Pie
  //         data={typeData}
  //         options={{
  //           ...commonOptions,
  //           plugins: {
  //             ...commonOptions.plugins,
  //             tooltip: {
  //               callbacks: {
  //                 label: function (tooltipItem) {
  //                   const dataset = tooltipItem.dataset;
  //                   const total = dataset.data.reduce(
  //                     (acc, value) => acc + value,
  //                     0
  //                   );
  //                   const value = dataset.data[tooltipItem.dataIndex];
  //                   const percentage = ((value / total) * 100).toFixed(2);
  //                   return `${tooltipItem.label}: ${percentage}% (${value})`;
  //                 },
  //               },
  //             },
  //           },
  //         }}
  //       />
  //     </div>

  //     {/* Names with counts on the right */}
  //     <div style={{ flex: 1, paddingLeft: "20px" }}>
  //       {typeChart.map((t) => (
  //         <div
  //           key={t.name}
  //           style={{
  //             display: "flex",
  //             justifyContent: "space-between",
  //             marginBottom: "8px",
  //             fontSize: "14px",
  //             fontWeight: "600",
  //             color: "#4f709c",
  //           }}
  //         >
  //           <span>{t.name}</span>
  //           <span>{t.value}</span>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  //   const PartnersByType = () => (
  //   <div
  //     style={{
  //       display: "flex",
  //       alignItems: "flex-start",
  //       justifyContent: "space-between",
  //       padding: "24px",
  //       gap: "20px",
  //     }}
  //   >
  //     {/* Chart on the left */}
  //     <div style={{ flex: "0 0 40%", display: "flex", justifyContent: "center" }}>
  //       <Pie
  //   data={typeData}
  //   options={{
  //     ...commonOptions,
  //     plugins: {
  //       ...commonOptions.plugins,
  //       // legend: {
  //       //   display: false,  
  //       // },
  //       legend: {
  //   display: true,
  //   position: "right",
  //   labels: {
  //     usePointStyle: true,
  //     padding: 20,
  //   },
  // },

  //       tooltip: {
  //         callbacks: {
  //           label: function (tooltipItem) {
  //             const dataset = tooltipItem.dataset;
  //             const total = dataset.data.reduce((acc, value) => acc + value, 0);
  //             const value = dataset.data[tooltipItem.dataIndex];
  //             const percentage = ((value / total) * 100).toFixed(2);
  //             return `${tooltipItem.label}: ${percentage}% (${value})`;
  //           },
  //         },
  //       },
  //     },
  //   }}
  // />

  //     </div>

  //     {/* Labels on the right */}
  //     <div
  //       style={{
  //         flex: "0 0 60%",
  //         paddingLeft: "20px",
  //         maxHeight: "300px", 
  //         overflowY: "auto", 
  //         border: "1px solid #e3e7fa", 
  //         borderRadius: "8px",
  //         padding: "10px",
  //       }}
  //     >
  //       {typeChart.map((t, index) => (
  //         <div
  //           key={index}
  //           style={{
  //             display: "flex",
  //             alignItems: "center",
  //             marginBottom: "8px",
  //             fontSize: "14px",
  //             fontWeight: "600",
  //             color: "#4f709c",
  //           }}
  //         >
  //           <div
  //             style={{
  //               width: "12px",
  //               height: "12px",
  //               backgroundColor: COLORS[index % COLORS.length],
  //               marginRight: "8px",
  //             }}
  //           />
  //           <span style={{ flex: 1 }}>{t.name}</span>
  //           <span>{t.value}</span>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  // const PartnersByType = () => (
  //   <div
  //     style={{
  //       display: "flex",
  //       justifyContent: "center",
  //       padding: "24px",
  //       width: "100%",
  //     }}
  //   >
  //     <div
  //       style={{
  //         display: "flex",
  //         width: "100%",
  //         maxWidth: "900px",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <Pie
  //         data={typeData}
  //         options={{
  //           ...commonOptions,
  //           maintainAspectRatio: false,
  //           plugins: {
  //             ...commonOptions.plugins,
  //             legend: {
  //               display: true,
  //               position: "right",
  //               fullSize: true,
  //               labels: {
  //                 usePointStyle: true,
  //                 padding: 18,
  //                 boxWidth: 12,
  //                 font: {
  //                   size: 13,
  //                 },
  //               },
  //             },
  //             tooltip: {
  //               callbacks: {
  //                 label: function (tooltipItem) {
  //                   const dataset = tooltipItem.dataset;
  //                   const total = dataset.data.reduce((acc, v) => acc + v, 0);
  //                   const value = dataset.data[tooltipItem.dataIndex];
  //                   const percentage = ((value / total) * 100).toFixed(2);
  //                   return `${tooltipItem.label}: ${percentage}% (${value})`;
  //                 },
  //               },
  //             },
  //           },
  //         }}
  //         height={350} 
  //       />
  //     </div>
  //   </div>
  // );

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
        {/* Pie Chart */}
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

        {/* Scrollable Legend with Headings */}
        <div
          ref={legendRef}
          className="chart-scrollbar"
          style={{
            width: "55%",
            maxHeight: "300px",
            overflowY: "auto",
            padding: "12px",
            border: "1px solid #e3e7fa",
            borderRadius: "8px",
            background: "#fafbff",
          }}
        >
          {/* Headings */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "#3a4b6b",
              borderBottom: "1px solid #e3e7fa",
              marginBottom: "8px",
            }}
          >
            <span>Name</span>
            <span>Count</span>
          </div>

          {/* Scrollable Content */}
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
                  padding: "6px 0",
                  fontSize: "14px",
                  color: "#3a4b6b",
                  fontWeight: 500,
                  borderBottom: "1px solid #eee",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: backgroundColor,
                    marginRight: "10px",
                  }}
                ></div>

                <span style={{ flex: 1 }}>{label}</span>

                <span style={{ fontWeight: "600" }}>
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
          // marginBottom: "20px",
          marginBottom: "12px",
          boxShadow: surfaceShadow,
          border: sectionBorder,
        }}
      >
        {/* <div style={{ fontSize: "17px", fontWeight: "700", marginBottom: "19px", color: "#23263b" }}>
                    Filters
                </div> */}
        <div
          style={{
            display: "flex",
            gap: "10px",
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
                  Inactive
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}
            >
              Contracts (Valid / Closed)
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
            }}
            style={{
              ...buttonStyle,
              marginLeft: "auto",
              marginTop: "16px",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 22px rgba(88, 101, 242, 0.26)";
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
            Upcoming Valid Till
          </div>
          <div style={{ height: 210 }}>
            <Line data={timeData} options={lineOptions as any} />
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
              color: "#4f709c",
            }}
          >
            Partners by Type
          </div>
          <div style={{ height: 210 }}>
            <Pie data={typeData} options={commonOptions as any} />
          </div>
        </div> */}

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
          <PartnersByType />
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
              "& .MuiDataGrid-columnHeader":
                {
                  background: "#4b91f1 !important",
                },

              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#4b91f1",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "bold",
              },

              "& .MuiDataGrid-virtualScroller": {
                overflowY: "auto",
              },

              /* 🔥 Custom Scrollbar */
              
              "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                width: "8px ",
                height:"8px"
              },
              "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
                background: "#e4e7ec",
                borderRadius: "8px",
              },
              "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
                background: "#4b91f1",
                borderRadius: "8px",
              },
              "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover": {
                background: "#3872c9",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
