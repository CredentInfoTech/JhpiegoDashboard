/*eslint-disable @typescript-eslint/no-floating-promises  */
/*eslint-disable no-return-assign  */
/*eslint-disable @typescript-eslint/no-use-before-define  */
/*eslint-disable react/self-closing-comp  */
/*eslint-disable @rushstack/no-new-null  */
/*eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/explicit-function-return-type  */

import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Plugin } from "chart.js/dist/types/index";

// ---------------------- Interfaces -----------------------
interface KeywordData {
  PrimaryKeyword: string;
  Value: number;
}
interface MonthlyData {
  month: string;
  count: number;
  createdDates: string[];
}
interface SharingData {
  UserName: string;
  Action: string;
  UID: string;
  Created: string;
}
interface FundingItem {
  Organisation: string;
  WebsiteName: string;
  Location: string;
}

interface IDashboardProps {
  context: {
    pageContext: {
      web: {
        absoluteUrl: string;
      };
    };
  };
}

// ---------------------- Register Plugins -----------------
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);
ChartJS.register(ChartDataLabels);

const FundingDashboard: React.FC<IDashboardProps> = (props) => {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [monthlyCounts, setMonthlyCounts] = useState<MonthlyData[]>([]);
  const [filteredCounts, setFilteredCounts] = useState<MonthlyData[]>([]);
  const [sharingStats, setSharingStats] = useState<any[]>([]);
  const [weekCounts, setWeekCounts] = useState<number[]>([]);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [orgKeywords, setOrgKeywords] = useState<KeywordData[]>([]);
  const [urlKeywords, setUrlKeywords] = useState<KeywordData[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [allItems, setAllItems] = useState<FundingItem[]>([]);

  const subsiteUrl = props.context.pageContext.web.absoluteUrl;

  // ---------------- FETCH FUNDING DATA ----------------
  const fetchFundingData = async () => {
    const apiUrl = `${subsiteUrl}/_api/web/lists/getbytitle('Operations - Funding')/items?$top=4999`;
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/json;odata=nometadata",
        "odata-version": "",
      },
    });
    const data = response.data.value;
    const today = new Date();

    let week1 = 0;
    let week2 = 0;
    let week3 = 0;
    let week4 = 0;

    data.forEach((item: any) => {
      if (!item.Deadline) return;

      const deadline = new Date(item.Deadline);
      const diffDays = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays >= 0 && diffDays <= 7) week1++;
      else if (diffDays >= 8 && diffDays <= 14) week2++;
      else if (diffDays >= 15 && diffDays <= 21) week3++;
      else if (diffDays >= 22 && diffDays <= 28) week4++;
    });

    setWeekCounts([week1, week2, week3, week4]);

    const counts: { [key: string]: number } = {};
    data.forEach((item: any) => {
      const key = item.Keyword ?? "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    setKeywords(
      Object.keys(counts).map((key) => ({
        PrimaryKeyword: key,
        Value: counts[key],
      }))
    );
    console.log("keywords",keywords);
    

    const now = new Date();
    const last12Months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      last12Months.push(monthName);
    }

    const monthCounts: { [key: string]: { count: number; dates: string[] } } = {};
    last12Months.forEach((m) => (monthCounts[m] = { count: 0, dates: [] }));
    data.forEach((item: any) => {
      if (item.Created) {
        const date = new Date(item.Created);
        const monthName = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        if (monthCounts[monthName]) {
          monthCounts[monthName].count += 1;
          monthCounts[monthName].dates.push(item.Created);
        }
      }
    });

    const monthlyArray: MonthlyData[] = last12Months.map((month) => ({
      month,
      count: monthCounts[month]?.count || 0,
      createdDates: monthCounts[month]?.dates || [],
    }));

    setMonthlyCounts(monthlyArray);
    setFilteredCounts(monthlyArray);

    const items: FundingItem[] = data.map((item: any) => ({
      Organisation: item.Organisation ?? "Unknown",
      WebsiteName: item.WebsiteName ?? "Unknown",
      Location: item.Location ?? "",
    }));
    setAllItems(items);

    const uniqueLocations = items
      .map((i) => (i.Location ?? "").trim() || "{BLANK}")
      .reduce((acc: string[], loc) => {
        if (acc.indexOf(loc) === -1) acc.push(loc);
        return acc;
      }, []);

    setLocations(["All"].concat(uniqueLocations));
    updateOrgUrlCharts(items);
  };

  // ---------------- FILTER DATE ----------------
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredCounts(monthlyCounts);
      return;
    }
    const filtered = monthlyCounts.map((m) => {
      const filteredDates = m.createdDates.filter((dateStr) => {
        const date = new Date(dateStr);
        const start = startDate ? new Date(startDate) : new Date("1900-01-01");
        const end = endDate ? new Date(endDate) : new Date();
        return date >= start && date <= end;
      });
      return { ...m, count: filteredDates.length };
    });
    setFilteredCounts(filtered);
  }, [startDate, endDate, monthlyCounts]);

  // ---------------- FETCH SHARING HISTORY ----------------
  const fetchSharingHistory = async () => {
    const apiUrl = `${subsiteUrl}/_api/web/lists/getbytitle('Operations - SharingHistory')/items?$top=4999`;
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/json;odata=nometadata",
        "odata-version": "",
      },
    });
    const items: SharingData[] = response.data.value;

    const latestByUID: { [uid: string]: SharingData } = {};
    items.forEach((item) => {
      const existing = latestByUID[item.UID];
      if (!existing || new Date(item.Created) > new Date(existing.Created)) {
        latestByUID[item.UID] = item;
      }
    });

    const userStats: {
      [email: string]: { Accepted: number; Rejected: number; Pending: number };
    } = {};

    Object.keys(latestByUID).forEach((uid) => {
      const item = latestByUID[uid];
      const email = item.UserName ?? "Unknown";

      if (!userStats[email]) {
        userStats[email] = { Accepted: 0, Rejected: 0, Pending: 0 };
      }

      if (item.Action === "Accepted") userStats[email].Accepted += 1;
      else if (item.Action === "Rejected") userStats[email].Rejected += 1;
      else if (item.Action === "Pending") userStats[email].Pending += 1;
    });

    const statsArray = Object.keys(userStats).map((email) => ({
      email,
      Accepted: userStats[email].Accepted,
      Rejected: userStats[email].Rejected,
      Pending: userStats[email].Pending,
    }));

    setSharingStats(statsArray);
  };

  // ---------------- UPDATE ORG/URL CHARTS ----------------
  const updateOrgUrlCharts = (filteredItems: FundingItem[]) => {
    const orgCounts: { [key: string]: number } = {};
    filteredItems.forEach(
      (i) => (orgCounts[i.Organisation] = (orgCounts[i.Organisation] || 0) + 1)
    );

    const urlCounts: { [key: string]: number } = {};
    filteredItems.forEach(
      (i) => (urlCounts[i.WebsiteName] = (urlCounts[i.WebsiteName] || 0) + 1)
    );

    setOrgKeywords(
      Object.keys(orgCounts).map((k) => ({
        PrimaryKeyword: k,
        Value: orgCounts[k],
      }))
    );
    setUrlKeywords(
      Object.keys(urlCounts).map((k) => ({
        PrimaryKeyword: k,
        Value: urlCounts[k],
      }))
    );
  };

  useEffect(() => {
    if (selectedLocation === "All") updateOrgUrlCharts(allItems);
    else {
      const filtered = allItems.filter(
        (i) =>
          (i.Location || "")
            .toLowerCase()
            .indexOf(selectedLocation.toLowerCase()) !== -1
      );
      updateOrgUrlCharts(filtered);
    }
  }, [selectedLocation]);

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    (async () => {
      try {
        await fetchFundingData();
        await fetchSharingHistory();
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const barData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "RFP Count in Upcoming Weeks",
        data: weekCounts,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(192, 132, 252, 0.8)',
        ],
        borderRadius: 12,
        borderWidth: 0,
      },
    ],
  };

  const buildChartData = (
    labels: string[],
    values: number[],
    label: string
  ) => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 10,
        borderWidth: 0,
      },
    ],
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#1e293b',
        font: { weight: 'bold' as const, size: 12 },
        anchor: 'end' as const,
        align: 'top' as const,
        formatter: (value: number) => value,
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#64748b',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 90,
          color: '#64748b',
          font: {
            size: 11,
          }
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: {
          color: '#1e293b',
          font: {
            size: 13,
            weight: 600,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle' as const,
        }
      },
      title: { display: false },
      datalabels: {
        display: false,
      },
    },
    scales: { 
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#64748b',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          }
        },
      },
    },
  };

  const sharingBarData = {
    labels: sharingStats.map((s) => s.email),
    datasets: [
      {
        label: "Accepted",
        data: sharingStats.map((s) => s.Accepted),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 10,
        borderWidth: 0,
      },
      {
        label: "Rejected",
        data: sharingStats.map((s) => s.Rejected),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 10,
        borderWidth: 0,
      },
      {
        label: "Pending",
        data: sharingStats.map((s) => s.Pending),
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderRadius: 10,
        borderWidth: 0,
      },
    ],
  };

  // ---------------- JSX ----------------
  return (
    <>
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
      }}>
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
              📊 Funding Operations Dashboard
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              fontWeight: '500',
            }}>
              Real-time insights and analytics for your funding operations
            </p>
          </div> */}

          {/* Filter Card */}
          <div className="filter-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <div className="filter-icon">📅</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, flexWrap: 'wrap' }}>
                <div className="date-input-group">
                  <label>From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="date-input"
                  />
                </div>

                <div className="date-input-group">
                  <label>To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="date-input"
                  />
                </div>

                <div className="location-filter-group">
                  <label>📍 Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="location-select"
                  >
                    {locations.map((loc, idx) => (
                      <option key={idx} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* First Row - Combined Cards */}
          <div className="grid-3">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>📌 Upcoming RFP Count</h2>
                <span className="card-subtitle">Next 4 Weeks</span>
              </div>
              <div style={{ height: '320px', padding: '10px 0' }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>📅 Monthly Trend</h2>
                <span className="card-subtitle">Last 12 Months</span>
              </div>
              <div style={{ height: '320px', padding: '10px 0' }}>
                <Bar
                  data={buildChartData(
                    filteredCounts.map((m) => m.month),
                    filteredCounts.map((m) => m.count),
                    "Items"
                  )}
                  options={options}
                />
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>👤 User-wise Sharing Actions</h2>
                <span className="card-subtitle">Accept, Reject & Pending Status</span>
              </div>
              <div style={{ height: '320px', padding: '10px 0' }}>
                <Bar data={sharingBarData} options={barOptions} />
              </div>
            </div>
          </div>

          {/* Second Row - Combined Cards */}
          <div className="grid-2">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>🏢 Top 10 Organisations</h2>
                <span className="card-subtitle">By Funding Count</span>
              </div>
              <div style={{ height: '380px', padding: '10px 0' }}>
                {(() => {
                  const top10 = [...orgKeywords]
                    .sort((a, b) => b.Value - a.Value)
                    .slice(0, 10);

                  const labels = top10.map((k) => k.PrimaryKeyword);
                  const values = top10.map((k) => k.Value);

                  return (
                    <Bar
                      data={buildChartData(
                        labels,
                        values,
                        "Top 10 Organisation Count"
                      )}
                      options={options}
                      plugins={[ChartDataLabels as Plugin<"bar", object>]}
                    />
                  );
                })()}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>🔗 Website Distribution</h2>
                <span className="card-subtitle">By URL Count</span>
              </div>
              <div style={{ height: '380px', padding: '10px 0' }}>
                <Bar
                  data={buildChartData(
                    urlKeywords.map((k) => k.PrimaryKeyword),
                    urlKeywords.map((k) => k.Value),
                    "Website Count"
                  )}
                  options={options}
                  plugins={[ChartDataLabels as Plugin<"bar", object>]}
                />
              </div>
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

            .filter-card {
              background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
              backdrop-filter: blur(20px);
              border-radius: 24px;
              padding: 28px 32px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.12);
              margin-bottom: 35px;
              border: 1px solid rgba(255,255,255,0.3);
              transition: all 0.3s ease;
            }

            .filter-card:hover {
              box-shadow: 0 15px 50px rgba(0,0,0,0.18);
              transform: translateY(-2px);
            }

            .filter-icon {
              font-size: 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              width: 56px;
              height: 56px;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }

            .date-input-group {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .date-input-group label,
            .location-filter-group label {
              font-weight: 600;
              font-size: 13px;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .date-input {
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

            .date-input:hover {
              border-color: #cbd5e1;
            }

            .date-input:focus {
              outline: none;
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .location-filter-group {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .location-select {
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

            .location-select:hover {
              border-color: #cbd5e1;
            }

            .location-select:focus {
              outline: none;
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .grid-2 {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
              gap: 30px;
              margin-bottom: 30px;
            }

            .grid-3 {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
              gap: 30px;
              margin-bottom: 30px;
            }

            .dashboard-card {
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

            .dashboard-card::before {
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

            .dashboard-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            }

            .dashboard-card:hover::before {
              transform: scaleX(1);
            }

            .card-header {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #f1f5f9;
            }

            .card-header h2 {
              margin: 0 0 6px 0;
              font-size: 20px;
              font-weight: 700;
              color: #1e293b;
              letter-spacing: -0.3px;
            }

            .card-subtitle {
              font-size: 13px;
              color: #64748b;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            @media (max-width: 1200px) {
              .grid-2 {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 768px) {
              .filter-card {
                padding: 20px;
              }

              .dashboard-card {
                padding: 20px;
              }

              .card-header h2 {
                font-size: 18px;
              }
            }
          `}
        </style>
      </div>
    </>
  );
};

export default FundingDashboard;