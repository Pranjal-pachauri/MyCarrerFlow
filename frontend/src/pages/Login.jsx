import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail
} from "lucide-react";
import GoogleLoginButton
    from "../components/GoogleLoginButton";

import { AuthContext } from "../context/AuthContext";
// import api from "../api/axios";
function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    
    
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
   const from = location.state?.from || "/dashboard";
    const applyJobId = location.state?.applyJobId;
    const successMessage = location.state?.message || "";


const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
        await login(email, password);

        if (applyJobId) {
            navigate(`/jobs/${applyJobId}`, {
                replace: true,
                state: {
                    openApplicationModal: true
                }
            });
        } else {
            navigate(from, {
                replace: true
            });
        }

    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Invalid email or password"
        );
    } finally {
        setLoading(false);
    }
};



    return (
        <div className="auth-page">
            <div className="auth-shell">

                <div className="auth-brand">
    <img
        src="/mycareerflow-logo.svg"
        alt="MyCareerFlow"
        className="auth-logo"
    />
</div>

                <div className="auth-card">

                    <div className="auth-header">
                        <span className="auth-eyebrow">
                            Welcome back
                        </span>

                        <h1>
                            Sign in to MyCareerFlow
                        </h1>

                        <p>
                            Access your applications,
                            opportunities, and career profile.
                        </p>
                    </div>
                    {successMessage && (
                    <div className="auth-success">
                        {successMessage}
                       </div>
                           )}
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="auth-form"
                    >
                        <div className="form-group">
                            <label htmlFor="email">
                                Email address
                            </label>

                            <div className="auth-input-wrapper">
                                <Mail size={18} />

                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="password-label-row">
                                <label htmlFor="password">
                                    Password
                                </label>
                            </div>

                            <div className="auth-input-wrapper">
                                <LockKeyhole size={18} />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                        </div>
                        <div className="forgot-password-row">

    <button
        type="button"
        className="forgot-password-link"
        onClick={() =>
            navigate("/forgot-password")
        }
    >
        Forgot password?
    </button>

</div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}

                            {!loading && (
                                <ArrowRight size={18} />
                            )}
                        </button>
                    </form>
                    <div className="google-login-section">

                       <div className="auth-divider">
                           <span>or continue with</span>
                       </div>

                       <GoogleLoginButton
                           from={from}
                           applyJobId={applyJobId}
                       />

                </div>

                    <div className="auth-divider">
                        <span>New to MyCareerFlow?</span>
                    </div>

                    <Link
    to="/register"
    state={{
        from,
        applyJobId
    }}
    className="auth-secondary-btn"
>
    Create an account
</Link>

                </div>

                <p className="auth-bottom-text">
                    Build your profile. Discover opportunities.
                    Track your journey.
                </p>

            </div>
        </div>
    );
}

export default Login;