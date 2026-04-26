import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import "./Dashboard.css"; // reuse styles

function Stats() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
    });

    const fetchStats = async () => {
        try {
            const res = await API.get("/stats");
            setStats(res.data);
        } catch (err) {
            console.error("Stats error", err);
            toast.error("Failed to fetch stats ❌");
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="dashboard statsPage">
            <h2 className="statsTitle">Company Stats</h2>

            <p style={{ color: "#64748b", marginBottom: "10px" }}>
                Overview of your workspace activity
            </p>

            <div className="statsContainer">
                <div className="statCard">
                    <h4>📁 Projects</h4>
                    <p>{stats.totalProjects}</p>
                </div>

                <div className="statCard">
                    <h4>📋 Tasks</h4>
                    <p>{stats.totalTasks}</p>
                </div>

                <div className="statCard">
                    <h4>✅ Completed</h4>
                    <p>{stats.completedTasks}</p>
                </div>
            </div>
        </div>
    );
}

export default Stats;