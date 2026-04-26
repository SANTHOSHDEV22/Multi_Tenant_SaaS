import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member", // ✅ match backend
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // 📡 Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 📝 Handle input
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ➕ Add User
  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        companyId: user?.companyId?._id,
      });

      // ✅ reset form properly
      setForm({
        name: "",
        email: "",
        password: "",
        role: "member",
      });

      setShowModal(false);
      fetchUsers();
      toast.success("User added 👤");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding user ❌");
    }
  };

  // 🗑 Delete User
  const handleDeleteUser = async (id) => {
    if (id === user?._id) {
      return toast.error("You cannot delete yourself ❌");
    }

    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed ❌");
    }
  };

  return (
    <div className="usersPage">

      {/* 🔝 HEADER */}
      <div className="usersHeader">

        <button
          className="backBtn"
          onClick={() => navigate("/dashboard")}
        >
          <span className="backIcon">←</span>
        </button>

        <div>
          <h2 className="usersTitle">
            {user?.companyId?.name || "Company"} Team 👥
          </h2>
          <p className="subText">Manage your team members</p>
        </div>

        {user?.role === "admin" && (
          <button
            className="addUserBtn"
            onClick={() => setShowModal(true)}
          >
            + Add User
          </button>
        )}
      </div>

      {/* 👥 USERS LIST */}
      {loading ? (
        <p className="emptyState">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="emptyState">No users yet 🚀</p>
      ) : (
        <div className="usersGrid">
          {users.map((u) => (
            <div key={u._id} className="userCard">

              <div className="avatar">
                {u?.name?.charAt(0)?.toUpperCase()}
              </div>

              <h4>{u.name}</h4>
              <p>{u.email}</p>

              <span className="roleBadge">{u.role}</span>

              {/* 🗑 Admin Only */}
              {user?.role === "admin" && u._id !== user._id && (
                <button
                  className="removeBtn"
                  onClick={() => handleDeleteUser(u._id)}
                >
                  🗑 Remove
                </button>
              )}

            </div>
          ))}
        </div>
      )}

      {/* 🧊 MODAL */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h3>Add New User</h3>

            <form onSubmit={handleAddUser} className="form">

              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <label>Company</label>
              <input
                type="text"
                value={user?.companyId?.name || ""}
                disabled
              />

              <label>Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>

              <div className="modalActions">
                <button type="submit">Create</button>

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

export default Users;