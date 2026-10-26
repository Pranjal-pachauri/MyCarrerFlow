import { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    UserRound
} from "lucide-react";

import api from "../api/axios";

function Register() {

    const navigate = useNavigate();
    const location = useLocation();

    const from =
        location.state?.from || "/dashboard";

    const applyJobId =
        location.state?.applyJobId;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            await api.post(
                "/auth/register",
                {
                    name,
                    email,
                    password
                }
            );

            navigate("/login", {
                state: {
                    message:
                        "Account created successfully. Please sign in.",
                    from,
                    applyJobId
                }
            });

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="auth-page">

            <div className="auth-shell">

                {/* BRAND */}

                <div className="auth-brand">

                    <img
                        src="/mycareerflow-mark.png"
                        alt=""
                        className="auth-brand-mark"
                    />

                    <div className="auth-brand-name">
                        <strong>
                            MyCareerFlow
                        </strong>

                        <span>
                            CAREER & PLACEMENT MANAGEMENT
                        </span>
                    </div>

                </div>


                {/* CARD */}

                <div className="auth-card">

                    <div className="auth-header">

                        <span className="auth-eyebrow">
                            Get started
                        </span>

                        <h1>
                            Create your account
                        </h1>

                        <p>
                            Join MyCareerFlow and manage
                            your career journey in one place.
                        </p>

                    </div>


                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="auth-form"
                    >

                        {/* NAME */}

                        <div className="form-group">

                            <label htmlFor="name">
                                Full name
                            </label>

                            <div className="auth-input-wrapper">

                                <UserRound size={18} />

                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* EMAIL */}

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


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="auth-input-wrapper">

                                <LockKeyhole size={18} />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Create a password"
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
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating account..."
                                : "Create account"}

                            {!loading && (
                                <ArrowRight size={18} />
                            )}

                        </button>

                    </form>


                    <div className="auth-divider">

                        <span>
                            Already have an account?
                        </span>

                    </div>


                    <Link
                        to="/login"
                        state={{
                            from,
                            applyJobId
                        }}
                        className="auth-secondary-btn"
                    >
                        Sign in
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

export default Register;