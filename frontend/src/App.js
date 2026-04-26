import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import Stats from "./pages/Stats";

// 🔐 Import Private Route
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={2000} />
      <Router>
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/stats" element={<Stats />} />

          {/* 🔐 Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/team"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />

          <Route
            path="/projects/:id"
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;