import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* 🔝 NAVBAR */}
      <nav className="navbar">
        <h2 className="logo">SaaSify</h2>

        {/* Desktop Buttons */}
        <div className="navButtons">
          <button className="loginBtn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="signupBtn" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="hamburger" onClick={() => setMenuOpen(true)}>
          ☰
        </div>
      </nav>

      {/* 📱 SIDEBAR */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="closeBtn" onClick={() => setMenuOpen(false)}>
          ✕
        </div>

        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/register")}>Sign Up</button>
      </div>

      {/* 🌟 HERO */}
      <section className="hero">
        <h1>
          Manage Work <br /> Like a Pro 🚀
        </h1>

        <p>
          Multi-tenant SaaS platform to manage teams, projects, and tasks with
          ease.
        </p>

        <button onClick={() => navigate("/register")} className="cta">
          Get Started
        </button>
      </section>
    </div>
  );
}

export default Landing;