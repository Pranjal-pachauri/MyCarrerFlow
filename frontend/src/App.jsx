import { lazy, Suspense, useContext } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Link
} from "react-router-dom";

import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

import "./App.css";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Jobs = lazy(() => import("./pages/Jobs"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const Profile = lazy(() => import("./pages/Profile"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

function Dashboard() {
    const { user } = useContext(AuthContext);

    return user?.role === "admin"
        ? <AdminDashboard />
        : <StudentDashboard />;
}

function Home() {
const { user } = useContext(AuthContext);

return (
    <div className="mc-home">
        <section className="mc-hero">
            <div className="mc-hero-content">
                <span className="mc-eyebrow">
                    YOUR NEXT CHAPTER STARTS HERE
                </span>

                <h1>
                    Build your future.
                    <span> One opportunity at a time.</span>
                </h1>

                <p className="mc-hero-description">
                    Discover opportunities, organize your applications,
                    and build a profile that reflects your potential.
                    Your career journey starts here.
                </p>

                <div className="mc-hero-actions">
                    <Link to="/jobs" className="mc-btn mc-btn-primary">
                        Explore opportunities
                        <span>↗</span>
                    </Link>

                    <Link
                        to={user ? "/profile" : "/register"}
                        className="mc-btn mc-btn-secondary"
                    >
                        {user ? "View my profile" : "Create free account"}
                    </Link>
                </div>

                <div className="mc-hero-note">
                    <span className="mc-note-dot"></span>
                    A clearer way to navigate your career.
                </div>
            </div>

            <div className="mc-hero-visual">
                <div className="mc-visual-glow"></div>
                <div className="mc-decoration mc-decoration-one"></div>
                <div className="mc-decoration mc-decoration-two"></div>

                <div className="mc-product-window">
                    <div className="mc-window-top">
                        <div className="mc-window-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span className="mc-window-label">MYCAREERFLOW</span>
                    </div>

                    <div className="mc-product-body">
                        <div className="mc-product-heading">
                            <div>
                                <span className="mc-mini-label">
                                    YOUR CAREER SPACE
                                </span>
                                <h3>Your next move.</h3>
                            </div>
                            <div className="mc-avatar">M</div>
                        </div>

                        <div className="mc-profile-card">
                            <div className="mc-profile-icon">✳</div>
                            <div className="mc-profile-copy">
                                <strong>Build your profile</strong>
                                <span>
                                    Put your skills and experience forward.
                                </span>
                            </div>
                            <span className="mc-card-arrow">↗</span>
                        </div>

                        <div className="mc-jobs-heading">
                            <h4>Explore opportunities</h4>
                            <span>Find your fit</span>
                        </div>

                        <div className="mc-job-card">
                            <div className="mc-company-icon mc-company-blue">F</div>
                            <div className="mc-job-info">
                                <strong>Frontend Developer</strong>
                                <span>Product & Engineering</span>
                                <div className="mc-job-tags">
                                    <span>React</span>
                                    <span>Full-time</span>
                                </div>
                            </div>
                            <span className="mc-job-arrow">↗</span>
                        </div>

                        <div className="mc-job-card">
                            <div className="mc-company-icon mc-company-purple">D</div>
                            <div className="mc-job-info">
                                <strong>UI/UX Designer</strong>
                                <span>Design & Experience</span>
                                <div className="mc-job-tags">
                                    <span>Figma</span>
                                    <span>Creative</span>
                                </div>
                            </div>
                            <span className="mc-job-arrow">↗</span>
                        </div>

                        <div className="mc-job-card">
                            <div className="mc-company-icon mc-company-orange">S</div>
                            <div className="mc-job-info">
                                <strong>Software Engineer</strong>
                                <span>Technology</span>
                                <div className="mc-job-tags">
                                    <span>Java</span>
                                    <span>Developer</span>
                                </div>
                            </div>
                            <span className="mc-job-arrow">↗</span>
                        </div>

                        <div className="mc-product-footer">
                            <span className="mc-footer-spark">✦</span>
                            Your next chapter starts with one step.
                        </div>
                    </div>
                </div>

                <div className="mc-floating-note">
                    <span className="mc-floating-icon">✓</span>
                    <div>
                        <strong>Your goals, organized.</strong>
                        <span>Everything in one place</span>
                    </div>
                </div>
            </div>
        </section>

        <section className="mc-trust-strip">
            <span>MADE FOR YOUR NEXT STEP</span>
            <div className="mc-trust-item">
                <span>01</span> Discover
            </div>
            <div className="mc-trust-line"></div>
            <div className="mc-trust-item">
                <span>02</span> Prepare
            </div>
            <div className="mc-trust-line"></div>
            <div className="mc-trust-item">
                <span>03</span> Progress
            </div>
        </section>

        <section className="mc-features">
            <div className="mc-section-heading">
                <span className="mc-eyebrow">YOUR CAREER, SIMPLIFIED</span>
                <h2>Everything you need to <span>move forward.</span></h2>
                <p>
                    Less confusion. More clarity. A better way to manage
                    your career journey.
                </p>
            </div>

            <div className="mc-feature-grid">
                <article className="mc-feature-card mc-feature-featured">
                    <div className="mc-feature-icon mc-icon-blue">⌕</div>
                    <span className="mc-feature-number">01 / DISCOVER</span>
                    <h3>Find opportunities</h3>
                    <p>
                        Explore available jobs and find roles that fit
                        your interests, skills, and ambitions.
                    </p>
                    <Link to="/jobs" className="mc-feature-link">
                        Explore jobs <span>↗</span>
                    </Link>
                    <div className="mc-feature-decoration">01</div>
                </article>

                <article className="mc-feature-card">
                    <div className="mc-feature-icon mc-icon-purple">▤</div>
                    <span className="mc-feature-number">02 / ORGANIZE</span>
                    <h3>Stay on track</h3>
                    <p>
                        Keep your applications organized and follow
                        their progress from one place.
                    </p>
                    <Link
                        to={user ? "/applications" : "/login"}
                        className="mc-feature-link"
                    >
                        {user ? "My applications" : "Get started"} <span>↗</span>
                    </Link>
                    <div className="mc-feature-decoration">02</div>
                </article>

                <article className="mc-feature-card">
                    <div className="mc-feature-icon mc-icon-orange">✳</div>
                    <span className="mc-feature-number">03 / BUILD</span>
                    <h3>Show your potential</h3>
                    <p>
                        Bring your education, skills, and achievements
                        together in a professional profile.
                    </p>
                    <Link
                        to={user ? "/profile" : "/register"}
                        className="mc-feature-link"
                    >
                        {user ? "My profile" : "Build your profile"} <span>↗</span>
                    </Link>
                    <div className="mc-feature-decoration">03</div>
                </article>
            </div>
        </section>

        <section className="mc-cta-section">
            <div className="mc-cta-orb mc-cta-orb-one"></div>
            <div className="mc-cta-orb mc-cta-orb-two"></div>

            <div className="mc-cta-content">
                <span className="mc-cta-eyebrow">YOUR JOURNEY. YOUR FUTURE.</span>
                <h2>Make your next move <span>count.</span></h2>
                <p>
                    Start with a profile. Discover new possibilities.
                    Take your career one step further.
                </p>

                <div className="mc-cta-actions">
                    <Link to={user ? "/jobs" : "/register"} className="mc-cta-button">
                        {user ? "Explore opportunities" : "Get started for free"}
                        <span>↗</span>
                    </Link>
                    <Link to="/jobs" className="mc-cta-link">
                        Browse available jobs
                    </Link>
                </div>
            </div>

            <div className="mc-cta-symbol">↗</div>
        </section>

        <footer className="mc-footer">
            <Link to="/" className="mc-footer-brand">
                MyCareer<span>Flow</span><i>.</i>
            </Link>
            <p>Find your direction. Build your future.</p>
            <div className="mc-footer-links">
                <Link to="/jobs">Explore Jobs</Link>
                <Link to={user ? "/profile" : "/login"}>My Career</Link>
                <Link to="/register">Get Started</Link>
            </div>
            <span className="mc-copyright">
                © {new Date().getFullYear()} MyCareerFlow
            </span>
        </footer>
    </div>
);

}

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Suspense
                fallback={
                    <div className="page-loading">
                        Loading MyCareerFlow...
                    </div>
                }
            >
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetails />} />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/reset-password/:token"
                        element={<ResetPassword />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/applications"
                        element={
                            <ProtectedRoute>
                                <MyApplications />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;

