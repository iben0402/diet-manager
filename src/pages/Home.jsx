import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithGoogle } from "../firebase";
import "../styles/login-register.css";
import googleSignInImg from "../assets/google-sign-in.png";

function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setStatus(null);
    setLoadingEmail(true);

    try {
      await loginWithEmail(email, password);
      setStatus({ type: "success", message: "Logged in with email." });
      navigate("/main");
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Login failed." });
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    setStatus(null);
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
      setStatus({ type: "success", message: "Logged in with Google." });
      navigate("/main");
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Google login failed." });
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="page-content-login-register">
      <div className="left-panel">
          <h1 className="title">nutri bloom</h1>
      </div>
      <div className="right-panel">
          <h2 className="login-header">Login to your account</h2>
          <form onSubmit={handleEmailLogin} className="auth-form">
            <div className="email-input input-group">
                <p>Email</p>
                <div className="input-wrapper">
                  <span className="input-icon material-symbols-outlined">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
            </div>
            <div className="password-input input-group">
                <p>Password</p>
                <div className="input-wrapper">
                  <span className="input-icon material-symbols-outlined">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <span
                    className="input-icon-right material-symbols-outlined"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </div>
                <div className="forgot-password">Forgot password?</div>
            </div>
            {status && (
              <div className={`auth-message ${status.type}`}>
                {status.message}
              </div>
            )}
            <button
              className="login-button default-button"
              type="submit"
              disabled={loadingEmail || loadingGoogle}
            >
              {loadingEmail ? "Logging in..." : "Log in"}
            </button>
          </form>
          <div className='login-or'>
              <span className="line" />
              <span className="login-or-text">or</span>
              <span className="line" />
          </div>
          <button
            type="button"
            className="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle || loadingEmail}
          >
            <img
              className="google-login"
              src={googleSignInImg}
              alt="Zaloguj się przez Google"
            />
          </button>
          <div className="register-redirect">
              <p>Don’t have an account? <strong>Register</strong></p>
          </div>
      </div>
    </div>
  );
}

export default Home;
