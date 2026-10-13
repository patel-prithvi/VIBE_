import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Plus, TrendingUp, Users, CheckCircle, Clock } from "lucide-react";
import ChartErrorBoundary from "../ChartErrorBoundary";
import { useChartDimensions } from "../hooks/useChartDimensions";

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 transition-all duration-300 cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
        <TrendingUp size={12} /> {trend}
      </span>
    </div>
    <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
    <p className="text-slate-500 text-sm">{label}</p>
  </div>
);

export const Overview = ({ setActiveTab, tasks = [], applicants = [] }) => {
  const [isClient, setIsClient] = useState(false);
  const mainChart = useChartDimensions(400, 320);
  const sideChart = useChartDimensions(250, 160);

  useEffect(() => {
    // Add a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Calculate stats with fallback to static values
  const activeTasksCount = (Array.isArray(tasks) ? tasks : []).filter(
    (t) => t.status === "Active" || t.status === "Ongoing"
  ).length;

  const totalTasksCount = (Array.isArray(tasks) ? tasks : []).length;

  // Acceptance rate calculation with static fallback
  const approvedCount = (Array.isArray(applicants) ? applicants : []).filter(
    (a) => a.status === "Approved"
  ).length;
  const totalDecisions = (Array.isArray(applicants) ? applicants : []).filter(
    (a) => a.status !== "Pending"
  ).length;
  const acceptanceRate =
    totalDecisions > 0
      ? Math.round((approvedCount / totalDecisions) * 100)
      : 0;

  // Compute charts data from real data
  const dataStudents = useMemo(() => {
    if (!applicants.length) return [
      { name: "Engineering", count: 0 },
      { name: "Design", count: 0 },
      { name: "Marketing", count: 0 },
      { name: "Product", count: 0 },
      { name: "Data Science", count: 0 },
    ];

    const branchCounts = {};
    applicants.forEach(app => {
      // Use branch if available, fallback to "General"
      const branch = app.branch || "General";
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
    });

    // Convert to array and sort
    return Object.entries(branchCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 branches
  }, [applicants]);

  const dataActivity = useMemo(() => {
    // Last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push({
        name: days[d.getDay()],
        date: d.toISOString().split('T')[0],
        applications: 0,
        tasks: 0
      });
    }

    // Fill application counts
    applicants.forEach(app => {
      if (!app.submissionDate) return;
      const subDate = new Date(app.submissionDate).toISOString().split('T')[0];
      const dayData = last7Days.find(d => d.date === subDate);
      if (dayData) {
        dayData.applications++;
      }
    });

    // Fill task counts (if we had task creation date available in correct format)
    // Assuming tasks have 'postedAt' as 'YYYY-MM-DD' or similar
    tasks.forEach(task => {
      if (!task.postedAt) return;
      // Handle different date formats if needed, but assuming ISO or 'YYYY-MM-DD' from previous steps
      let taskDate = task.postedAt;
      // If postedAt is ISO string with time, split it
      if (taskDate.includes('T')) taskDate = taskDate.split('T')[0];
      
      const dayData = last7Days.find(d => d.date === taskDate);
      if (dayData) {
        dayData.tasks++;
      }
    });

    return last7Days;
  }, [applicants, tasks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Actions & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Plus}
          label="Total Tasks Posted"
          value={totalTasksCount}
          trend="+12%"
          color="bg-orange-500"
        />
        <StatCard
          icon={Clock}
          label="Active Tasks"
          value={activeTasksCount}
          trend="+4%"
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Total Submissions"
          value={applicants.length}
          trend="+28%"
          color="bg-indigo-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Acceptance Rate"
          value={`${acceptanceRate}%`}
          trend={totalDecisions > 0 ? "Live" : "Est."}
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              Student Submissions Overview
            </h3>
            <select className="text-sm border-none bg-orange-50 text-orange-600 font-medium rounded-lg px-3 py-1 focus:ring-0 cursor-pointer">
              <option>Last 7 Days</option>
            </select>
          </div>
          <div
            ref={mainChart.containerRef}
            className="h-80 w-full"
            style={{ minHeight: '320px', minWidth: '400px', position: 'relative' }}
          >
            <ChartErrorBoundary>
              {isClient && mainChart.isReady ? (
                <ResponsiveContainer width={mainChart.dimensions.width} height={mainChart.dimensions.height}>
                  <AreaChart data={dataActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      itemStyle={{ color: "#1e293b" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      name="Student Submissions"
                      stroke="#f97316"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorApps)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-slate-500 text-sm">Loading chart...</p>
                  </div>
                </div>
              )}
            </ChartErrorBoundary>
          </div>
        </div>

        {/* Quick Actions & Secondary Chart */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20">
            <h3 className="text-xl font-bold mb-2">Ready to grow?</h3>
            <p className="text-orange-100 mb-6 text-sm">
              Post a new task to engage with top student talent immediately.
            </p>
            <button
              onClick={() => setActiveTab("tasks")}
              className="w-full bg-white text-orange-600 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-sm"
            >
              Post New Task
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Student Demographics
            </h3>
            <div
              ref={sideChart.containerRef}
              className="h-40 w-full"
              style={{ minHeight: '160px', minWidth: '250px' }}
            >
              <ChartErrorBoundary>
                {isClient && sideChart.isReady ? (
                  <ResponsiveContainer width={sideChart.dimensions.width} height={sideChart.dimensions.height}>
                    <BarChart data={dataStudents} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={80}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Tooltip cursor={{ fill: "#fff7ed" }} />
                      <Bar
                        dataKey="count"
                        fill="#fb923c"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                      <p className="text-slate-500 text-xs">Loading...</p>
                    </div>
                  </div>
                )}
              </ChartErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
