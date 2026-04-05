import React, { useEffect, useState } from "react";
import "../App.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {

  const [stats, setStats] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStats();
// eslint-disable-next-line
  }, []);

  const fetchStats = async () => {

    const res = await fetch(
      "http://localhost:5000/api/admin/stats",
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    setStats(data);
  };

  const chartData = {
    labels: ["Users", "Active Files", "Deleted Files"],
    datasets: [
      {
        label: "System Overview",
        data: [
          stats.totalUsers || 0,
          stats.totalActiveFiles || 0,
          stats.totalDeletedFiles || 0
        ],
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF9800"
        ],
      },
    ],
  };

  return (

    <div className="dashboard-wrapper">

      <h1 className="dashboard-title">Welcome Admin</h1>

      {/* Stats Cards */}

      <div className="stats-container">

        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Active Files</h3>
          <p>{stats.totalActiveFiles || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Deleted Files</h3>
          <p>{stats.totalDeletedFiles || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Storage Used</h3>
          <p>{stats.totalStorageUsedMB || 0} MB</p>
        </div>

      </div>

      {/* Chart */}

    </div>

  );

}

export default AdminDashboard;