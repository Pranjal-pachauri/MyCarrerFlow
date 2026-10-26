import {
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    FontAwesomeIcon
} from "@fortawesome/react-fontawesome";

import {
    faLock,
    faCheck,
    faEye,
    faEyeSlash
} from "@fortawesome/free-solid-svg-icons";

import api from "../api/axios";

function ResetPassword() {

    const {
        token
    } = useParams();

    const navigate =
        useNavigate();

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

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

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        try {

            setLoading(true);

            const res = await api.post(
                `/auth/reset-password/${token}`,
                {
                    password
                }
            );

            setMessage(
                res.data.message
            );

            setTimeout(() => {
                navigate("/login");
            }, 1800);

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to reset password."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <h1>
                        Create New Password
                    </h1>

                    <p>
                        Choose a new password for
                        your MyCareerFlow account.
                    </p>

                </div>

                {message && (
                    <div className="auth-message success">
                        <FontAwesomeIcon
                            icon={faCheck}
                        />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="auth-message error">
                        {error}
                    </div>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <label>
                        New password
                    </label>

                    <div className="auth-input-wrapper">

                        <FontAwesomeIcon
                            icon={faLock}
                        />

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="At least 8 characters"
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowPassword(
                                    current => !current
                                )
                            }
                        >
                            <FontAwesomeIcon
                                icon={
                                    showPassword
                                        ? faEyeSlash
                                        : faEye
                                }
                            />
                        </button>

                    </div>

                    <label>
                        Confirm password
                    </label>

                    <div className="auth-input-wrapper">

                        <FontAwesomeIcon
                            icon={faLock}
                        />

                        <input
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Enter password again"
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowConfirmPassword(
                                    current => !current
                                )
                            }
                        >
                            <FontAwesomeIcon
                                icon={
                                    showConfirmPassword
                                        ? faEyeSlash
                                        : faEye
                                }
                            />
                        </button>

                    </div>

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Updating..."
                            : "Reset Password"
                        }
                    </button>

                </form>

            </div>

        </div>
    );
}

export default ResetPassword;