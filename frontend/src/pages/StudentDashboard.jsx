import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBriefcase,
    faFileLines,
    faUser,
    faStar,
    faCircleCheck,
    faCircleXmark,
    faArrowUpRightFromSquare,
    faClock
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

function StudentDashboard() {

    const { user } = useContext(AuthContext);

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);


    // =========================
    // GET APPLICATIONS
    // =========================

    useEffect(() => {

        const getApplications = async () => {

            try {

                const res = await api.get(
                    "/applications/my"
                );

                setApplications(res.data);

            } catch (error) {

                console.log(
                    "Failed to load applications:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        getApplications();

    }, []);


    // =========================
    // STATISTICS
    // =========================

    const totalApplications =
        applications.length;

    const shortlisted =
        applications.filter(
            (application) =>
                application.status === "Shortlisted"
        ).length;

    const selected =
        applications.filter(
            (application) =>
                application.status === "Selected"
        ).length;

    const rejected =
        applications.filter(
            (application) =>
                application.status === "Rejected"
        ).length;


    // Latest 3 applications
    const recentApplications =
        applications.slice(0, 3);


    // =========================
    // STATUS CLASS
    // =========================

    const getStatusClass = (status) => {

        return `student-status student-status-${status.toLowerCase()}`;

    };


    return (
        <div className="student-dashboard">


            {/* =========================
                DASHBOARD HEADER
            ========================= */}

            <section className="student-welcome">

                <div className="student-welcome-content">

                    <span className="student-eyebrow">
                        Student Dashboard
                    </span>

                    <h1>
                        Welcome back,{" "}
                        <span>
                            {user?.name}
                        </span>
                    </h1>

                    <p>
                        Keep track of your applications,
                        discover new opportunities, and
                        manage your career profile.
                    </p>

                </div>


                <Link
                    to="/profile"
                    className="profile-completion-card"
                >

                    <div className="profile-completion-top">

                        <div className="profile-completion-icon">

                            <FontAwesomeIcon
                                icon={faUser}
                            />

                        </div>

                        <span>
                            Career Profile
                        </span>

                    </div>


                    <div className="profile-completion-bottom">

                        <span>
                            Keep your profile updated
                        </span>

                        <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                        />

                    </div>

                </Link>

            </section>


            {/* =========================
                STATISTICS
            ========================= */}

            <section className="student-stats">


                {/* TOTAL APPLICATIONS */}

                <div className="student-stat-card">

                    <div className="student-stat-icon blue">

                        <FontAwesomeIcon
                            icon={faFileLines}
                        />

                    </div>


                    <div className="student-stat-content">

                        <span>
                            Total Applications
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : totalApplications}
                        </strong>

                        <small>
                            Applications submitted
                        </small>

                    </div>

                </div>


                {/* SHORTLISTED */}

                <div className="student-stat-card">

                    <div className="student-stat-icon yellow">

                        <FontAwesomeIcon
                            icon={faStar}
                        />

                    </div>


                    <div className="student-stat-content">

                        <span>
                            Shortlisted
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : shortlisted}
                        </strong>

                        <small>
                            Applications shortlisted
                        </small>

                    </div>

                </div>


                {/* SELECTED */}

                <div className="student-stat-card">

                    <div className="student-stat-icon green">

                        <FontAwesomeIcon
                            icon={faCircleCheck}
                        />

                    </div>


                    <div className="student-stat-content">

                        <span>
                            Selected
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : selected}
                        </strong>

                        <small>
                            Successful applications
                        </small>

                    </div>

                </div>


                {/* REJECTED */}

                <div className="student-stat-card">

                    <div className="student-stat-icon red">

                        <FontAwesomeIcon
                            icon={faCircleXmark}
                        />

                    </div>


                    <div className="student-stat-content">

                        <span>
                            Rejected
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : rejected}
                        </strong>

                        <small>
                            Applications rejected
                        </small>

                    </div>

                </div>

            </section>


            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <section className="student-section">

                <div className="student-section-heading">

                    <div>

                        <h2>
                            Quick Actions
                        </h2>

                        <p>
                            Continue your placement journey.
                        </p>

                    </div>

                </div>


                <div className="student-actions-grid">


                    {/* BROWSE JOBS */}

                    <Link
                        to="/jobs"
                        className="student-action-card"
                    >

                        <div className="student-action-icon">

                            <FontAwesomeIcon
                                icon={faBriefcase}
                            />

                        </div>


                        <div className="student-action-content">

                            <h3>
                                Browse Jobs
                            </h3>

                            <p>
                                Discover internships and
                                placement opportunities.
                            </p>

                        </div>


                        <div className="student-action-arrow">

                            <FontAwesomeIcon
                                icon={faArrowUpRightFromSquare}
                            />

                        </div>

                    </Link>


                    {/* MY APPLICATIONS */}

                    <Link
                        to="/applications"
                        className="student-action-card"
                    >

                        <div className="student-action-icon">

                            <FontAwesomeIcon
                                icon={faFileLines}
                            />

                        </div>


                        <div className="student-action-content">

                            <h3>
                                My Applications
                            </h3>

                            <p>
                                Track your applications and
                                their current status.
                            </p>

                        </div>


                        <div className="student-action-arrow">

                            <FontAwesomeIcon
                                icon={faArrowUpRightFromSquare}
                            />

                        </div>

                    </Link>


                    {/* MY PROFILE */}

                    <Link
                        to="/profile"
                        className="student-action-card"
                    >

                        <div className="student-action-icon">

                            <FontAwesomeIcon
                                icon={faUser}
                            />

                        </div>


                        <div className="student-action-content">

                            <h3>
                                My Profile
                            </h3>

                            <p>
                                Manage your personal and
                                academic information.
                            </p>

                        </div>


                        <div className="student-action-arrow">

                            <FontAwesomeIcon
                                icon={faArrowUpRightFromSquare}
                            />

                        </div>

                    </Link>

                </div>

            </section>


            {/* =========================
                RECENT APPLICATIONS
            ========================= */}

            <section className="student-section">

                <div className="student-section-heading">

                    <div>

                        <h2>
                            Recent Applications
                        </h2>

                        <p>
                            Your latest placement activity.
                        </p>

                    </div>


                    {applications.length > 0 && (

                        <Link
                            to="/applications"
                            className="view-all-link"
                        >

                            View all

                            <FontAwesomeIcon
                                icon={faArrowUpRightFromSquare}
                            />

                        </Link>

                    )}

                </div>


                {/* LOADING */}

                {loading ? (

                    <div className="student-empty-card">

                        <div className="student-loading-spinner"></div>

                        <p>
                            Loading applications...
                        </p>

                    </div>


                ) : recentApplications.length === 0 ? (


                    /* NO APPLICATIONS */

                    <div className="student-empty-card">

                        <div className="student-empty-icon">

                            <FontAwesomeIcon
                                icon={faBriefcase}
                            />

                        </div>

                        <h3>
                            No applications yet
                        </h3>

                        <p>
                            Start exploring jobs and apply
                            to opportunities that match
                            your skills.
                        </p>


                        <Link
                            to="/jobs"
                            className="student-primary-btn"
                        >

                            Browse Jobs

                            <FontAwesomeIcon
                                icon={faArrowUpRightFromSquare}
                            />

                        </Link>

                    </div>


                ) : (


                    /* RECENT APPLICATIONS */

                    <div className="recent-applications">

                        {recentApplications.map(
                            (application) => (

                                <div
                                    className="recent-application"
                                    key={application._id}
                                >


                                    <div className="recent-company-icon">

                                        <FontAwesomeIcon
                                            icon={faBriefcase}
                                        />

                                    </div>


                                    <div className="recent-application-info">

                                        <h3>
                                            {
                                                application.job
                                                    ?.title
                                            }
                                        </h3>

                                        <p>

                                            {
                                                application.job
                                                    ?.company
                                            }

                                            {application.job
                                                ?.location && (
                                                <>
                                                    {" · "}
                                                    {
                                                        application
                                                            .job
                                                            .location
                                                    }
                                                </>
                                            )}

                                        </p>

                                    </div>


                                    <div className="recent-application-status">

                                        <span
                                            className={getStatusClass(
                                                application.status
                                            )}
                                        >
                                            {application.status}
                                        </span>


                                        <span className="recent-applied">

                                            <FontAwesomeIcon
                                                icon={faClock}
                                            />

                                            {" "}Applied

                                        </span>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>

        </div>
    );
}

export default StudentDashboard;