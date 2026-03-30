"use client";
import { Calendar, RefreshCw, ChevronDown } from "lucide-react";
import StatsCards from "./components/StatsCards";
import GraphReport from "./components/GraphReport";
import SalesOverview from "./components/SalesOverview";
import PharmacyRequestsTable from "./components/PharmacyRequestsTable";

export default function DashboardPage() {
    return (
      <div className="pharm-dashboard">
        {/* Welcome header */}
        <div className="pharm-welcome-row">
          <h1 className="pharm-welcome-title">Welcome Code Astro!</h1>
          <div className="pharm-welcome-right">
            <button className="pharm-role-badge">
              Team Member <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Pharmacy Sales Results header */}
        <div className="pharm-sales-header">
          <h2 className="pharm-section-title">Pharmacy Dashboard Insight</h2>
          <div className="pharm-sales-controls">
            <button className="pharm-filter-btn">
              <Calendar size={14} />
              <span>This Month</span>
              <ChevronDown size={12} />
            </button>
            <button className="pharm-refresh-btn">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Charts row */}
        <div className="pharm-charts-row">
          <GraphReport />
          <SalesOverview />
        </div>

        {/* Prescriptions Table */}
        <PharmacyRequestsTable />
      </div>
    );
}
