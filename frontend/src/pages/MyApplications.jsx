import {
    useEffect,
    useState
} from "react";



import {
    useNavigate
} from "react-router-dom";



import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



import {
    faBriefcase,
    faLocationDot,
    faIndianRupeeSign,
    faCalendarDays,
    faArrowRight,
    faFileCircleCheck,
    faRotateLeft
} from "@fortawesome/free-solid-svg-icons";



import api from "../api/axios";



function Applications() {



    const navigate = useNavigate();



    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [withdrawingId, setWithdrawingId] = useState(null);





    // ==========================================
    // LOAD MY APPLICATIONS
    // ==========================================

    useEffect(() => {



        const loadApplications = async () => {



            try {



                setLoading(true);

                setError("");



                const res =
                    await api.get("/applications/my");



                setApplications(

                    Array.isArray(res.data)

                        ? res.data

                        : res.data.applications || []

                );



            } catch (error) {



                console.error(error);



                setError(

                    error.response?.data?.message ||

                    "Failed to load applications"

                );



            } finally {



                setLoading(false);

            }

        };



        loadApplications();



    }, []);





    // ==========================================
    // GET STATUS CLASS
    // ==========================================

    const getStatusClass = (status) => {



        switch (status) {



            case "Shortlisted":

                return "application-status shortlisted";



            case "Selected":

                return "application-status selected";



            case "Rejected":

                return "application-status rejected";



            case "Withdrawn":

                return "application-status withdrawn";



            default:

                return "application-status applied";

        }

    };





    // ==========================================
    // WITHDRAW APPLICATION
    // ==========================================

    const withdrawApplication = async (
        applicationId
    ) => {



        const confirmed = window.confirm(

            "Are you sure you want to withdraw this application?"

        );



        if (!confirmed) {

            return;

        }



        try {



            setWithdrawingId(applicationId);

            setError("");

            setMessage("");



            const res =

                await api.patch(

                    `/applications/${applicationId}/withdraw`

                );



            setMessage(

                res.data.message ||

                "Application withdrawn successfully."

            );



            // Update the application immediately
            // without reloading the entire page

            setApplications((current) =>

                current.map((application) =>

                    application._id === applicationId

                        ? {

                              ...application,

                              status: "Withdrawn",

                              withdrawnAt:

                                  res.data.application
                                      ?.withdrawnAt ||

                                  new Date().toISOString()

                          }

                        : application

                )

            );



        } catch (error) {



            console.error(error);



            setError(

                error.response?.data?.message ||

                "Failed to withdraw application"

            );



        } finally {



            setWithdrawingId(null);

        }

    };





    // ==========================================
    // LOADING STATE
    // ==========================================

    if (loading) {



        return (

            <div className="applications-page">



                <div className="applications-state">

                    Loading applications...

                </div>



            </div>

        );

    }





    return (



        <div className="applications-page">



            {/* ==================================
                HEADER
            ================================== */}

            <div className="applications-header">



                <div>



                    <p className="applications-eyebrow">

                        APPLICATION TRACKER

                    </p>



                    <h1>

                        My Applications

                    </h1>



                    <p>

                        Track the jobs you have applied for

                        and monitor your application status.

                    </p>



                </div>



                <div className="applications-header-icon">



                    <FontAwesomeIcon

                        icon={faFileCircleCheck}

                    />



                </div>



            </div>





            {/* ==================================
                SUCCESS MESSAGE
            ================================== */}

            {message && (



                <div className="applications-message">

                    {message}

                </div>



            )}





            {/* ==================================
                ERROR MESSAGE
            ================================== */}

            {error && (



                <div className="applications-error">

                    {error}

                </div>



            )}





            {/* ==================================
                EMPTY STATE
            ================================== */}

            {!error &&

                applications.length === 0 && (



                    <div className="applications-empty">



                        <FontAwesomeIcon

                            icon={faBriefcase}

                        />



                        <h2>

                            No applications yet

                        </h2>



                        <p>

                            Explore available opportunities

                            and apply for your first job.

                        </p>



                        <button

                            type="button"

                            onClick={() =>

                                navigate("/jobs")

                            }

                        >

                            Explore Jobs

                        </button>



                    </div>

                )}





            {/* ==================================
                APPLICATION LIST
            ================================== */}

            {applications.length > 0 && (



                <div className="applications-list">



                    {applications.map(

                        (application) => {



                            const job =

                                application.job;



                            const isWithdrawn =

                                application.status ===

                                "Withdrawn";



                            return (



                                <div

                                    className="application-card"

                                    key={

                                        application._id

                                    }

                                >



                                    {/* ==========================
                                        COMPANY ICON
                                    ========================== */}

                                    <div className="application-company-icon">



                                        <FontAwesomeIcon

                                            icon={

                                                faBriefcase

                                            }

                                        />



                                    </div>





                                    {/* ==========================
                                        APPLICATION MAIN
                                    ========================== */}

                                    <div className="application-main">



                                        <div className="application-top">



                                            <div>



                                                <h2>

                                                    {job?.title ||

                                                        "Job Position"}

                                                </h2>



                                                <p>

                                                    {job?.company ||

                                                        "Company"}

                                                </p>



                                            </div>





                                            <span

                                                className={

                                                    getStatusClass(

                                                        application.status

                                                    )

                                                }

                                            >

                                                {application.status}

                                            </span>



                                        </div>





                                        {/* ======================
                                            META INFORMATION
                                        ====================== */}

                                        <div className="application-meta">



                                            <span>



                                                <FontAwesomeIcon

                                                    icon={

                                                        faLocationDot

                                                    }

                                                />



                                                {job?.location ||

                                                    "Not specified"}



                                            </span>





                                            <span>



                                                <FontAwesomeIcon

                                                    icon={

                                                        faIndianRupeeSign

                                                    }

                                                />



                                                {job?.package ||

                                                    "Not specified"}



                                            </span>





                                            <span>



                                                <FontAwesomeIcon

                                                    icon={

                                                        faCalendarDays

                                                    }

                                                />



                                                Applied{" "}



                                                {application.createdAt

                                                    ? new Date(

                                                          application.createdAt

                                                      ).toLocaleDateString(

                                                          "en-IN"

                                                      )

                                                    : "Date unavailable"}



                                            </span>



                                        </div>





                                        {/* ======================
                                            SKILLS
                                        ====================== */}

                                        {job?.skills?.length >

                                            0 && (



                                                <div className="application-skills">



                                                    {job.skills.map(

                                                        (

                                                            skill,

                                                            index

                                                        ) => (



                                                            <span

                                                                key={

                                                                    index

                                                                }

                                                            >

                                                                {skill}

                                                            </span>



                                                        )

                                                    )}



                                                </div>



                                            )}



                                    </div>





                                    {/* ==========================
                                        ACTIONS
                                    ========================== */}

                                    <div className="application-actions">



                                        {/* VIEW JOB */}

                                        <button

                                            type="button"

                                            className="application-view-button"

                                            onClick={() =>

                                                navigate(

                                                    `/jobs/${job?._id}`

                                                )

                                            }

                                        >



                                            View Job



                                            <FontAwesomeIcon

                                                icon={

                                                    faArrowRight

                                                }

                                            />



                                        </button>





                                        {/* WITHDRAW */}

                                        {application.status ===

                                            "Applied" && (



                                            <button

                                                type="button"

                                                className="withdraw-application-btn"

                                                onClick={() =>

                                                    withdrawApplication(

                                                        application._id

                                                    )

                                                }

                                                disabled={

                                                    withdrawingId ===

                                                    application._id

                                                }

                                            >



                                                <FontAwesomeIcon

                                                    icon={

                                                        faRotateLeft

                                                    }

                                                />



                                                {withdrawingId ===

                                                application._id

                                                    ? "Withdrawing..."

                                                    : "Withdraw Application"}



                                            </button>



                                        )}





                                        {/* WITHDRAWN STATE */}

                                        {isWithdrawn && (



                                            <span className="withdrawn-label">

                                                Application withdrawn

                                            </span>



                                        )}



                                    </div>



                                </div>



                            );

                        }

                    )}



                </div>

            )}



        </div>

    );

}



export default Applications;