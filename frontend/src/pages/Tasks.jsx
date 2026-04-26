import { useEffect, useState, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import "./Tasks.css";

function Tasks() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

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

  // 📡 Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [taskRes, projectRes, userRes] = await Promise.all([
        API.get(`/tasks?projectId=${id}`),
        API.get(`/projects/${id}`),
        API.get(`/users`),
      ]);

      setTasks(taskRes.data?.tasks || []);
      setProject(projectRes.data);
      setUsers(userRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🎯 Columns
  const columns = useMemo(() => {
    return {
      "Not Assigned": tasks.filter((t) => t.status === "Not Assigned"),
      "In-Progress": tasks.filter((t) => t.status === "In-Progress"),
      Completed: tasks.filter((t) => t.status === "Completed"),
    };
  }, [tasks]);

  // 🎯 Drag
  const handleDrag = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    const updatedTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, status: newStatus } : t
    );

    setTasks(updatedTasks);

    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
    } catch {
      fetchData();
      toast.error("Failed to update task status ❌");
    }
  };

  // ➕ Create
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

      setShowModal(false);
      fetchData();
      toast.success("Project created 🎉");
    } catch {
      toast.error("Error creating task ❌");
    }
  };

  // 🔄 Update
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await API.put(`/tasks/${selectedTask._id}`, {
        ...form,
        assignedTo: form.assignedTo || null,
      });

      setTasks((prev) =>
        prev.map((t) =>
          t._id === selectedTask._id ? res.data : t
        )
      );

      setShowModal(false);
      setSelectedTask(null);
      toast.success("Task updated ✅");
    } catch {
      toast.error("Update failed ❌");
    }
  };

  // 🗑 Delete
  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success("Task deleted 🗑️");
    } catch {
      toast.error("Delete failed ❌");
    }
  };

  // ✏️ Open/Edit
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

  // ➕ Add Task button
  const openCreateModal = () => {
    setSelectedTask(null);

    setForm({
      title: "",
      description: "",
      status: "Not Assigned",
      assignedTo: "",
    });

    setShowModal(true);
  };

  return (
    <div className="tasksPage">
      {/* 🔝 HEADER */}
      <div className="tasksHeader">
        <h2 className="projectTitle">
          {project?.name || "Project"} Tasks
        </h2>

        <div className="headerActions">
          <button
            className="backBtn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>

          {user?.role === "admin" && (
            <button
              className="addTaskBtn"
              onClick={openCreateModal}
            >
              + Add Task
            </button>
          )}
        </div>
      </div>

      {/* 🧱 KANBAN */}
      <DragDropContext onDragEnd={handleDrag}>
        <div className="kanbanBoard">
          {Object.entries(columns).map(([status, items]) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="kanbanColumn"
                >
                  <h3>{status}</h3>

                  {items.map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="taskCard"
                          style={provided.draggableProps.style}
                        >
                          <h4 className="taskTitle">{task.title}</h4>

                          {task.description && <p>{task.description}</p>}

                          <p className="assigned">
                            👤 {task.assignedTo?.name || "Unassigned"}
                          </p>

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
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* 🧊 MODAL */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h3>{selectedTask ? "Edit Task" : "Create Task"}</h3>

            <form onSubmit={selectedTask ? handleUpdate : handleCreate}>
              <label>Title</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                required
              />

              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option>Not Assigned</option>
                <option>In-Progress</option>
                <option>Completed</option>
              </select>

              <label>Assign User</label>
              <select
                value={form.assignedTo}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    assignedTo: e.target.value,
                  }))
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
                <button type="submit">
                  {selectedTask ? "Update" : "Create"}
                </button>

                <button
                  type="button"
                  className="cancelBtn"
                  onClick={() => setShowModal(false)}
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