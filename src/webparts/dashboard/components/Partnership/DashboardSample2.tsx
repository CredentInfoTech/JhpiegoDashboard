/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion*/
/*eslint-disable no-return-assign */
import * as React from "react";
import { useMemo, useState } from "react";

// remove Recharts imports and use Chart.js via react-chartjs-2
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
    Title
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

type Partner = {
    id: number;
    entityName: string;
    parties: number;
    typeOfPartner: string;
    geography: string;
    validTill: string; // ISO date
    createdOn: string; // ISO date
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


export default function PartnershipDashboardTwo(props: any) {
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");
    const [geography, setGeography] = useState<string>("All");
    const [filterActive, setFilterActive] = useState<boolean>(false);
    const [filterValid, setFilterValid] = useState<boolean>(false);
    const [filterClosed, setFilterClosed] = useState<boolean>(false);

    // derived list of geographies for the select
    const geographyOptions = useMemo(() => {
        const s = new Set(mockData.map(d => d.geography));
        const arr: string[] = [];
        s.forEach(v => arr.push(v));
        return ["All", ...arr];
    }, []);

    // filter logic
    const filtered = useMemo(() => {
        return mockData.filter(p => {
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

    // summary metrics
    const totals = useMemo(() => {
        const totalPartners = filtered.length;
        const active = filtered.filter(p => p.status === "Active").length;
        const valid = filtered.filter(p => p.status === "Valid").length;
        const closed = filtered.filter(p => p.status === "Closed").length;
        return { totalPartners, active, valid, closed };
    }, [filtered]);

    // chart: status breakdown
    const statusChart = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach(p => map.set(p.status, (map.get(p.status) || 0) + 1));

        const arr: { name: string; value: number }[] = [];
        map.forEach((value, name) => {
            arr.push({ name, value });
        });
        return arr;
    }, [filtered]);

    // chart: partners by geography
    const geoChart = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach(p => map.set(p.geography, (map.get(p.geography) || 0) + 1));
        const arr: { name: string; value: number }[] = [];
        map.forEach((value, name) => arr.push({ name, value }));
        return arr;
    }, [filtered]);

    // chart: contracts over time (year by createdOn)
    const timeChart = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach(p => {
            const year = new Date(p.createdOn).getFullYear().toString();
            map.set(year, (map.get(year) || 0) + 1);
        });
        const arr: { name: string; value: number }[] = [];
        map.forEach((value, name) => arr.push({ name, value }));
        arr.sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10));
        return arr;
    }, [filtered]);

    // Chart.js data/option objects (memoized)
    const statusData = useMemo(() => {
        return {
            labels: statusChart.map(s => s.name),
            datasets: [
                {
                    data: statusChart.map(s => s.value),
                    backgroundColor: COLORS.slice(0, statusChart.length),
                    hoverOffset: 8
                }
            ]
        } as any;
    }, [statusChart]);

    const geoData = useMemo(() => {
        return {
            labels: geoChart.map(g => g.name),
            datasets: [
                {
                    label: "Partners",
                    data: geoChart.map(g => g.value),
                    backgroundColor: geoChart.map((_, i) => COLORS[i % COLORS.length])
                }
            ]
        } as any;
    }, [geoChart]);

    const timeData = useMemo(() => {
        return {
            labels: timeChart.map(t => t.name),
            datasets: [
                {
                    label: "Contracts",
                    data: timeChart.map(t => t.value),
                    borderColor: "#8E24AA",
                    backgroundColor: "rgba(142,36,170,0.2)",
                    fill: true,
                    tension: 0.3
                }
            ]
        } as any;
    }, [timeChart]);

    const commonOptions = {
        plugins: {
            legend: { display: true, position: "bottom" as const },
            title: { display: false }
        },
        maintainAspectRatio: false,
        responsive: true
    };

    const barOptions = {
        ...commonOptions,
        scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true, precision: 0 } }
    };

    const lineOptions = {
        ...commonOptions,
        scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true, precision: 0 } }
    };

    const inputStyle = {
        padding: "8px 12px",
        border: "1px solid #e0e0e0",
        borderRadius: "6px",
        fontSize: "14px",
        outline: "none",
        transition: "all 0.2s",
    };

    const buttonStyle = {
        padding: "8px 16px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
    };

    return (
        <div style={{ 
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", 
            padding: "32px",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            minHeight: "100vh"
        }}>
            {/* Header */}
            <div style={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "24px 32px",
                borderRadius: "12px",
                marginBottom: "24px",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)"
            }}>
                <h1 style={{ 
                    margin: 0, 
                    color: "#fff",
                    fontSize: "28px",
                    fontWeight: "700",
                    letterSpacing: "-0.5px"
                }}>Partnership Dashboard</h1>
                <p style={{ margin: "8px 0 0 0", color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
                    Manage and analyze partnership contracts
                </p>
            </div>

            {/* Filters */}
            <div style={{ 
                background: "#fff", 
                padding: "24px", 
                borderRadius: "12px", 
                marginBottom: "24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
            }}>
                <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#2d3748" }}>
                    Filters
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#4a5568" }}>From Date</span>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#4a5568" }}>To Date</span>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#4a5568" }}>Geography</span>
                        <select value={geography} onChange={e => setGeography(e.target.value)} style={inputStyle}>
                            {geographyOptions.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </label>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#4a5568" }}>Status</span>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                <input type="checkbox" checked={filterActive} onChange={e => setFilterActive(e.target.checked)} 
                                    style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                                <span style={{ fontSize: "14px", color: "#2d3748" }}>Active</span>
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                <input type="checkbox" checked={filterValid} onChange={e => setFilterValid(e.target.checked)} 
                                    style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                                <span style={{ fontSize: "14px", color: "#2d3748" }}>Valid</span>
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                <input type="checkbox" checked={filterClosed} onChange={e => setFilterClosed(e.target.checked)} 
                                    style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                                <span style={{ fontSize: "14px", color: "#2d3748" }}>Closed</span>
                            </label>
                        </div>
                    </div>

                    <button 
                        onClick={() => { setFrom(""); setTo(""); setGeography("All"); setFilterActive(false); setFilterValid(false); setFilterClosed(false); }} 
                        style={{ ...buttonStyle, marginLeft: "auto", marginTop: "20px" }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div style={{ 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "24px",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                    transition: "transform 0.2s",
                    cursor: "pointer"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: "500", marginBottom: "8px" }}>Total Partners</div>
                    <div style={{ fontSize: "32px", fontWeight: "700" }}>{totals.totalPartners}</div>
                </div>
                <div style={{ 
                    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                    padding: "24px",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(17, 153, 142, 0.3)",
                    transition: "transform 0.2s",
                    cursor: "pointer"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: "500", marginBottom: "8px" }}>Active Partners</div>
                    <div style={{ fontSize: "32px", fontWeight: "700" }}>{totals.active}</div>
                </div>
                <div style={{ 
                    background: "linear-gradient(135deg, #0575e6 0%, #021b79 100%)",
                    padding: "24px",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(5, 117, 230, 0.3)",
                    transition: "transform 0.2s",
                    cursor: "pointer"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: "500", marginBottom: "8px" }}>Valid Contracts</div>
                    <div style={{ fontSize: "32px", fontWeight: "700" }}>{totals.valid}</div>
                </div>
                <div style={{ 
                    background: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
                    padding: "24px",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(252, 74, 26, 0.3)",
                    transition: "transform 0.2s",
                    cursor: "pointer"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: "500", marginBottom: "8px" }}>Closed Contracts</div>
                    <div style={{ fontSize: "32px", fontWeight: "700" }}>{totals.closed}</div>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                <div style={{ 
                    background: "#fff", 
                    padding: "24px", 
                    borderRadius: "12px", 
                    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                    transition: "box-shadow 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.12)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.08)"}>
                    <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#2d3748" }}>Contracts by Status</div>
                    <div style={{ height: 200 }}>
                        <Pie data={statusData} options={commonOptions as any} />
                    </div>
                </div>

                <div style={{ 
                    background: "#fff", 
                    padding: "24px", 
                    borderRadius: "12px", 
                    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                    transition: "box-shadow 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.12)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.08)"}>
                    <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#2d3748" }}>Partners by Geography</div>
                    <div style={{ height: 200 }}>
                        <Bar data={geoData} options={barOptions as any} />
                    </div>
                </div>

                <div style={{ 
                    background: "#fff", 
                    padding: "24px", 
                    borderRadius: "12px", 
                    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                    transition: "box-shadow 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.12)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.08)"}>
                    <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#2d3748" }}>Contracts Created Over Time</div>
                    <div style={{ height: 200 }}>
                        <Line data={timeData} options={lineOptions as any} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{ 
                background: "#fff", 
                borderRadius: "12px", 
                padding: "24px", 
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                overflow: "hidden"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#2d3748" }}>Partnership Details</div>
                    <div style={{ 
                        fontSize: "13px", 
                        color: "#718096",
                        background: "#f7fafc",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontWeight: "500"
                    }}>
                        {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
                    </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ 
                                textAlign: "left", 
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "#fff"
                            }}>
                                <th style={{ padding: "14px 12px", fontWeight: "600", fontSize: "13px" }}>Entity</th>
                                <th style={{ padding: "14px 12px", fontWeight: "600", fontSize: "13px" }}>Parties</th>
                                <th style={{ padding: "14px 12px", fontWeight: "600", fontSize: "13px" }}>Type</th>
                                <th style={{ padding: "14px 12px", fontWeight: "600", fontSize: "13px" }}>Geography</th>
                                <th style={{ padding: "14px 12px", fontWeight: "600", fontSize: "13px" }}>Valid Till</th>
                                <th style={{ padding: "14px 12px", fontWeight: "600", fontSize: "13px" }}>Status</th>
                                <th style={{ padding: "14px 12px", fontWeight: "600", fontSize: "13px" }}>Objective</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, idx) => (
                                <tr key={p.id} style={{ 
                                    borderBottom: "1px solid #e2e8f0",
                                    background: idx % 2 === 0 ? "#fff" : "#f7fafc",
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#edf2f7"}
                                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f7fafc"}>
                                    <td style={{ padding: "12px", color: "#2d3748", fontWeight: "500" }}>{p.entityName}</td>
                                    <td style={{ padding: "12px", color: "#4a5568" }}>{p.parties}</td>
                                    <td style={{ padding: "12px", color: "#4a5568" }}>{p.typeOfPartner}</td>
                                    <td style={{ padding: "12px", color: "#4a5568" }}>{p.geography}</td>
                                    <td style={{ padding: "12px", color: "#4a5568" }}>{p.validTill}</td>
                                    <td style={{ padding: "12px" }}>
                                        <span style={{ 
                                            display: "inline-block",
                                            padding: "4px 12px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            background: p.status === "Active" ? "#c6f6d5" : p.status === "Closed" ? "#fed7d7" : "#feebc8",
                                            color: p.status === "Active" ? "#22543d" : p.status === "Closed" ? "#742a2a" : "#7c2d12"
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px", color: "#718096" }}>{p.objective}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ 
                                        padding: "32px", 
                                        textAlign: "center",
                                        color: "#a0aec0",
                                        fontSize: "14px"
                                    }}>
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