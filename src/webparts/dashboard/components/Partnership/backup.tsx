/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion*/
/*eslint-disable no-return-assign */
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
    Title
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

const COLORS = ["#5865f2", "#4b91f1", "#a680be", "#4f709c", "#30aabc"];

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

    // derived list of geographies
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

    // status chart
    const statusChart = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach(p => map.set(p.status, (map.get(p.status) || 0) + 1));
        const arr: { name: string; value: number }[] = [];
        map.forEach((value, name) => arr.push({ name, value }));
        return arr;
    }, [filtered]);

    // geography chart
    const geoChart = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach(p => map.set(p.geography, (map.get(p.geography) || 0) + 1));
        const arr: { name: string; value: number }[] = [];
        map.forEach((value, name) => arr.push({ name, value }));
        return arr;
    }, [filtered]);

    // contracts over time
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

    // chart data objects
    const statusData = useMemo(() => ({
        labels: statusChart.map(s => s.name),
        datasets: [{
            data: statusChart.map(s => s.value),
            backgroundColor: COLORS.slice(0, statusChart.length),
            hoverOffset: 8
        }]
    }), [statusChart]);

    const geoData = useMemo(() => ({
        labels: geoChart.map(g => g.name),
        datasets: [{
            label: "Partners",
            data: geoChart.map(g => g.value),
            backgroundColor: geoChart.map((_, i) => COLORS[i % COLORS.length])
        }]
    }), [geoChart]);

    const timeData = useMemo(() => ({
        labels: timeChart.map(t => t.name),
        datasets: [{
            label: "Contracts",
            data: timeChart.map(t => t.value),
            borderColor: "#5865f2",
            backgroundColor: "rgba(88, 101, 242, 0.15)",
            fill: true,
            tension: 0.3
        }]
    }), [timeChart]);

    // chart options
    const commonOptions = {
        plugins: {
            legend: { display: true, position: "bottom" as const },
            title: { display: false }
        },
        maintainAspectRatio: false,
        responsive: true
    };
    const barOptions = {
        ...commonOptions, scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true, precision: 0 } }
    };
    const lineOptions = {
        ...commonOptions, scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true, precision: 0 } }
    };

    // style objects
    const baseShadow = "0 4px 20px rgba(88,101,242,0.08)";
    const surfaceShadow = "0 2px 12px rgba(88,101,242,0.08)";
    const sectionBorder = "2px solid #e3e7fa";

    const inputStyle = {
        padding: "10px 14px",
        border: "1px solid #d1d9f0",
        borderRadius: "8px",
        fontSize: "14px",
        transition: "box-shadow 0.2s, border-color 0.2s",
        background: "#f8fafc",
        color: "#23263b"
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
        transition: "transform 0.2s, box-shadow 0.2s"
    };

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            // background: "linear-gradient(120deg, #e3eafc 50%, #f8fafb 100%)",
            minHeight: "100vh",
            padding: "12px"
        }}>
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
            <div style={{
                background: "#fff",
                borderRadius: "13px",
                padding: "12px",
                // marginBottom: "20px",
                marginBottom: "15px",
                boxShadow: surfaceShadow,
                border: sectionBorder
            }}>
                {/* <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "19px", color: "#23263b" }}>
                    Filters
                </div> */}
                <div style={{ display: "flex", gap: "19px", alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}>From</span>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}>To</span>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}>Geography</span>
                        <select value={geography} onChange={e => setGeography(e.target.value)} style={inputStyle}>
                            {geographyOptions.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#5f6ab8" }}>Status</span>
                        <div style={{ display: "flex", gap: "14px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer" }}>
                                <input type="checkbox" checked={filterActive} onChange={e => setFilterActive(e.target.checked)}
                                    style={{ width: "17px", height: "17px", cursor: "pointer", accentColor: "#4b91f1" }} />
                                <span style={{ fontSize: "15px", color: "#23263b" }}>Active</span>
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer" }}>
                                <input type="checkbox" checked={filterValid} onChange={e => setFilterValid(e.target.checked)}
                                    style={{ width: "17px", height: "17px", cursor: "pointer", accentColor: "#30aabc" }} />
                                <span style={{ fontSize: "15px", color: "#23263b" }}>Valid</span>
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer" }}>
                                <input type="checkbox" checked={filterClosed} onChange={e => setFilterClosed(e.target.checked)}
                                    style={{ width: "17px", height: "17px", cursor: "pointer", accentColor: "#a680be" }} />
                                <span style={{ fontSize: "15px", color: "#23263b" }}>Closed</span>
                            </label>
                        </div>
                    </div>
                    <button
                        onClick={() => { setFrom(""); setTo(""); setGeography("All"); setFilterActive(false); setFilterValid(false); setFilterClosed(false); }}
                        style={{ ...buttonStyle, marginLeft: "auto", marginTop: "16px", fontWeight: 600 }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 22px rgba(88, 101, 242, 0.26)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = buttonStyle.boxShadow as string;
                        }}
                    >Clear Filters</button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div style={{   
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
                // gap: "24px",
                gap: "15px",
                // marginBottom: "32px"
                marginBottom: "15px"
            }}>
                {[
                    { label: "Total Partners", value: totals.totalPartners, colors: ["#5865f2", "#4b91f1"] },
                    { label: "Active Partners", value: totals.active, colors: ["#30aabc", "#7bdff2"] },
                    { label: "Valid Contracts", value: totals.valid, colors: ["#7b6ced", "#a7daff"] },
                    { label: "Closed Contracts", value: totals.closed, colors: ["#f4577b", "#fcaf58"] }
                ].map((item, idx) =>
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
                            cursor: "pointer"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                        <div style={{ fontSize: "15px", fontWeight: 600, opacity: 0.89, marginBottom: "12px", letterSpacing: 0 }}>
                            {item.label}
                        </div>
                        <div style={{
                            fontSize: "37px",
                            fontWeight: 800,
                            letterSpacing: "-1px",
                            textShadow: "0 1px 0 #3740c7"
                        }}>{item.value}</div>
                    </div>
                )}
            </div>

            {/* Charts Section */}
            <div style={{
                display: "grid",
                // gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                // gap: "24px",
                gap: "15px",
                marginBottom: "32px"
            }}>
                <div
                    style={{
                        background: "#f8fafc",
                        borderRadius: "13px",
                        padding: "24px",
                        // padding: "10px",
                        border: sectionBorder,
                        boxShadow: surfaceShadow,
                        transition: "box-shadow 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = surfaceShadow}
                >
                    <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "17px", color: "#5865f2" }}>Contracts by Status</div>
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
                        transition: "box-shadow 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = surfaceShadow}
                >
                    <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "17px", color: "#30aabc" }}>Partners by Geography</div>
                    <div style={{ height: 210 }}>
                        <Bar data={geoData} options={barOptions as any} />
                    </div>
                </div>
                <div
                    style={{
                        background: "#f8fafc",
                        borderRadius: "13px",
                        padding: "24px",
                        border: sectionBorder,
                        boxShadow: surfaceShadow,
                        transition: "box-shadow 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 5px 26px #5865f21a"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = surfaceShadow}
                >
                    <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "17px", color: "#7b6ced" }}>Contracts Created Over Time</div>
                    <div style={{ height: 210 }}>
                        <Line data={timeData} options={lineOptions as any} />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "29px",
                boxShadow: surfaceShadow,
                border: sectionBorder,
                overflow: "hidden"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "17px"
                }}>
                    <div style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: "#23263b"
                    }}>Partnership Details</div>
                    <div style={{
                        fontSize: "13px",
                        color: "#56619d",
                        background: "#f3f6fd",
                        padding: "7px 18px",
                        borderRadius: "7px",
                        fontWeight: 600
                    }}>
                        {filtered.length} {filtered.length === 1 ? "record" : "records"}
                    </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
                        <thead>
                            <tr style={{
                                background: "linear-gradient(110deg, #4b91f1 0%, #8e9ae6 100%)",
                                color: "#fff"
                            }}>
                                <th style={{ padding: "16px 13px", fontWeight: 800, fontSize: "13px" }}>Entity</th>
                                <th style={{ padding: "16px 13px", fontWeight: 800, fontSize: "13px" }}>Parties</th>
                                <th style={{ padding: "16px 13px", fontWeight: 800, fontSize: "13px" }}>Type</th>
                                <th style={{ padding: "16px 13px", fontWeight: 800, fontSize: "13px" }}>Geography</th>
                                <th style={{ padding: "16px 13px", fontWeight: 800, fontSize: "13px" }}>Valid Till</th>
                                <th style={{ padding: "16px 13px", fontWeight: 800, fontSize: "13px" }}>Status</th>
                                <th style={{ padding: "16px 13px", fontWeight: 800, fontSize: "13px" }}>Objective</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, idx) => (
                                <tr key={p.id} style={{
                                    borderBottom: "1px solid #e3e7fa",
                                    background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                                    transition: "background 0.3s"
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#e3eafc"}
                                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#f8fafc" : "#fff"}>
                                    <td style={{ padding: "13px", fontWeight: "600", color: "#23263b" }}>{p.entityName}</td>
                                    <td style={{ padding: "13px", color: "#4f709c" }}>{p.parties}</td>
                                    <td style={{ padding: "13px", color: "#4f709c" }}>{p.typeOfPartner}</td>
                                    <td style={{ padding: "13px", color: "#4f709c" }}>{p.geography}</td>
                                    <td style={{ padding: "13px", color: "#4f709c" }}>{p.validTill}</td>
                                    <td style={{ padding: "13px" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "5px 14px",
                                            borderRadius: "14px",
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            background: p.status === "Active" ?
                                                "#d9f9ec" : p.status === "Closed" ?
                                                    "#fae2e9" : "#fff5e0",
                                            color: p.status === "Active" ?
                                                "#55ac83" : p.status === "Closed" ?
                                                    "#f4577b" : "#f79e16"
                                        }}>{p.status}</span>
                                    </td>
                                    <td style={{ padding: "13px", color: "#7b7b94" }}>{p.objective}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{
                                        padding: "36px",
                                        textAlign: "center",
                                        color: "#b6c0e1",
                                        fontSize: "15px",
                                        fontWeight: 600
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
