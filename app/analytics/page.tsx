"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { toast } from "react-hot-toast";
import { AnalyticsData, DailyStat } from "./types";
import StatCard from "./_components/StatCard";
import LiquidityChart from "./_components/LiquidityChart";
import VolumeChart from "./_components/VolumeChart";
import TopMoversCard from "./_components/TopMoversCard";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        
        // Kliens oldali utófeldolgozás: Kumulatív összeg számítása
        let runningTotal = 0;
        const processedDaily = json.dailyStats.map((day: DailyStat) => {
          runningTotal += day.netChange;
          return { ...day, cumulativeLiquidity: runningTotal };
        });

        setData({ ...json, dailyStats: processedDaily });
      } catch (error) {
        console.error(error);
        toast.error("Could not load analytics data");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-zinc-500">No data available yet.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Activity className="w-8 h-8 text-emerald-500" />
          Analytics & Insights
        </h1>
        <p className="text-zinc-400">Deep dive into your portfolio performance and cash flow.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Total Net Change" 
          value={data.summary.netTotal > 0 ? `+${data.summary.netTotal.toLocaleString()} HUF` : `${data.summary.netTotal.toLocaleString()} HUF`} 
          type={data.summary.netTotal >= 0 ? "success" : "danger"} 
          subValue="All time tracked performance"
        />
        <StatCard 
          label="Total Income" 
          value={`${data.summary.totalIn.toLocaleString()} HUF`} 
          type="success"
          subValue="Salary + Inflows"
        />
        <StatCard 
          label="Total Expenses" 
          value={`${Math.abs(data.summary.totalOut).toLocaleString()} HUF`} 
          type="danger"
          subValue="Spending + Outflows"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LiquidityChart data={data.dailyStats} />
        <VolumeChart data={data.dailyStats} />
      </div>

      {/* Top Events Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TopMoversCard 
          title="Largest Inflows" 
          events={data.topEvents.gains} 
          type="gain" 
        />
        <TopMoversCard 
          title="Largest Outflows" 
          events={data.topEvents.losses} 
          type="loss" 
        />
      </div>
    </div>
  );
}