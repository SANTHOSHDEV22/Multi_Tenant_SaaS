import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import "./Tasks.css";

function Tasks() {
    const { id } = useParams();

    const user = JSON.parse(localStorage.getItem("user"));

    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState(null);
    const [users, setUsers] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "Not Assigned",
        assignedTo: "",
    });

    // 📡 Fetch project + tasks + users
    const fetchData = useCallback(async () => {
        try {
            const [taskRes, projectRes, userRes] = await Promise.all([
                API.get(`/tasks?projectId=${id}`),
                API.get(`/projects/${id}`),
                API.get(`/users`), // 🔥 company users
            ]);

            setTasks(taskRes.data?.tasks || []);
            setProject(projectRes.data);
            setUsers(userRes.data || []);
        } catch (err) {
            console.error(err);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusClass = (status) => {
  switch (status) {
    case "Assigned":
      return "status-assigned";
    case "In Progress":
    case "In-Progress":
      return "status-progress";
    case "Completed":
      return "status-completed";
    default:
      return "status-default";
  }
};

    // ➕ CREATE TASK
    const handleCreate = async (e) => {
        e.preventDefault();

        try {
            await API.post("/tasks", {
                ...form,
                projectId: id,
                assignedTo: form.assignedTo || null,
            });

            setForm({
                title: "",
                description: "",
                status: "Not Assigned",
                assignedTo: "",
            });

            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Error");
        }
    };

    // 🗑 DELETE
    const handleDelete = async (taskId) => {
        if (!window.confirm("Delete this task?")) return;

        try {
            await API.delete(`/tasks/${taskId}`);
            fetchData();
        } catch (err) {
            alert("Delete failed");
        }
    };

    // ✏️ OPEN MODAL
    const openTask = (task) => {
        setSelectedTask(task);
        setForm({
            title: task.title || "",
            description: task.description || "",
            status: task.status || "Not Assigned",
            assignedTo: task.assignedTo?._id || "",
        });
        setShowModal(true);
    };

    // 🔄 UPDATE
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            await API.put(`/tasks/${selectedTask._id}`, {
                ...form,
                assignedTo: form.assignedTo || null,
            });

            setShowModal(false);
            setSelectedTask(null);
            fetchData();
        } catch (err) {
            alert("Update failed");
        }
    };

    return (
        <div className="tasksPage">
            {/* 🔝 Title */}
            <h2 className="projectTitle">
                {project?.name || "Project"} Tasks
            </h2>

            {/* ➕ CREATE (ADMIN ONLY) */}
            {user?.role === "admin" && (
                <form className="taskForm" onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="Task title"
                        value={form.title}
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
                        required
                    />

                    <button type="submit">Add Task</button>
                </form>
            )}

            {/* 📋 TASK LIST */}
            <div className="taskGrid">
                {tasks.length === 0 ? (
                    <p>No tasks yet 🚀</p>
                ) : (
                    tasks.map((task) => (
                        <div key={task._id} className="taskCard">
                            <h4 className="taskTitle">{task.title}</h4>

                            {task.description && <p>{task.description}</p>}

                            <span className={`status ${getStatusClass(task.status)}`}>
                                {task.status || "Not Assigned"}
                            </span>

                            {task.assignedTo && (
                                <p className="assigned">
                                    👤 {task.assignedTo.name}
                                </p>
                            )}

                            <div className="taskActions">
                                <button
                                    className="openBtn"
                                    onClick={() => openTask(task)}
                                >
                                    Open
                                </button>

                                {user?.role === "admin" && (
                                    <button
                                        className="deleteBtn"
                                        onClick={() => handleDelete(task._id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 🧊 MODAL */}
            {showModal && (
                <div className="modalOverlay">
                    <div className="modal">
                        <h3>Edit Task</h3>

                        <form onSubmit={handleUpdate}>
                            {/* TITLE */}
                            <label>Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) =>
                                    setForm({ ...form, title: e.target.value })
                                }
                                required
                            />

                            {/* DESCRIPTION */}
                            <label>Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                            />

                            {/* STATUS */}
                            <label>Status</label>
                            <select
                                value={form.status}
                                onChange={(e) =>
                                    setForm({ ...form, status: e.target.value })
                                }
                            >
                                <option>Not Assigned</option>
                                <option>Assigned</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                            </select>

                            {/* ASSIGNED TO */}
                            <label>Assigned To</label>
                            <select
                                value={form.assignedTo}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        assignedTo: e.target.value,
                                    })
                                }
                            >
                                <option value="">Select user</option>
                                {users.map((u) => (
                                    <option key={u._id} value={u._id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>

                            <div className="modalActions">
                                <button type="submit">Update</button>

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

export default Tasks;