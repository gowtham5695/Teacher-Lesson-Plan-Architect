import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await API.post("/register", {
        name: form.name,
        email: form.email,
        password: form.password
      });

      setSuccess(res.data.message || "Registration successful! Redirecting...");
      setError("");

      // store name locally so dashboard can show it after first login
      try {
        localStorage.setItem("name", form.name);
      } catch (e) {}

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err.message || "Registration failed";
      setError(msg);
      setSuccess("");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account ✨</h2>
        <p>Register to start generating lesson plans</p>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

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

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        <button onClick={handleRegister}>Register</button>

        <p className="switch-text">
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}