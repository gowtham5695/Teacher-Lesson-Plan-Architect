import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", form.email);

      try {
        const userRes = await API.get(`/user/${encodeURIComponent(form.email)}`);
        if (userRes?.data?.name) {
          localStorage.setItem("name", userRes.data.name);
        }
      } catch (e) {
        // ignore — name is optional
      }

      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err.message || "Invalid Email or Password";
      setError(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back 👋</h2>
        <p>Please login to continue</p>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button onClick={handleLogin}>Login</button>

        <p className="switch-text">
          Don’t have an account?{" "}
          <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}