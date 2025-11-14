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
import { IDashboardProps } from "../IDashboardProps";
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
  // const [loading, setLoading] = useState<boolean>(true);
  const [weekCounts, setWeekCounts] = useState<number[]>([]);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // For Location/Org/URL
  const [orgKeywords, setOrgKeywords] = useState<KeywordData[]>([]);
  const [urlKeywords, setUrlKeywords] = useState<KeywordData[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [allItems, setAllItems] = useState<FundingItem[]>([]);

  const subsiteUrl = props.context.pageContext.web.absoluteUrl;
  console.log("Subsite URL:", keywords);
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

    // -------------------------------
    // WEEK BUCKET COUNTS (4 Weeks)
    // -------------------------------

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
    // ✅ Category (Keyword)
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

    // ✅ Month-wise
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

    const monthCounts: { [key: string]: { count: number; dates: string[] } } =
      {};
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

    // ✅ For Organisation/Website Charts
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

    // 👉 Latest record per UID
    const latestByUID: { [uid: string]: SharingData } = {};
    items.forEach((item) => {
      const existing = latestByUID[item.UID];
      if (!existing || new Date(item.Created) > new Date(existing.Created)) {
        latestByUID[item.UID] = item;
      }
      // console.log("item",item)
    });

    // 👉 User wise ACCEPT / REJECT / PENDING count
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

    // 👉 Convert to array for chart/table
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
      } finally {
        // setLoading(false);
      }
    })();
  }, []);

  const barData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "RFP Count in Upcoming Weeks",
        data: weekCounts,
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
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderRadius: 8,
      },
    ],
  });

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#000",
        font: { weight: "bold" as const, size: 13 },
        anchor: "end" as const,
        align: "top" as const,
        formatter: (value: number) => value,
      },
    },
    scales: {
      y: { beginAtZero: true },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90, // 👈 labels 90 degree vertical
          minRotation: 90, // 👈 force vertical
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "User-wise Accept vs Reject" },
    },
    scales: { y: { beginAtZero: true } },
  };
  const sharingBarData = {
    labels: sharingStats.map((s) => s.email),
    datasets: [
      {
        label: "Accepted",
        data: sharingStats.map((s) => s.Accepted),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderRadius: 8,
      },
      {
        label: "Rejected",
        data: sharingStats.map((s) => s.Rejected),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderRadius: 8,
      },
      {
        label: "Pending",
        data: sharingStats.map((s) => s.Pending),
        backgroundColor: "rgba(240, 141, 35, 0.7)",
        borderRadius: 8,
      },
    ],
  };

  // ---------------- JSX ----------------
  return (
    <>
      {/* ====================== MAIN WRAPPER ====================== */}
      <div style={{ margin: "0 auto", padding: "20px" }}>
        {/* ====================== FILTER CARD ====================== */}
        <div
          style={{
            background: "rgba(255,255,255,0.35)",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            marginBottom: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {/* DATE FILTER */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div>
              <label style={{ fontWeight: 600 }}>From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  marginLeft: 6,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 600 }}>To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  marginLeft: 6,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>

          {/* LOCATION FILTER */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontWeight: "bold" }}>Location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              {locations.map((loc, idx) => (
                <option key={idx} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ====================== ROW 1 (3 Cards) ====================== */}
        <div
          style={{
            display: "grid",
            //   gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",

            gap: "25px",
            marginBottom: "30px",
          }}
        >
          {/* CARD 1 */}
          <div className="dashboard-card">
            <h2>📌 Upcoming RFP Count (Next 4 Weeks)</h2>
            <div style={{ height: 350 }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* CARD 2 */}
          <div className="dashboard-card">
            <h2>📅 Monthly Trend (Last 12 Months)</h2>
            <Bar
              data={buildChartData(
                filteredCounts.map((m) => m.month),
                filteredCounts.map((m) => m.count),
                "Items"
              )}
              options={options}
            />
          </div>

          {/* CARD 3 */}
          <div className="dashboard-card">
            <h2>👤 User-wise Sharing Actions</h2>
            <Bar data={sharingBarData} options={barOptions} />
          </div>
        </div>

        {/* ====================== ROW 2 (2 Cards) ====================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "25px",
          }}
        >
          {/* CARD 4 */}
          <div className="dashboard-card">
            <h3>🏢 Top 10 Organisations</h3>

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
                  plugins={[ChartDataLabels]}
                />
              );
            })()}
          </div>

          {/* CARD 5 */}
          <div className="dashboard-card">
            <h3>🔗 Website URL-wise Distribution</h3>
            <Bar
              data={buildChartData(
                urlKeywords.map((k) => k.PrimaryKeyword),
                urlKeywords.map((k) => k.Value),
                "Website Count"
              )}
              options={options}
              plugins={[ChartDataLabels]}
            />
          </div>
        </div>

        {/* ============== CARD CSS ============== */}
        <style>
          {`
      .dashboard-card {
        background: rgba(255,255,255,0.35);
        backdrop-filter: blur(12px);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        transition: 0.3s ease;
      }

      .dashboard-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 25px rgba(0,0,0,0.25);
      }
    `}
        </style>
      </div>
    </>
  );
};

export default FundingDashboard;
