import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>Lesson Architect</h2>
      {token && (
        <div>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/generate">Generate</Link>
          <Link to="/history">History</Link>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
}