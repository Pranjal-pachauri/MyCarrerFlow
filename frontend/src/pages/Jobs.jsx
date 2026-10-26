
import {
    useContext,
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faBriefcase,
    faLocationDot,
    faMagnifyingGlass,
    faArrowRight,
    faFilter,
    faRotateLeft,
    faIndianRupeeSign,
    faGraduationCap,
    faXmark,
    faCheckCircle,
    faChevronLeft,
    faChevronRight
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

function Jobs() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Search and filters
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [skill, setSkill] = useState("");

    const [locations, setLocations] = useState([]);
    const [skills, setSkills] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalJobs, setTotalJobs] = useState(0);

    const jobsPerPage = 10;

    // Load jobs for the selected page and filters
    const loadJobs = async (overrides = {}) => {
        const filters = {
            search,
            location,
            skill,
            page: currentPage,
            ...overrides
        };

        setLoading(true);
        setError("");

        try {
            const params = {
                page: filters.page,
                limit: jobsPerPage
            };

            if (filters.search.trim()) {
                params.search = filters.search.trim();
            }

            if (filters.location) {
                params.location = filters.location;
            }

            if (filters.skill) {
                params.skill = filters.skill;
            }

            const res = await api.get("/jobs", { params });

            const receivedJobs = Array.isArray(res.data)
                ? res.data
                : res.data.jobs || [];

            const pagination = res.data.pagination || {};

            setJobs(receivedJobs);
            setCurrentPage(Number(pagination.page) || filters.page);
            setTotalPages(Number(pagination.totalPages) || 0);
            setTotalJobs(Number(pagination.total) || 0);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load jobs"
            );

            setJobs([]);
            setTotalPages(0);
            setTotalJobs(0);
        } finally {
            setLoading(false);
        }
    };

    // Load available filter options
    const loadFilters = async () => {
        try {
            const res = await api.get("/jobs/filters");

            setLocations(res.data.locations || []);
            setSkills(res.data.skills || []);
        } catch (err) {
            console.error("Failed to load filters:", err);
        }
    };

    // Initial load
    useEffect(() => {
        loadJobs({ page: 1 });
        loadFilters();
        // Initial load only
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Search
    const handleSearch = (event) => {
        event.preventDefault();
        loadJobs({ page: 1 });
    };

    // Clear all filters
    const clearFilters = () => {
        setSearch("");
        setLocation("");
        setSkill("");
        setCurrentPage(1);

        loadJobs({
            search: "",
            location: "",
            skill: "",
            page: 1
        });
    };

    // Change page
    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > totalPages ||
            page === currentPage ||
            loading
        ) {
            return;
        }

        loadJobs({ page });
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // Apply to a job
    const applyJob = (jobId) => {
        setMessage("");
        setError("");

        if (!user) {
            navigate("/login", {
                state: {
                    from: `/jobs/${jobId}`,
                    applyJobId: jobId
                }
            });

            return;
        }

        navigate(`/jobs/${jobId}`, {
            state: {
                openApplicationModal: true
            }
        });
    };

    // View job details
    const viewJob = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    // Numbered page buttons
    const getPageNumbers = () => {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        start = Math.max(1, end - maxVisible + 1);

        const pages = [];

        for (let page = start; page <= end; page++) {
            pages.push(page);
        }

        return pages;
    };

    const firstJob = totalJobs === 0
        ? 0
        : (currentPage - 1) * jobsPerPage + 1;

    const lastJob = Math.min(
        currentPage * jobsPerPage,
        totalJobs
    );

    return (
        <div className="jobs-page-modern">
            <div className="jobs-container-modern">

                {/* PAGE HEADER */}
                <div className="jobs-page-header-modern">
                    <div>
                        <span className="jobs-eyebrow">
                            Career Opportunities
                        </span>

                        <h1>Find your next opportunity</h1>

                        <p>
                            Explore jobs and placement opportunities
                            that match your skills and career goals.
                        </p>
                    </div>

                    <div className="jobs-header-icon">
                        <FontAwesomeIcon icon={faBriefcase} />
                    </div>
                </div>

                {/* SEARCH */}
                <form
                    className="jobs-search-box"
                    onSubmit={handleSearch}
                >
                    <div className="jobs-search-input">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by job title, company, skill..."
                        />

                        {search && (
                            <button
                                type="button"
                                className="jobs-input-clear"
                                aria-label="Clear search text"
                                onClick={() => setSearch("")}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="jobs-search-button"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        Search
                    </button>
                </form>

                {/* FILTERS */}
                <div className="jobs-filter-bar">
                    <div className="jobs-filter-label">
                        <FontAwesomeIcon icon={faFilter} />
                        Filters
                    </div>

                    <select
                        value={location}
                        onChange={(e) => {
                            const value = e.target.value;
                            setLocation(value);
                            loadJobs({
                                location: value,
                                page: 1
                            });
                        }}
                    >
                        <option value="">All Locations</option>

                        {locations.map((item) => (
                            <option value={item} key={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <select
                        value={skill}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSkill(value);
                            loadJobs({
                                skill: value,
                                page: 1
                            });
                        }}
                    >
                        <option value="">All Skills</option>

                        {skills.map((item) => (
                            <option value={item} key={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    {(search || location || skill) && (
                        <button
                            type="button"
                            className="jobs-clear-filter"
                            onClick={clearFilters}
                        >
                            <FontAwesomeIcon icon={faRotateLeft} />
                            Clear
                        </button>
                    )}
                </div>

                {/* MESSAGES */}
                {message && (
                    <div className="jobs-message">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="jobs-error">{error}</div>
                )}

                {/* RESULTS COUNT */}
                {!loading && (
                    <div className="jobs-results-header">
                        <div>
                            <strong>{totalJobs}</strong>
                            <span>
                                {" "}
                                {totalJobs === 1
                                    ? "opportunity"
                                    : "opportunities"}
                            </span>
                        </div>

                        {totalJobs > 0 && (
                            <span className="jobs-range">
                                Showing {firstJob}–{lastJob} of {totalJobs}
                            </span>
                        )}
                    </div>
                )}

                {/* LOADING */}
                {loading ? (
                    <div className="jobs-loading">
                        <div className="jobs-loading-spinner" />
                        <span>Loading opportunities...</span>
                    </div>
                ) : jobs.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="jobs-empty">
                        <div className="jobs-empty-icon">
                            <FontAwesomeIcon icon={faBriefcase} />
                        </div>

                        <h2>No jobs found</h2>

                        <p>Try changing your search or filters.</p>

                        {(search || location || skill) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                            >
                                <FontAwesomeIcon icon={faRotateLeft} />
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* JOB LIST */}
                        <div className="jobs-list-modern">
                            {jobs.map((job) => (
                                <article
                                    className="job-card-modern"
                                    key={job._id}
                                >
                                    <div className="job-card-top">
                                        <div className="job-company-icon">
                                            <FontAwesomeIcon icon={faBriefcase} />
                                        </div>

                                        <div className="job-main-info">
                                            <h2>{job.title}</h2>
                                            <p className="job-company">
                                                {job.company}
                                            </p>
                                        </div>

                                        {job.package && (
                                            <div className="job-package">
                                                <FontAwesomeIcon
                                                    icon={faIndianRupeeSign}
                                                />
                                                {job.package}
                                            </div>
                                        )}
                                    </div>

                                    <div className="job-meta-modern">
                                        {job.location && (
                                            <span>
                                                <FontAwesomeIcon
                                                    icon={faLocationDot}
                                                />
                                                {job.location}
                                            </span>
                                        )}

                                        {job.eligibility && (
                                            <span>
                                                <FontAwesomeIcon
                                                    icon={faGraduationCap}
                                                />
                                                {job.eligibility}
                                            </span>
                                        )}
                                    </div>

                                    {job.description && (
                                        <p className="job-description-modern">
                                            {job.description}
                                        </p>
                                    )}

                                    {Array.isArray(job.skills) &&
                                        job.skills.length > 0 && (
                                            <div className="job-skills-modern">
                                                {job.skills.map((item, index) => (
                                                    <span
                                                        key={`${job._id}-${index}`}
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                    <div className="job-card-actions">
                                        <button
                                            type="button"
                                            className="job-view-button"
                                            onClick={() => viewJob(job._id)}
                                        >
                                            View Details
                                            <FontAwesomeIcon icon={faArrowRight} />
                                        </button>

                                        <button
                                            type="button"
                                            className="job-apply-button"
                                            onClick={() => applyJob(job._id)}
                                        >
                                            Apply Now
                                            <FontAwesomeIcon icon={faArrowRight} />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <nav
                                className="jobs-pagination"
                                aria-label="Jobs pagination"
                            >
                                <button
                                    type="button"
                                    className="jobs-page-button jobs-page-prev"
                                    disabled={currentPage === 1 || loading}
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                    <span>Previous</span>
                                </button>

                                <div className="jobs-page-numbers">
                                    {getPageNumbers()[0] > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                className="jobs-page-button"
                                                onClick={() => handlePageChange(1)}
                                            >
                                                1
                                            </button>

                                            {getPageNumbers()[0] > 2 && (
                                                <span className="jobs-page-dots">
                                                    …
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {getPageNumbers().map((page) => (
                                        <button
                                            type="button"
                                            key={page}
                                            className={`jobs-page-button ${
                                                currentPage === page
                                                    ? "active"
                                                    : ""
                                            }`}
                                            aria-current={
                                                currentPage === page
                                                    ? "page"
                                                    : undefined
                                            }
                                            onClick={() =>
                                                handlePageChange(page)
                                            }
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    {getPageNumbers().at(-1) < totalPages && (
                                        <>
                                            {getPageNumbers().at(-1) < totalPages - 1 && (
                                                <span className="jobs-page-dots">
                                                    …
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                className="jobs-page-button"
                                                onClick={() =>
                                                    handlePageChange(totalPages)
                                                }
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="jobs-page-button jobs-page-next"
                                    disabled={
                                        currentPage >= totalPages || loading
                                    }
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                >
                                    <span>Next</span>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </nav>
                        )}

                        {totalJobs > 0 && (
                            <p className="jobs-pagination-info">
                                Page {currentPage} of {totalPages}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Jobs;
