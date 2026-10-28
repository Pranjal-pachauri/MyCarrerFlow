import {
    useContext,
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams,
    useLocation
} from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faBriefcase,
    faLocationDot,
    faIndianRupeeSign,
    faGraduationCap,
    faArrowLeft,
    faCheckCircle,
    faPaperPlane,
    faIndustry,
    faUsers,
    faCalendar,
    faHouse,
    faGlobe,
    faBriefcaseClock,
    faLaptopHouse,
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

import ApplicationModal
    from "../components/ApplicationModal";

import "../jobdetails.css";

function JobDetails() {

    const { id } = useParams();

    const navigate = useNavigate();
    const location = useLocation();

    const { user } =
        useContext(AuthContext);


    /* ================================
       JOB STATE
    ================================= */

    const [job, setJob] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* ================================
       APPLICATION MODAL
    ================================= */

    const [showApplyModal, setShowApplyModal] =
        useState(false);

    useEffect(() => {
    if (
        user &&
        location.state?.openApplicationModal
    ) {
        setShowApplyModal(true);
    }
}, [user, location.state]);

    /* ================================
       LOAD JOB
    ================================= */

    useEffect(() => {

        const loadJob = async () => {

            try {

                const res =
                    await api.get(
                        `/jobs/${id}`
                    );

                setJob(res.data);

            } catch (error) {

                console.error(error);

                setError(
                    error.response?.data?.message ||
                    "Failed to load job"
                );

            } finally {

                setLoading(false);

            }
        };

        loadJob();

    }, [id]);


    /* ================================
       APPLY BUTTON
    ================================= */

    const handleApplyClick = () => {

        /*
         * User is not logged in.
         * Send them to login first.
         */

        if (!user) {

            navigate("/login", {
                state: {
                    from: `/jobs/${id}`,
                    applyJobId: id
                }
            });

            return;
        }


        /*
         * User is logged in.
         * Open application modal.
         */

        setShowApplyModal(true);


    };


    /* ================================
       LOADING
    ================================= */

    if (loading) {

        return (
            <div className="job-details-page">

                <div className="job-details-state">

                    Loading job details...

                </div>

            </div>
        );

    }


    /* ================================
       ERROR
    ================================= */

    if (error || !job) {

        return (
            <div className="job-details-page">

                <div className="job-details-state error">

                    {error || "Job not found"}

                    <button
                        onClick={() =>
                            navigate("/jobs")
                        }
                    >
                        Back to Jobs
                    </button>

                </div>

            </div>
        );

    }


    /* ================================
       JOB DATA
    ================================= */

    const company =
        job.companyDetails || {};

    const responsibilities =
        job.responsibilities || [];

    const preferredSkills =
        job.preferredSkills || [];

    const benefits =
        company.benefits || [];

    const companyLocations =
        company.locations || [];


    /* ================================
       PAGE
    ================================= */

    return (

        <div className="job-details-page">


            {/* ============================
                BACK
            ============================= */}

            <button
                className="job-back-button"
                onClick={() =>
                    navigate("/jobs")
                }
            >

                <FontAwesomeIcon
                    icon={faArrowLeft}
                />

                Back to Jobs

            </button>


            <div className="job-details-layout">


                {/* ========================
                    MAIN
                ======================== */}

                <main className="job-details-main">


                    {/* JOB HEADER */}

                    <div className="job-details-header">

                        <div className="job-company-icon">

                            {company.logo ? (

                                <img
                                    src={company.logo}
                                    alt={
                                        job.company
                                    }
                                />

                            ) : (

                                <FontAwesomeIcon
                                    icon={faBriefcase}
                                />

                            )}

                        </div>


                        <div>

                            <p className="job-details-label">
                                Career Opportunity
                            </p>

                            <h1>
                                {job.title}
                            </h1>

                            <p className="job-company-name">
                                {job.company}
                            </p>

                        </div>

                    </div>


                    {/* JOB META */}

                    <div className="job-details-meta">

                        <div>

                            <FontAwesomeIcon
                                icon={faLocationDot}
                            />

                            <span>
                                {job.location}
                            </span>

                        </div>


                        <div>

                            <FontAwesomeIcon
                                icon={
                                    faIndianRupeeSign
                                }
                            />

                            <span>
                                {job.package}
                            </span>

                        </div>


                        <div>

                            <FontAwesomeIcon
                                icon={
                                    faGraduationCap
                                }
                            />

                            <span>
                                {job.eligibility ||
                                    "Open to eligible candidates"}
                            </span>

                        </div>


                        {job.employmentType && (

                            <div>

                                <FontAwesomeIcon
                                    icon={
                                        faBriefcaseClock
                                    }
                                />

                                <span>
                                    {
                                        job.employmentType
                                    }
                                </span>

                            </div>

                        )}


                        {job.workMode && (

                            <div>

                                <FontAwesomeIcon
                                    icon={
                                        faLaptopHouse
                                    }
                                />

                                <span>
                                    {job.workMode}
                                </span>

                            </div>

                        )}

                    </div>


                    {/* ========================
                        DESCRIPTION
                    ========================= */}

                    <section className="job-details-section">

                        <h2>
                            Job Description
                        </h2>

                        <p>
                            {job.description}
                        </p>

                    </section>


                    {/* ========================
                        RESPONSIBILITIES
                    ========================= */}

                    {responsibilities.length >
                        0 && (

                        <section className="job-details-section">

                            <h2>
                                Responsibilities
                            </h2>


                            <ul className="job-detail-list">

                                {responsibilities.map(
                                    (
                                        responsibility,
                                        index
                                    ) => (

                                        <li
                                            key={index}
                                        >

                                            <FontAwesomeIcon
                                                icon={
                                                    faCheckCircle
                                                }
                                            />

                                            <span>
                                                {
                                                    responsibility
                                                }
                                            </span>

                                        </li>

                                    )
                                )}

                            </ul>

                        </section>

                    )}


                    {/* ========================
                        REQUIRED SKILLS
                    ========================= */}

                    <section className="job-details-section">

                        <h2>
                            Required Skills
                        </h2>


                        <div className="job-detail-skills">

                            {job.skills?.map(
                                (
                                    skill,
                                    index
                                ) => (

                                    <span
                                        key={index}
                                        className="job-detail-skill"
                                    >
                                        {skill}
                                    </span>

                                )
                            )}

                        </div>

                    </section>


                    {/* ========================
                        PREFERRED SKILLS
                    ========================= */}

                    {preferredSkills.length >
                        0 && (

                        <section className="job-details-section">

                            <h2>
                                Preferred Skills
                            </h2>


                            <div className="job-detail-skills">

                                {preferredSkills.map(
                                    (
                                        skill,
                                        index
                                    ) => (

                                        <span
                                            key={index}
                                            className="job-detail-skill preferred"
                                        >
                                            {skill}
                                        </span>

                                    )
                                )}

                            </div>

                        </section>

                    )}


                    {/* ========================
                        COMPANY DETAILS
                    ========================= */}

                    <section className="job-details-section company-details-section">

                        <div>

                            <p className="job-details-label">
                                Company
                            </p>

                            <h2>
                                About{" "}
                                {company.name ||
                                    job.company}
                            </h2>

                        </div>


                        {company.about && (

                            <p>
                                {company.about}
                            </p>

                        )}


                        <div className="company-info-grid">


                            {company.industry && (

                                <div className="company-info-item">

                                    <FontAwesomeIcon
                                        icon={
                                            faIndustry
                                        }
                                    />

                                    <div>

                                        <span>
                                            Industry
                                        </span>

                                        <strong>
                                            {
                                                company.industry
                                            }
                                        </strong>

                                    </div>

                                </div>

                            )}


                            {company.size && (

                                <div className="company-info-item">

                                    <FontAwesomeIcon
                                        icon={
                                            faUsers
                                        }
                                    />

                                    <div>

                                        <span>
                                            Company Size
                                        </span>

                                        <strong>
                                            {
                                                company.size
                                            }
                                        </strong>

                                    </div>

                                </div>

                            )}


                            {company.foundedYear && (

                                <div className="company-info-item">

                                    <FontAwesomeIcon
                                        icon={
                                            faCalendar
                                        }
                                    />

                                    <div>

                                        <span>
                                            Founded
                                        </span>

                                        <strong>
                                            {
                                                company.foundedYear
                                            }
                                        </strong>

                                    </div>

                                </div>

                            )}


                            {company.headquarters && (

                                <div className="company-info-item">

                                    <FontAwesomeIcon
                                        icon={faHouse}
                                    />

                                    <div>

                                        <span>
                                            Headquarters
                                        </span>

                                        <strong>
                                            {
                                                company.headquarters
                                            }
                                        </strong>

                                    </div>

                                </div>

                            )}

                        </div>


                        {company.website && (

                            <a
                                href={
                                    company.website
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="company-website-link"
                            >

                                <FontAwesomeIcon
                                    icon={faGlobe}
                                />

                                Visit company website

                            </a>

                        )}


                        {companyLocations.length >
                            0 && (

                            <div className="company-subsection">

                                <h3>
                                    Other Locations
                                </h3>

                                <div className="company-location-tags">

                                    {companyLocations.map(
                                        (
                                            location,
                                            index
                                        ) => (

                                            <span
                                                key={
                                                    index
                                                }
                                            >

                                                <FontAwesomeIcon
                                                    icon={
                                                        faLocationDot
                                                    }
                                                />

                                                {
                                                    location
                                                }

                                            </span>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {benefits.length >
                            0 && (

                            <div className="company-subsection">

                                <h3>
                                    Benefits & Perks
                                </h3>

                                <div className="job-detail-skills">

                                    {benefits.map(
                                        (
                                            benefit,
                                            index
                                        ) => (

                                            <span
                                                key={
                                                    index
                                                }
                                                className="job-detail-skill"
                                            >
                                                {
                                                    benefit
                                                }
                                            </span>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    </section>

                </main>


                {/* ========================
                    APPLY SIDEBAR
                ========================= */}

                <aside className="job-details-sidebar">

                    <div className="job-apply-card">

                        <h3>
                            Interested in this role?
                        </h3>

                        <p>
                            Review your profile,
                            resume and application
                            details before submitting.
                        </p>


                        <button
                            type="button"
                            className="job-apply-button job-details-apply-button"
                            onClick={
                                handleApplyClick
                            }
                        >

                            <FontAwesomeIcon
                                icon={
                                    faPaperPlane
                                }
                            />

                            Apply Now

                        </button>


                        <div className="job-apply-note">

                            <FontAwesomeIcon
                                icon={
                                    faCheckCircle
                                }
                            />

                            Your application status
                            can be tracked from
                            your dashboard.

                        </div>

                    </div>

                </aside>

            </div>


            {/* =================================================
                APPLICATION MODAL
            ================================================== */}

            {showApplyModal && (

                <ApplicationModal
                    job={job}
                    user={user}

                    onClose={() =>
                        setShowApplyModal(false)
                    }

                    onSuccess={(application) => {

                        console.log(
                            "Application submitted:",
                            application
                        );

                        setShowApplyModal(false);

                        navigate(
                            "/applications"
                        );

                    }}
                />

            )}

        </div>
    );
}

export default JobDetails;