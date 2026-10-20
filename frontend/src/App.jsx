
import { useState } from "react";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isLogin
        ? "http://localhost:8080/api/auth/login"
        : "http://localhost:8080/api/auth/signup";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin
            ? {
                username: form.username,
                password: form.password,
              }
            : {
                username: form.username,
                fullName: form.fullName,
                password: form.password,
              }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Authentication failed.");
      }

      if (isLogin && data.token) {
        localStorage.setItem("warehouseToken", data.token);
      }

      setMessage(
        isLogin
          ? "Login successful! You are authenticated."
          : "Account created successfully! You can now sign in."
      );

      if (!isLogin) {
        setIsLogin(true);
        setForm({ username: form.username, fullName: "", password: "" });
      }
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to the Java API. Make sure the backend is running."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="brand-panel">
        <div className="brand">
          <span className="brand-icon">W</span>
          <span>WareFlow</span>
        </div>

        <div className="brand-content">
          <span className="eyebrow">SMART WAREHOUSE MANAGEMENT</span>
          <h1>Manage your warehouse with confidence.</h1>
          <p>
            Keep your inventory organized, streamline operations, and manage
            QR-enabled products from one place.
          </p>
          <div className="feature-list">
            <div>✓ Inventory management</div>
            <div>✓ QR code tracking</div>
            <div>✓ Secure account access</div>
          </div>
        </div>

        <p className="brand-footer">Warehouse Management System</p>
      </section>

      <section className="form-panel">
        <div className="auth-card">
          <div className="mobile-brand">WAREFLOW</div>

          <p className="form-eyebrow">
            {isLogin ? "WELCOME BACK" : "GET STARTED"}
          </p>

          <h2>{isLogin ? "Sign in to your account" : "Create your account"}</h2>

          <p className="form-description">
            {isLogin
              ? "Enter your credentials to continue."
              : "Fill in your details to join your workspace."}
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={isLogin ? "tab active" : "tab"}
              onClick={() => {
                setIsLogin(true);
                setMessage("");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={!isLogin ? "tab active" : "tab"}
              onClick={() => {
                setIsLogin(false);
                setMessage("");
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />

            {!isLogin && (
              <>
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </>
            )}

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={8}
              required
            />

            <button className="submit-button" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In →"
                  : "Create Account →"}
            </button>
          </form>

          {message && (
            <div className="message" role="status">
              {message}
            </div>
          )}

          <p className="security-note">
            Your account is verified by the Java backend.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
