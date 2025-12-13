import { useState } from "react";
import "../styles/login-register.css";
import googleSignInImg from "../assets/google-sign-in.png";

function Home() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="page-content-login-register">
      <div className="left-panel">
          <h1 className="title">nutri bloom</h1>
      </div>
      <div className="right-panel">
          <h2 className="login-header">Login to your account</h2>
          <div className="email-input input-group">
              <p>Email</p>
              <div className="input-wrapper">
                <span className="input-icon material-symbols-outlined">mail</span>
                <input type="email" />
              </div>
          </div>
          <div className="password-input input-group">
              <p>Password</p>
              <div className="input-wrapper">
                <span className="input-icon material-symbols-outlined">lock</span>
                <input type={showPassword ? "text" : "password"} />
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
          <button className="login-button default-button">Log in</button>
          <div className='login-or'>
              <span className="line" />
              <span className="login-or-text">or</span>
              <span className="line" />
          </div>
          <img
            className="google-login"
            src={googleSignInImg}
            alt="Zaloguj się przez Google"
          />
          <div className="register-redirect">
              <p>Don’t have an account? <strong>Register</strong></p>
          </div>
      </div>
    </div>
  );
}

export default Home;
