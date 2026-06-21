import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/criminals", label: "Criminals", icon: "👤" },
    { to: "/cases", label: "Cases", icon: "📁" },
    { to: "/officers", label: "Officers", icon: "🛡️" },
    { to: "/evidence", label: "Evidence", icon: "🔍" },
    { to: "/reports", label: "Reports", icon: "📋" },
  ];

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setOpen(!open)}>
        ☰ Menu
      </button>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <h2>Crime CMS</h2>
          <span>Record Management System</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link ${location.pathname.startsWith(link.to) ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div>{user?.name || "User"}</div>
            <div className="user-role">{user?.role || "Viewer"}</div>
          </div>
          <button className="btn btn-accent btn-sm" style={{ width: "100%" }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
