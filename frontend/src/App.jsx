
import { useState } from 'react'
import './App.css'
import { signup } from './Services/authService'

function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setMessage('')
  }


  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (formData.password.length < 8) {
      setMessage('Password must contain at least 8 characters.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    try {
      setMessage('Creating account...')

      await signup(formData)

      setMessage('Account created successfully!')

      setFormData({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
      })
    } catch (error) {
      setMessage(error.message || 'Signup failed.')
    }
  }


  return (
    <main className="signup-page">
      <section className="brand-panel">
        <div className="brand">
          <div className="brand-icon">W</div>
          <span>Warehouse<span className="brand-highlight">IQ</span></span>
        </div>

        <div className="brand-content">
          <span className="eyebrow">SMARTER INVENTORY. BETTER CONTROL.</span>
          <h1>Everything in its place. Every move in control.</h1>
          <p>
            A smarter way to manage warehouse inventory,
            track assets and streamline operations.
          </p>

          <div className="feature-list">
            <div className="feature">
              <span className="feature-icon">✓</span>
              Real-time inventory visibility
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              Intelligent asset tracking
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              Smarter warehouse operations
            </div>
          </div>
        </div>

        <p className="brand-footer">AI & Robotics Based Inventory Management</p>
      </section>

      <section className="form-panel">
        <div className="form-container">
          <div className="mobile-brand">Warehouse<span>IQ</span></div>

          <div className="form-heading">
            <span className="eyebrow">GET STARTED TODAY</span>
            <h2>Create your account</h2>
            <p>Enter your details to get started with the platform.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password again"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <label className="show-password">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              Show passwords
            </label>

            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}

            <button className="signup-button" type="submit">
              Create account <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="login-prompt">
            Already have an account? <a href="/login">Sign in</a>
          </p>

          <p className="terms">
            By creating an account, you agree to your organization's
            applicable terms and policies.
          </p>
        </div>
      </section>
    </main>
  )
}

export default App
