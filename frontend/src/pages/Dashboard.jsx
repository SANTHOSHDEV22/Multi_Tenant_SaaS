import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const [menuOpen, setMenuOpen] = useState(false); // 🔥 NEW

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      await API.post("/projects", form);
      setShowModal(false);
      setForm({ name: "", description: "" });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Project creation failed ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await API.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed ❌");
    }
  };

  return (
    <div className="dashboard">

      {/* 🔝 Navbar */}
      <div className="dashNavbar">
        <h2>Welcome, {user?.name || "User"} 👋</h2>

        <div className="navActions">

          <button
            className="createBtn"
            onClick={() => setShowModal(true)}
          >
            + New Project
          </button>

          <button
            className="logoutBtn"
            onClick={handleLogout}
          >
            Logout
          </button>

          {/* 🍔 MOVE THIS TO LAST */}
          <button
            className="menuBtn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

        </div>
      </div>

      {/* 📂 Slide Menu */}
      {menuOpen && (
        <div className="sideMenu">
          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>

          <button onClick={() => navigate("/stats")}>
            Stats
          </button>

          <button onClick={() => navigate("/team")}>
            Team
          </button>
        </div>
      )}

      {/* 📦 Content */}
      <div className="content">
        <h3>{user?.companyId?.name || "Company"} Projects</h3>

        {projects.length === 0 ? (
          <p>No projects yet 🚀</p>
        ) : (
          <div className="projectList">
            {projects.map((project) => (
              <div key={project._id} className="projectCard">
                <h4>{project.name}</h4>
                <p>{project.description}</p>

                <div className="cardActions">
                  <button
                    className="openBtn"
                    onClick={() =>
                      navigate(`/projects/${project._id}`)
                    }
                  >
                    Open
                  </button>

                  {user?.role === "admin" && (
                    <button
                      className="deleteBtn"
                      onClick={() => handleDelete(project._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧊 MODAL */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h3>Create Project</h3>

            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                name="name"
                placeholder="Project Name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
              />

              <div className="modalActions">
                <button type="submit">Create</button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancelBtn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;