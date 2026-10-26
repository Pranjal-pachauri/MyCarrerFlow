import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FontAwesomeIcon
} from "@fortawesome/react-fontawesome";

import {
    faArrowLeft,
    faEnvelope,
    faPaperPlane
} from "@fortawesome/free-solid-svg-icons";

import api from "../api/axios";

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");

        if (!email.trim()) {
            setError(
                "Please enter your email address."
            );
            return;
        }

        try {

            setLoading(true);

            const res = await api.post(
                "/auth/forgot-password",
                {
                    email: email.trim()
                }
            );

            setMessage(
                res.data.message
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to process request."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <button
                    type="button"
                    className="auth-back-button"
                    onClick={() => navigate("/login")}
                >
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                    />
                    Back to login
                </button>

                <div className="auth-header">

                    <h1>
                        Forgot Password?
                    </h1>

                    <p>
                        Enter your registered email
                        and we'll send you a reset link.
                    </p>

                </div>

                {message && (
                    <div className="auth-message success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="auth-message error">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    <label>
                        Email address
                    </label>

                    <div className="auth-input-wrapper">

                        <FontAwesomeIcon
                            icon={faEnvelope}
                        />

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                        />

                    </div>

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >

                        <FontAwesomeIcon
                            icon={faPaperPlane}
                        />

                        {loading
                            ? "Sending..."
                            : "Send Reset Link"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
}

export default ForgotPassword;