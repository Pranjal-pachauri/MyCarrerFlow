import {
    useContext,
    useEffect,
    useState
} from "react";

import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faBriefcase,
    faBuilding,
    faLocationDot,
    faMoneyBillWave,
    faUsers,
    faPen,
    faTrash,
    faPlus,
    faXmark,
    // faGraduationCap,
    faFilePdf,
    faExternalLink,
    faCheck,
    faUserTie,
    faCircleInfo,
    // faGlobe,
    faChevronDown,
    faChevronUp
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";


const emptyQuestion = () => ({
    question: "",
    type: "short_text",
    options: [],
    required: false
});


const emptyJobData = () => ({
    title: "",
    company: "",
    description: "",
    skills: "",
    preferredSkills: "",
    package: "",
    location: "",
    eligibility: "",

    employmentType: "Full Time",
    workMode: "On-site",

    responsibilities: "",

    companyDetails: {
        name: "",
        logo: "",
        website: "",
        industry: "",
        size: "",
        foundedYear: "",
        headquarters: "",
        about: "",
        locations: "",
        benefits: ""
    },

    applicationQuestions: []
});


function AdminDashboard() {

    const {
        user,
        logout
    } = useContext(AuthContext);


    const [applications, setApplications] =
        useState([]);

    const [jobs, setJobs] =
        useState([]);

    const [message, setMessage] =
        useState("");

    const [editingJob, setEditingJob] =
        useState(null);

    const [jobData, setJobData] =
        useState(emptyJobData());

    const [showCompanyDetails, setShowCompanyDetails] =
        useState(true);

    const [showQuestions, setShowQuestions] =
        useState(true);

    const [expandedApplication, setExpandedApplication] =
        useState(null);


    // =========================================
    // GET APPLICATIONS
    // =========================================

    const getApplications = async () => {

        try {

            const res =
                await api.get("/applications");

            setApplications(
                Array.isArray(res.data)
                    ? res.data
                    : res.data.applications || []
            );

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Failed to load applications"
            );
        }
    };


    // =========================================
    // GET JOBS
    // =========================================

    const getJobs = async () => {

        try {

            const res =
                await api.get("/jobs");

            setJobs(
                Array.isArray(res.data)
                    ? res.data
                    : res.data.jobs || []
            );

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Failed to load jobs"
            );
        }
    };


    useEffect(() => {

        const loadData = async () => {

            await Promise.all([
                getApplications(),
                getJobs()
            ]);

        };

        loadData();

    }, []);


    // =========================================
    // BASIC JOB INPUT
    // =========================================

    const handleJobChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setJobData(current => ({
            ...current,
            [name]: value
        }));
    };


    // =========================================
    // COMPANY INPUT
    // =========================================

    const handleCompanyChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setJobData(current => ({
            ...current,

            companyDetails: {
                ...current.companyDetails,
                [name]: value
            }
        }));
    };


    // =========================================
    // QUESTIONS
    // =========================================

    const addQuestion = () => {

        setJobData(current => ({
            ...current,

            applicationQuestions: [
                ...current.applicationQuestions,
                emptyQuestion()
            ]
        }));
    };


    const updateQuestion = (
        index,
        field,
        value
    ) => {

        setJobData(current => {

            const questions = [
                ...current.applicationQuestions
            ];

            questions[index] = {
                ...questions[index],
                [field]: value
            };

            return {
                ...current,
                applicationQuestions: questions
            };
        });
    };


    const removeQuestion = (index) => {

        setJobData(current => ({
            ...current,

            applicationQuestions:
                current.applicationQuestions.filter(
                    (_, questionIndex) =>
                        questionIndex !== index
                )
        }));
    };


    const updateQuestionOptions = (
        index,
        value
    ) => {

        updateQuestion(
            index,
            "options",
            value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean)
        );
    };


    // =========================================
    // RESET FORM
    // =========================================

    const resetJobForm = () => {

        setJobData(
            emptyJobData()
        );

        setEditingJob(null);
    };


    // =========================================
    // PREPARE JOB DATA
    // =========================================

    const prepareJobData = () => {

        const companyDetails =
            jobData.companyDetails || {};

        return {

            title:
                jobData.title.trim(),

            company:
                jobData.company.trim(),

            description:
                jobData.description.trim(),

            skills:
                jobData.skills
                    .split(",")
                    .map(skill => skill.trim())
                    .filter(Boolean),

            preferredSkills:
                jobData.preferredSkills
                    .split(",")
                    .map(skill => skill.trim())
                    .filter(Boolean),

            package:
                jobData.package.trim(),

            location:
                jobData.location.trim(),

            eligibility:
                jobData.eligibility.trim(),

            employmentType:
                jobData.employmentType,

            workMode:
                jobData.workMode,

            responsibilities:
                jobData.responsibilities
                    .split("\n")
                    .map(item => item.trim())
                    .filter(Boolean),

            companyDetails: {

                name:
                    companyDetails.name?.trim() ||
                    jobData.company.trim(),

                logo:
                    companyDetails.logo?.trim() || "",

                website:
                    companyDetails.website?.trim() || "",

                industry:
                    companyDetails.industry?.trim() || "",

                size:
                    companyDetails.size?.trim() || "",

                foundedYear:
                    companyDetails.foundedYear?.trim() || "",

                headquarters:
                    companyDetails.headquarters?.trim() || "",

                about:
                    companyDetails.about?.trim() || "",

                locations:
                    companyDetails.locations
                        ?.split(",")
                        .map(item => item.trim())
                        .filter(Boolean) || [],

                benefits:
                    companyDetails.benefits
                        ?.split("\n")
                        .map(item => item.trim())
                        .filter(Boolean) || []
            },

            applicationQuestions:
                jobData.applicationQuestions.map(
                    question => ({
                        question:
                            question.question.trim(),

                        type:
                            question.type,

                        options:
                            question.options || [],

                        required:
                            Boolean(question.required)
                    })
                )
        };
    };


    // =========================================
    // CREATE / UPDATE JOB
    // =========================================

    const saveJob = async (event) => {

        event.preventDefault();

        setMessage("");

        try {

            const data =
                prepareJobData();


            if (
                !data.title ||
                !data.company ||
                !data.description ||
                !data.package ||
                !data.location ||
                data.skills.length === 0
            ) {

                setMessage(
                    "Please complete all required job fields."
                );

                return;
            }


            if (editingJob) {

                await api.put(
                    `/jobs/${editingJob._id}`,
                    data
                );

                setMessage(
                    "Job updated successfully."
                );

            } else {

                await api.post(
                    "/jobs",
                    data
                );

                setMessage(
                    "Job created successfully."
                );
            }


            resetJobForm();

            await getJobs();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Failed to save job."
            );
        }
    };


    // =========================================
    // EDIT JOB
    // =========================================

    const editJob = (job) => {

        const company =
            job.companyDetails || {};

        setEditingJob(job);


        setJobData({

            title:
                job.title || "",

            company:
                job.company || "",

            description:
                job.description || "",

            skills:
                Array.isArray(job.skills)
                    ? job.skills.join(", ")
                    : "",

            preferredSkills:
                Array.isArray(job.preferredSkills)
                    ? job.preferredSkills.join(", ")
                    : "",

            package:
                job.package || "",

            location:
                job.location || "",

            eligibility:
                job.eligibility || "",

            employmentType:
                job.employmentType ||
                "Full Time",

            workMode:
                job.workMode ||
                "On-site",

            responsibilities:
                Array.isArray(
                    job.responsibilities
                )
                    ? job.responsibilities.join("\n")
                    : "",

            companyDetails: {

                name:
                    company.name ||
                    job.company ||
                    "",

                logo:
                    company.logo || "",

                website:
                    company.website || "",

                industry:
                    company.industry || "",

                size:
                    company.size || "",

                foundedYear:
                    company.foundedYear || "",

                headquarters:
                    company.headquarters || "",

                about:
                    company.about || "",

                locations:
                    Array.isArray(
                        company.locations
                    )
                        ? company.locations.join(", ")
                        : "",

                benefits:
                    Array.isArray(
                        company.benefits
                    )
                        ? company.benefits.join("\n")
                        : ""
            },

            applicationQuestions:
                Array.isArray(
                    job.applicationQuestions
                )
                    ? job.applicationQuestions.map(
                        question => ({
                            question:
                                question.question || "",

                            type:
                                question.type ||
                                "short_text",

                            options:
                                question.options || [],

                            required:
                                Boolean(
                                    question.required
                                )
                        })
                    )
                    : []
        });


        setShowCompanyDetails(true);
        setShowQuestions(true);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // =========================================
    // DELETE JOB
    // =========================================

    const deleteJob = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this job?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            const res =
                await api.delete(
                    `/jobs/${id}`
                );

            setMessage(
                res.data.message ||
                "Job deleted successfully."
            );

            await getJobs();

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Failed to delete job."
            );
        }
    };


    // =========================================
    // UPDATE APPLICATION STATUS
    // =========================================

    const updateStatus = async (
        id,
        status
    ) => {

        try {

            const res =
                await api.put(
                    `/applications/${id}`,
                    {
                        status
                    }
                );

            setMessage(
                res.data.message ||
                "Application status updated."
            );

            await getApplications();

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Failed to update status."
            );
        }
    };


    // =========================================
    // APPLICATION TOGGLE
    // =========================================

    const toggleApplication = (id) => {

        setExpandedApplication(
            current =>
                current === id
                    ? null
                    : id
        );
    };


    return (

        <div className="admin-page">

            {/* =================================
                HEADER
            ================================= */}

            <div className="admin-header">

                <div>

                    <p className="admin-eyebrow">
                        MyCareerFlow
                    </p>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p className="page-subtitle">
                        Manage jobs, companies and
                        student applications.
                    </p>

                </div>

                <div className="admin-badge">
                    <FontAwesomeIcon
                        icon={faUserTie}
                    />

                    Administrator
                </div>

            </div>


            {/* =================================
                ADMIN INFO
            ================================= */}

            <div className="dashboard-card">

                <div className="admin-welcome">

                    <div>

                        <h2>
                            Welcome, {user?.name}
                        </h2>

                        <p>
                            Manage your career opportunities
                            and review candidates from one place.
                        </p>

                    </div>

                    <FontAwesomeIcon
                        icon={faBuilding}
                        className="admin-welcome-icon"
                    />

                </div>

                <div className="admin-user-meta">

                    <span>
                        <strong>Email:</strong>{" "}
                        {user?.email}
                    </span>

                    <span>
                        <strong>Role:</strong>{" "}
                        {user?.role}
                    </span>

                </div>

            </div>


            {/* =================================
                STATS
            ================================= */}

            <div className="admin-stats">

                <div className="stat-card">

                    <span className="stat-icon">
                        <FontAwesomeIcon
                            icon={faBriefcase}
                        />
                    </span>

                    <div>

                        <h2>
                            {jobs.length}
                        </h2>

                        <p>
                            Active Jobs
                        </p>

                    </div>

                </div>


                <div className="stat-card">

                    <span className="stat-icon">
                        <FontAwesomeIcon
                            icon={faUsers}
                        />
                    </span>

                    <div>

                        <h2>
                            {applications.length}
                        </h2>

                        <p>
                            Applications
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================
                MESSAGE
            ================================= */}

            {message && (

                <div className="message-box">

                    <FontAwesomeIcon
                        icon={faCircleInfo}
                    />

                    {message}

                </div>

            )}


            {/* =================================
                CREATE / EDIT JOB
            ================================= */}

            <div className="admin-section">

                <div className="section-title">

                    <div>

                        <h2>
                            {editingJob
                                ? "Edit Job"
                                : "Create New Job"}
                        </h2>

                        <p>
                            Add complete job and company
                            information for candidates.
                        </p>

                    </div>

                </div>


                <form
                    onSubmit={saveJob}
                    className="job-form"
                >

                    {/* =============================
                        JOB BASICS
                    ============================= */}

                    <div className="admin-form-section">

                        <div className="admin-form-section-title">

                            <FontAwesomeIcon
                                icon={faBriefcase}
                            />

                            <div>

                                <h3>
                                    Job Information
                                </h3>

                                <p>
                                    Basic information about
                                    the opportunity.
                                </p>

                            </div>

                        </div>


                        <div className="form-grid">

                            <input
                                type="text"
                                name="title"
                                placeholder="Job Title *"
                                value={jobData.title}
                                onChange={handleJobChange}
                                required
                            />


                            <input
                                type="text"
                                name="company"
                                placeholder="Company Name *"
                                value={jobData.company}
                                onChange={handleJobChange}
                                required
                            />


                            <input
                                type="text"
                                name="package"
                                placeholder="Package e.g. 8 LPA *"
                                value={jobData.package}
                                onChange={handleJobChange}
                                required
                            />


                            <input
                                type="text"
                                name="location"
                                placeholder="Primary Location *"
                                value={jobData.location}
                                onChange={handleJobChange}
                                required
                            />


                            <select
                                name="employmentType"
                                value={jobData.employmentType}
                                onChange={handleJobChange}
                            >

                                <option value="Full Time">
                                    Full Time
                                </option>

                                <option value="Part Time">
                                    Part Time
                                </option>

                                <option value="Internship">
                                    Internship
                                </option>

                                <option value="Contract">
                                    Contract
                                </option>

                            </select>


                            <select
                                name="workMode"
                                value={jobData.workMode}
                                onChange={handleJobChange}
                            >

                                <option value="On-site">
                                    On-site
                                </option>

                                <option value="Hybrid">
                                    Hybrid
                                </option>

                                <option value="Remote">
                                    Remote
                                </option>

                            </select>

                        </div>


                        <textarea
                            name="description"
                            placeholder="Job Description *"
                            value={jobData.description}
                            onChange={handleJobChange}
                            required
                        />


                        <textarea
                            name="responsibilities"
                            placeholder={
                                "Responsibilities — one per line\n" +
                                "Build REST APIs\n" +
                                "Work with frontend developers\n" +
                                "Write clean production code"
                            }
                            value={
                                jobData.responsibilities
                            }
                            onChange={handleJobChange}
                            rows="5"
                        />


                        <div className="form-grid">

                            <input
                                type="text"
                                name="skills"
                                placeholder="Required Skills * — Java, SQL, React"
                                value={jobData.skills}
                                onChange={handleJobChange}
                                required
                            />


                            <input
                                type="text"
                                name="preferredSkills"
                                placeholder="Preferred Skills — AWS, Docker"
                                value={
                                    jobData.preferredSkills
                                }
                                onChange={handleJobChange}
                            />

                        </div>


                        <input
                            type="text"
                            name="eligibility"
                            placeholder="Eligibility — B.Tech CSE, 7 CGPA, etc."
                            value={jobData.eligibility}
                            onChange={handleJobChange}
                        />

                    </div>


                    {/* =============================
                        COMPANY DETAILS
                    ============================= */}

                    <div className="admin-form-section">

                        <button
                            type="button"
                            className="admin-collapse-button"
                            onClick={() =>
                                setShowCompanyDetails(
                                    current => !current
                                )
                            }
                        >

                            <div className="admin-form-section-title">

                                <FontAwesomeIcon
                                    icon={faBuilding}
                                />

                                <div>

                                    <h3>
                                        Company Details
                                    </h3>

                                    <p>
                                        Give candidates complete
                                        company information.
                                    </p>

                                </div>

                            </div>

                            <FontAwesomeIcon
                                icon={
                                    showCompanyDetails
                                        ? faChevronUp
                                        : faChevronDown
                                }
                            />

                        </button>


                        {showCompanyDetails && (

                            <div className="admin-form-section-content">

                                <div className="form-grid">

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Company Display Name"
                                        value={
                                            jobData
                                                .companyDetails
                                                .name
                                        }
                                        onChange={
                                            handleCompanyChange
                                        }
                                    />


                                    <input
                                        type="text"
                                        name="logo"
                                        placeholder="Company Logo URL"
                                        value={
                                            jobData
                                                .companyDetails
                                                .logo
                                        }
                                        onChange={
                                            handleCompanyChange
                                        }
                                    />


                                    <input
                                        type="url"
                                        name="website"
                                        placeholder="Company Website"
                                        value={
                                            jobData
                                                .companyDetails
                                                .website
                                        }
                                        onChange={
                                            handleCompanyChange
                                        }
                                    />


                                    <input
                                        type="text"
                                        name="industry"
                                        placeholder="Industry — Technology"
                                        value={
                                            jobData
                                                .companyDetails
                                                .industry
                                        }
                                        onChange={
                                            handleCompanyChange
                                        }
                                    />


                                    <input
                                        type="text"
                                        name="size"
                                        placeholder="Company Size — 1,000–5,000"
                                        value={
                                            jobData
                                                .companyDetails
                                                .size
                                        }
                                        onChange={
                                            handleCompanyChange
                                        }
                                    />


                                    <input
                                        type="text"
                                        name="foundedYear"
                                        placeholder="Founded Year"
                                        value={
                                            jobData
                                                .companyDetails
                                                .foundedYear
                                        }
                                        onChange={
                                            handleCompanyChange
                                        }
                                    />


                                    <input
                                        type="text"
                                        name="headquarters"
                                        placeholder="Headquarters"
                                        value={
                                            jobData
                                                .companyDetails
                                                .headquarters
                                        }
                                        onChange={
                                            handleCompanyChange
                                        }
                                    />


                                    <input
                                        type="text"
                                        name="locations"
                                        placeholder="Office Locations — Delhi, Bangalore, Pune"
                                        value={
                                            jobData
                                                .companyDetails
                                                .locations
                                        }
                                        onChange={
                                            handleCompanyChange
                                        }
                                    />

                                </div>


                                <textarea
                                    name="about"
                                    placeholder="About the company"
                                    value={
                                        jobData
                                            .companyDetails
                                            .about
                                    }
                                    onChange={
                                        handleCompanyChange
                                    }
                                    rows="5"
                                />


                                <textarea
                                    name="benefits"
                                    placeholder={
                                        "Benefits — one per line\n" +
                                        "Health insurance\n" +
                                        "Learning budget\n" +
                                        "Flexible work"
                                    }
                                    value={
                                        jobData
                                            .companyDetails
                                            .benefits
                                    }
                                    onChange={
                                        handleCompanyChange
                                    }
                                    rows="4"
                                />

                            </div>

                        )}

                    </div>


                    {/* =============================
                        SCREENING QUESTIONS
                    ============================= */}

                    <div className="admin-form-section">

                        <button
                            type="button"
                            className="admin-collapse-button"
                            onClick={() =>
                                setShowQuestions(
                                    current => !current
                                )
                            }
                        >

                            <div className="admin-form-section-title">

                                <FontAwesomeIcon
                                    icon={faCircleInfo}
                                />

                                <div>

                                    <h3>
                                        Screening Questions
                                    </h3>

                                    <p>
                                        Ask applicants about
                                        job-related qualifications.
                                    </p>

                                </div>

                            </div>

                            <FontAwesomeIcon
                                icon={
                                    showQuestions
                                        ? faChevronUp
                                        : faChevronDown
                                }
                            />

                        </button>


                        {showQuestions && (

                            <div className="admin-form-section-content">

                                {jobData.applicationQuestions.length === 0 && (

                                    <div className="admin-empty-inline">

                                        <p>
                                            No screening questions
                                            added yet.
                                        </p>

                                        <span>
                                            Add questions when you need
                                            extra information from applicants.
                                        </span>

                                    </div>

                                )}


                                {jobData.applicationQuestions.map(
                                    (question, index) => (

                                        <div
                                            key={index}
                                            className="screening-question-editor"
                                        >

                                            <div className="screening-question-header">

                                                <strong>
                                                    Question {index + 1}
                                                </strong>

                                                <button
                                                    type="button"
                                                    className="remove-question-btn"
                                                    onClick={() =>
                                                        removeQuestion(
                                                            index
                                                        )
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faXmark}
                                                    />
                                                </button>

                                            </div>


                                            <input
                                                type="text"
                                                placeholder="Example: Are you willing to work from Bangalore?"
                                                value={
                                                    question.question
                                                }
                                                onChange={(event) =>
                                                    updateQuestion(
                                                        index,
                                                        "question",
                                                        event.target.value
                                                    )
                                                }
                                            />


                                            <div className="screening-question-grid">

                                                <select
                                                    value={
                                                        question.type
                                                    }
                                                    onChange={(event) =>
                                                        updateQuestion(
                                                            index,
                                                            "type",
                                                            event.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="short_text">
                                                        Short Answer
                                                    </option>

                                                    <option value="yes_no">
                                                        Yes / No
                                                    </option>

                                                    <option value="multiple_choice">
                                                        Multiple Choice
                                                    </option>

                                                </select>


                                                {question.type ===
                                                    "multiple_choice" && (

                                                    <input
                                                        type="text"
                                                        placeholder="Options — Yes, No, Maybe"
                                                        value={
                                                            question.options.join(
                                                                ", "
                                                            )
                                                        }
                                                        onChange={(event) =>
                                                            updateQuestionOptions(
                                                                index,
                                                                event.target.value
                                                            )
                                                        }
                                                    />

                                                )}

                                            </div>


                                            <label className="screening-required-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        question.required
                                                    }
                                                    onChange={(event) =>
                                                        updateQuestion(
                                                            index,
                                                            "required",
                                                            event.target.checked
                                                        )
                                                    }
                                                />

                                                Required question

                                            </label>

                                        </div>

                                    )
                                )}


                                <button
                                    type="button"
                                    className="add-question-btn"
                                    onClick={addQuestion}
                                >

                                    <FontAwesomeIcon
                                        icon={faPlus}
                                    />

                                    Add Screening Question

                                </button>

                            </div>

                        )}

                    </div>


                    {/* =============================
                        FORM ACTIONS
                    ============================= */}

                    <div className="form-actions">

                        <button
                            type="submit"
                        >

                            <FontAwesomeIcon
                                icon={
                                    editingJob
                                        ? faCheck
                                        : faPlus
                                }
                            />

                            {editingJob
                                ? "Update Job"
                                : "Create Job"}

                        </button>


                        {editingJob && (

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={
                                    resetJobForm
                                }
                            >

                                <FontAwesomeIcon
                                    icon={faXmark}
                                />

                                Cancel

                            </button>

                        )}

                    </div>

                </form>

            </div>


            {/* =================================
                MANAGE JOBS
            ================================= */}

            <div className="admin-section">

                <div className="section-title">

                    <div>

                        <h2>
                            Manage Jobs
                        </h2>

                        <p>
                            Create, edit or remove
                            placement opportunities.
                        </p>

                    </div>

                </div>


                {jobs.length === 0 ? (

                    <div className="empty-box">

                        <h3>
                            No jobs found
                        </h3>

                        <p>
                            Create your first job above.
                        </p>

                    </div>

                ) : (

                    <div className="admin-job-list">

                        {jobs.map(job => (

                            <div
                                key={job._id}
                                className="admin-job-card"
                            >

                                <div>

                                    <div className="admin-job-title-row">

                                        <h3>
                                            {job.title}
                                        </h3>

                                        {job.companyDetails?.industry && (

                                            <span className="admin-job-industry">
                                                {
                                                    job.companyDetails.industry
                                                }
                                            </span>

                                        )}

                                    </div>


                                    <p className="company-name">

                                        <FontAwesomeIcon
                                            icon={faBuilding}
                                        />

                                        {" "}
                                        {job.company}

                                    </p>


                                    <div className="job-info">

                                        <span>

                                            <FontAwesomeIcon
                                                icon={faLocationDot}
                                            />

                                            {" "}
                                            {job.location}

                                        </span>

                                        <span>

                                            <FontAwesomeIcon
                                                icon={faMoneyBillWave}
                                            />

                                            {" "}
                                            {job.package}

                                        </span>

                                        <span>

                                            <FontAwesomeIcon
                                                icon={faBriefcase}
                                            />

                                            {" "}
                                            {job.employmentType ||
                                                "Full Time"}

                                        </span>

                                    </div>

                                </div>


                                <div className="admin-job-actions">

                                    <button
                                        onClick={() =>
                                            editJob(job)
                                        }
                                    >

                                        <FontAwesomeIcon
                                            icon={faPen}
                                        />

                                        Edit

                                    </button>


                                    <button
                                        className="delete-btn"
                                        onClick={() =>
                                            deleteJob(
                                                job._id
                                            )
                                        }
                                    >

                                        <FontAwesomeIcon
                                            icon={faTrash}
                                        />

                                        Delete

                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* =================================
                APPLICATIONS
            ================================= */}

            <div className="admin-section">

                <div className="section-title">

                    <div>

                        <h2>
                            Student Applications
                        </h2>

                        <p>
                            Review candidates, resumes,
                            profile information and answers.
                        </p>

                    </div>

                </div>


                {applications.length === 0 ? (

                    <div className="empty-box">

                        <h3>
                            No applications found
                        </h3>

                        <p>
                            Applications from students
                            will appear here.
                        </p>

                    </div>

                ) : (

                    applications.map(application => {

                        const snapshot =
                            application.applicantSnapshot ||
                            {};

                        const isExpanded =
                            expandedApplication ===
                            application._id;


                        return (

                            <div
                                key={application._id}
                                className="admin-application-card"
                            >

                                <div
                                    className="admin-application-summary"
                                    onClick={() =>
                                        toggleApplication(
                                            application._id
                                        )
                                    }
                                >

                                    <div className="admin-applicant-info">

                                        <div className="admin-applicant-avatar">

                                            <FontAwesomeIcon
                                                icon={faUserTie}
                                            />

                                        </div>


                                        <div>

                                            <h3>
                                                {
                                                    snapshot.name ||
                                                    application.student?.name ||
                                                    "Applicant"
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    snapshot.email ||
                                                    application.student?.email
                                                }
                                            </p>

                                            <span>
                                                {
                                                    application.job?.title
                                                }
                                            </span>

                                        </div>

                                    </div>


                                    <div className="admin-application-summary-right">

                                        <span
                                            className={
                                                `status-badge status-${application.status.toLowerCase()}`
                                            }
                                        >
                                            {application.status}
                                        </span>


                                        <FontAwesomeIcon
                                            icon={
                                                isExpanded
                                                    ? faChevronUp
                                                    : faChevronDown
                                            }
                                        />

                                    </div>

                                </div>


                                {isExpanded && (

                                    <div className="admin-application-details">

                                        {/* =====================
                                            BASIC DETAILS
                                        ===================== */}

                                        <div className="admin-application-block">

                                            <h4>
                                                Applicant Details
                                            </h4>

                                            <div className="admin-applicant-grid">

                                                <div>
                                                    <span>
                                                        Name
                                                    </span>

                                                    <strong>
                                                        {
                                                            snapshot.name ||
                                                            application.student?.name ||
                                                            "—"
                                                        }
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        Email
                                                    </span>

                                                    <strong>
                                                        {
                                                            snapshot.email ||
                                                            application.student?.email ||
                                                            "—"
                                                        }
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        Phone
                                                    </span>

                                                    <strong>
                                                        {
                                                            snapshot.phone ||
                                                            "—"
                                                        }
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        Location
                                                    </span>

                                                    <strong>
                                                        {
                                                            snapshot.city
                                                                ? `${snapshot.city}${snapshot.state
                                                                    ? `, ${snapshot.state}`
                                                                    : ""
                                                                }`
                                                                : "—"
                                                        }
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>


                                        {/* =====================
                                            SKILLS
                                        ===================== */}

                                        <div className="admin-application-block">

                                            <h4>
                                                Skills
                                            </h4>

                                            <div className="admin-skill-tags">

                                                {snapshot.skills?.length
                                                    ? snapshot.skills.map(
                                                        skill => (
                                                            <span
                                                                key={skill}
                                                            >
                                                                {skill}
                                                            </span>
                                                        )
                                                    )
                                                    : (
                                                        <span>
                                                            No skills provided
                                                        </span>
                                                    )}

                                            </div>

                                        </div>


                                        {/* =====================
                                            SOCIAL
                                        ===================== */}

                                        <div className="admin-application-block">

                                            <h4>
                                                Profiles
                                            </h4>

                                            <div className="admin-profile-links">

                                                {snapshot.linkedin && (

                                                    <a
                                                        href={
                                                            snapshot.linkedin
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        LinkedIn
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faExternalLink
                                                            }
                                                        />
                                                    </a>

                                                )}


                                                {snapshot.github && (

                                                    <a
                                                        href={
                                                            snapshot.github
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        GitHub
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faExternalLink
                                                            }
                                                        />
                                                    </a>

                                                )}


                                                {snapshot.portfolio && (

                                                    <a
                                                        href={
                                                            snapshot.portfolio
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Portfolio
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faExternalLink
                                                            }
                                                        />
                                                    </a>

                                                )}

                                            </div>

                                        </div>


                                        {/* =====================
                                            RESUME
                                        ===================== */}

                                        <div className="admin-application-block">

                                            <h4>
                                                Submitted Resume
                                            </h4>


                                            {application.submittedResume ? (

                                                <a
                                                    href={
                                                        `http://localhost:5000/${application.submittedResume}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="admin-resume-link"
                                                >

                                                    <FontAwesomeIcon
                                                        icon={faFilePdf}
                                                    />

                                                    View submitted resume

                                                    <FontAwesomeIcon
                                                        icon={faExternalLink}
                                                    />

                                                </a>

                                            ) : (

                                                <p>
                                                    No resume submitted.
                                                </p>

                                            )}

                                        </div>


                                        {/* =====================
                                            QUESTIONS
                                        ===================== */}

                                        {application.screeningAnswers?.length > 0 && (

                                            <div className="admin-application-block">

                                                <h4>
                                                    Screening Answers
                                                </h4>


                                                <div className="admin-screening-answers">

                                                    {application.screeningAnswers.map(
                                                        (item, index) => (

                                                            <div
                                                                key={
                                                                    item.questionId ||
                                                                    index
                                                                }
                                                            >

                                                                <strong>
                                                                    {
                                                                        item.question
                                                                    }
                                                                </strong>

                                                                <p>
                                                                    {
                                                                        item.answer ||
                                                                        "No answer"
                                                                    }
                                                                </p>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        )}


                                        {/* =====================
                                            APPLICATION META
                                        ===================== */}

                                        <div className="admin-application-meta">

                                            <span>
                                                Applied on{" "}
                                                {application.createdAt
                                                    ? new Date(
                                                        application.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                    : "—"}
                                            </span>


                                            {application.withdrawnAt && (

                                                <span>
                                                    Withdrawn on{" "}
                                                    {new Date(
                                                        application.withdrawnAt
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )}
                                                </span>

                                            )}

                                        </div>


                                        {/* =====================
                                            STATUS ACTIONS
                                        ===================== */}

                                        <div className="application-actions">

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        application._id,
                                                        "Shortlisted"
                                                    )
                                                }
                                                disabled={
                                                    application.status ===
                                                    "Withdrawn"
                                                }
                                            >
                                                Shortlist
                                            </button>


                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        application._id,
                                                        "Selected"
                                                    )
                                                }
                                                disabled={
                                                    application.status ===
                                                    "Withdrawn"
                                                }
                                            >
                                                Select
                                            </button>


                                            <button
                                                className="reject-btn"
                                                onClick={() =>
                                                    updateStatus(
                                                        application._id,
                                                        "Rejected"
                                                    )
                                                }
                                                disabled={
                                                    application.status ===
                                                    "Withdrawn"
                                                }
                                            >
                                                Reject
                                            </button>

                                        </div>

                                    </div>

                                )}

                            </div>

                        );

                    })

                )}

            </div>


            {/* =================================
                FOOTER
            ================================= */}

            <div className="admin-footer">

                <Link to="/jobs">

                    <button>
                        View Public Jobs
                    </button>

                </Link>


                <button
                    className="logout-dashboard-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>

        </div>
    );
}


export default AdminDashboard;