/*eslint-disable  @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import type { IDashboardProps } from "./IDashboardProps";
import PartnershipDashboard from "./Partnership/PartnershipDashboard";
// import PartnershipDashboardTwo from "./Partnership/DashboardSample2";
import FundingDashboard from "./Component/FundingDashboards";
export default class Dashboard extends React.Component<IDashboardProps, { selectedComponent: string }> {
  constructor(props: IDashboardProps) {
    super(props);
    this.state = {
      selectedComponent: "FundingDashboard",
    };
  }

  handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedComponent: event.target.value });
  };

  public render(): React.ReactElement<IDashboardProps> {
    const { selectedComponent } = this.state;
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName,
      userloginDetails,
      currentUserId,
      context,
      siteUrl,
    } = this.props;

    console.log(
      "Dashboard props",
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName,
      userloginDetails,
      currentUserId,
      context,
      siteUrl
    );

    const containerStyle: React.CSSProperties = {
      minHeight: "100vh",
      // background: isDarkTheme 
      //   ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
      //   : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
      padding: "32px 24px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    };

    const headerStyle: React.CSSProperties = {
      display: "flex",
      justifyContent: "space-between",
    // background: isDarkTheme
    //     ? "rgba(255, 255, 255, 0.05)"
    //     : "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
      borderRadius: "16px",
      // padding: "32px",
      // marginBottom: "32px",
      // padding: "10px",
      marginBottom: "7px",
      // boxShadow: isDarkTheme
      //   ? "0 8px 32px rgba(0, 0, 0, 0.3)"
      //   : "0 8px 32px rgba(0, 0, 0, 0.08)",
      border: isDarkTheme
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(255, 255, 255, 0.5)",
    };

    const titleStyle: React.CSSProperties = {
      fontSize: "32px",
      fontWeight: "700",
      margin: "0 0 8px 0",
      background: isDarkTheme
        ? "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)"
        : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    };

    

  /*  const userInfoStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "14px",
      color: isDarkTheme ? "#cbd5e1" : "#475569",
    };

    const avatarStyle: React.CSSProperties = {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "600",
      fontSize: "16px",
    };

    const selectorContainerStyle: React.CSSProperties = {
      background: isDarkTheme
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: isDarkTheme
        ? "0 4px 16px rgba(0, 0, 0, 0.2)"
        : "0 4px 16px rgba(0, 0, 0, 0.06)",
      border: isDarkTheme
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(255, 255, 255, 0.5)",
    };*/

    /*const labelStyle: React.CSSProperties = {
      display: "block",
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "12px",
      color: isDarkTheme ? "#e2e8f0" : "#1e293b",
    };*/

    const selectStyle: React.CSSProperties = {
      width: "100%",
      maxWidth: "400px",
      padding: "12px 16px",
      fontSize: "15px",
      border: isDarkTheme
        ? "2px solid rgba(255, 255, 255, 0.1)"
        : "2px solid #e2e8f0",
      borderRadius: "8px",
      background: isDarkTheme ? "#1e293b" : "#ffffff",
      color: isDarkTheme ? "#f1f5f9" : "#1e293b",
      cursor: "pointer",
      transition: "all 0.2s ease",
      outline: "none",
    };

    const contentStyle: React.CSSProperties = {
      background: isDarkTheme
        ? "rgba(255, 255, 255, 0.03)"
        : "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      padding: "10px",
      boxShadow: isDarkTheme
        ? "0 4px 16px rgba(0, 0, 0, 0.2)"
        : "0 4px 16px rgba(0, 0, 0, 0.06)",
      border: isDarkTheme
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(255, 255, 255, 0.5)",
    };

    /*const getInitials = (name: string): string => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };*/

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Management Dashboard</h1>
          <div>
            {/* <label style={labelStyle} htmlFor="dashboard-selector">
            Select Dashboard View
          </label> */}
          <select
            id="dashboard-selector"
            onChange={this.handleSelectionChange}
            value={selectedComponent}
            style={selectStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isDarkTheme
                ? "rgba(255, 255, 255, 0.1)"
                : "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <option value="PartnershipDashboard">
              📊 Partnership Dashboard
            </option>
            <option value="FundingDashboard">
              📈 Funding Dahboard
            </option>
          </select>
          </div>
          
          {/* <div style={userInfoStyle}>
            <div style={avatarStyle}>
              {getInitials(userDisplayName || "User")}
            </div>
            <div>
              <div style={{ fontWeight: "600" }}>
                Welcome, {userDisplayName || "User"}
              </div>
              {environmentMessage && (
                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  {environmentMessage}
                </div>
              )}
            </div>
          </div> */}
        </div>

        {/* <div style={selectorContainerStyle}>
          
        </div> */}

        <div style={contentStyle}>
          {selectedComponent === "PartnershipDashboard" && (
            <PartnershipDashboard {...this.props} />
          )}
          {selectedComponent === "FundingDashboard" && (
            <FundingDashboard {...this.props} />
          )}
        </div>
      </div>
    );
  }
}