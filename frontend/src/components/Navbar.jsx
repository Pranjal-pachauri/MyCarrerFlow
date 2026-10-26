import { Link } from "react-router-dom";
import { useContext } from "react";
import {
    Sun,
    Moon,
    LayoutDashboard,
    BriefcaseBusiness,
    FileText,
    User,
    LogIn,
    UserPlus,
    LogOut
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="navbar">
            <div className="navbar-container">

                {/* BRAND */}
                <Link to="/" className="logo">
    <img
        src="/mycareerflow-mark.png"
        alt=""
        className="navbar-brand-mark"
    />

    MyCareer<span>Flow</span>
</Link>

                {/* NAVIGATION */}
                <div className="nav-links">

                    <Link to="/jobs" className="nav-link">
                        <BriefcaseBusiness size={17} />
                        <span>Jobs</span>
                    </Link>

                    {user ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="nav-link"
                            >
                                <LayoutDashboard size={17} />
                                <span>Dashboard</span>
                            </Link>

                            {user.role === "student" && (
                                <Link
                                    to="/applications"
                                    className="nav-link"
                                >
                                    <FileText size={17} />
                                    <span>Applications</span>
                                </Link>
                            )}

                            <Link
                                to="/profile"
                                className="nav-link"
                            >
                                <User size={17} />
                                <span>Profile</span>
                            </Link>

                            {/* THEME */}
                            <button
                                className="theme-toggle"
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                                title={
                                    theme === "light"
                                        ? "Switch to dark mode"
                                        : "Switch to light mode"
                                }
                            >
                                {theme === "light" ? (
                                    <Moon size={18} />
                                ) : (
                                    <Sun size={18} />
                                )}
                            </button>

                            {/* USER */}
                            <div className="navbar-user">
                                <div className="navbar-avatar">
                                    {user.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </div>

                                <span>
                                    {user.name}
                                </span>
                            </div>

                            {/* LOGOUT */}
                            <button
                                className="logout-btn"
                                onClick={logout}
                                title="Logout"
                            >
                                <LogOut size={17} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            {/* THEME */}
                            <button
                                className="theme-toggle"
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                            >
                                {theme === "light" ? (
                                    <Moon size={18} />
                                ) : (
                                    <Sun size={18} />
                                )}
                            </button>

                            <Link
                                to="/login"
                                className="nav-link"
                            >
                                <LogIn size={17} />
                                <span>Login</span>
                            </Link>

                            <Link
                                to="/register"
                                className="register-btn"
                            >
                                <UserPlus size={17} />
                                <span>Register</span>
                            </Link>
                        </>
                    )}

                </div>
            </div>
        </nav>
    );
}

export default Navbar;