
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faXmark,
    faFilePdf,
    faUser,
    faCheck,
    faPaperPlane,
    faUpload
} from "@fortawesome/free-solid-svg-icons";

import api from "../api/axios";

const API_BASE_URL = "http://localhost:5000";
const MAX_RESUME_SIZE = 5 * 1024 * 1024;

function getResumeUrl(resumePath) {
    if (!resumePath) return "";

    if (/^https?:\/\//i.test(resumePath)) {
        return resumePath;
    }

    return `${API_BASE_URL}/${resumePath
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")}`;
}

function ApplicationModal({ job, user, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [answers, setAnswers] = useState({});
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [checkingApplication, setCheckingApplication] = useState(true);
    const [existingApplication, setExistingApplication] = useState(null);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);

    const questions = job?.applicationQuestions || [];

    // Check whether the student has already applied.
    useEffect(() => {
        let cancelled = false;

        const checkApplication = async () => {
            setCheckingApplication(true);
            setError("");
            setExistingApplication(null);

            try {
                const response = await api.get(
                    `/applications/job/${job._id}/my`
                );

                if (!cancelled) {
                    setExistingApplication(
                        response.data.application || null
                    );
                }
            } catch (err) {
                console.error(
                    "Check existing application error:",
                    err
                );

                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to check your application status. Please try again."
                    );
                }
            } finally {
                if (!cancelled) {
                    setCheckingApplication(false);
                }
            }
        };

        if (job?._id) {
            checkApplication();
        } else {
            setCheckingApplication(false);
            setError("Job details are unavailable.");
        }

        return () => {
            cancelled = true;
        };
    }, [job?._id]);

    const updateAnswer = (questionId, value) => {
        setAnswers((current) => ({
            ...current,
            [questionId]: value
        }));
    };

    const getQuestionId = (question, index) =>
        question._id || String(index);

    const continueToQuestions = () => {
        setError("");

        if (!user?.resume && !file) {
            setError("Please select a resume before continuing.");
            return;
        }

        setStep(questions.length > 0 ? 2 : 3);
    };

    const continueToReview = () => {
        setError("");

        for (const [index, question] of questions.entries()) {
            const id = getQuestionId(question, index);
            const answer = answers[id];

            if (
                question.required &&
                (answer === undefined ||
                    answer === null ||
                    !String(answer).trim())
            ) {
                setError("Please answer all required questions.");
                return;
            }
        }

        setStep(3);
    };

    const submitApplication = async () => {
        setError("");

        if (submitting) return;

        if (!confirmed) {
            setError("Please confirm your application details.");
            return;
        }

        if (!user?.resume && !file) {
            setError("Please select a resume before submitting.");
            setStep(1);
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();

            if (file) {
                formData.append("resume", file);
            }

            const screeningAnswers = questions.map(
                (question, index) => {
                    const id = getQuestionId(question, index);

                    return {
                        questionId: String(id),
                        question: question.question,
                        answer: answers[id] || ""
                    };
                }
            );

            formData.append(
                "screeningAnswers",
                JSON.stringify(screeningAnswers)
            );

            const response = await api.post(
                `/applications/${job._id}`,
                formData
            );

            if (response.data.application) {
                onSuccess(response.data.application);
            } else {
                setError(
                    "The server did not return the submitted application."
                );
            }
        } catch (err) {
            console.error("Application submission error:", err);

            if (err.response?.status === 409) {
                // The database/controller may have detected
                // an application created by another request.
                try {
                    const existing =
                        err.response?.data?.application
                            ? err.response.data.application
                            : (
                                await api.get(
                                    `/applications/job/${job._id}/my`
                                )
                            ).data.application;

                    if (existing) {
                        setExistingApplication(existing);
                        setError("");
                    } else {
                        setError(
                            err.response?.data?.message ||
                            "You have already applied for this job."
                        );
                    }
                } catch (lookupError) {
                    console.error(
                        "Retrieve existing application error:",
                        lookupError
                    );

                    setError(
                        err.response?.data?.message ||
                        "You have already applied for this job."
                    );
                }
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to submit application. Please try again."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleResumeChange = (event) => {
        const selectedFile = event.target.files?.[0] || null;

        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (
            selectedFile.type !== "application/pdf" &&
            !selectedFile.name.toLowerCase().endsWith(".pdf")
        ) {
            setFile(null);
            setError("Please select a PDF resume.");
            event.target.value = "";
            return;
        }

        if (selectedFile.size > MAX_RESUME_SIZE) {
            setFile(null);
            setError("Resume must be 5 MB or smaller.");
            event.target.value = "";
            return;
        }

        setError("");
        setFile(selectedFile);
    };

    const renderExistingApplication = () => (
        <div className="application-step-content">
            <section className="application-review-section">
                <div className="application-section-title">
                    <FontAwesomeIcon icon={faCheck} />

                    <div>
                        <h3>
                            {existingApplication.status === "Withdrawn"
                                ? "Application Withdrawn"
                                : "Application Already Submitted"}
                        </h3>

                        <p>
                            {existingApplication.status === "Withdrawn"
                                ? "Your previous application has been withdrawn. You cannot submit another application for the same job."
                                : "You have already submitted an application for this position."}
                        </p>
                    </div>
                </div>

                <div className="final-review-card">
                    <div>
                        <span>Position</span>
                        <strong>
                            {existingApplication.job?.title || job?.title}
                        </strong>
                    </div>

                    <div>
                        <span>Company</span>
                        <strong>
                            {existingApplication.job?.company ||
                                job?.company}
                        </strong>
                    </div>

                    <div>
                        <span>Application status</span>
                        <strong>{existingApplication.status}</strong>
                    </div>

                    <div>
                        <span>Applied on</span>
                        <strong>
                            {existingApplication.createdAt
                                ? new Date(
                                    existingApplication.createdAt
                                ).toLocaleDateString("en-IN")
                                : "Date unavailable"}
                        </strong>
                    </div>

                    <div>
                        <span>Submitted resume</span>

                        {existingApplication.submittedResume ? (
                            <a
                                href={getResumeUrl(
                                    existingApplication.submittedResume
                                )}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View submitted resume
                            </a>
                        ) : (
                            <strong>Resume unavailable</strong>
                        )}
                    </div>
                </div>
            </section>

            <button
                type="button"
                className="application-primary-button"
                onClick={onClose}
            >
                Close
            </button>
        </div>
    );

    return (
        <div className="application-modal-overlay">
            <div
                className="application-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="application-modal-title"
            >
                <div className="application-modal-header">
                    <div>
                        <p className="application-modal-eyebrow">
                            Job Application
                        </p>

                        <h2 id="application-modal-title">
                            {job?.title || "Job Application"}
                        </h2>

                        <p>{job?.company || "Company"}</p>
                    </div>

                    <button
                        type="button"
                        className="application-modal-close"
                        onClick={onClose}
                        aria-label="Close application"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {checkingApplication ? (
                    <div className="application-step-content">
                        <p>Checking your application status...</p>
                    </div>
                ) : existingApplication ? (
                    renderExistingApplication()
                ) : (
                    <>
                        {error && (
                            <div
                                className="application-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="application-steps">
                            <div
                                className={
                                    step >= 1
                                        ? "application-step active"
                                        : "application-step"
                                }
                            >
                                <span>1</span>
                                Resume &amp; Details
                            </div>

                            {questions.length > 0 && (
                                <div
                                    className={
                                        step >= 2
                                            ? "application-step active"
                                            : "application-step"
                                    }
                                >
                                    <span>2</span>
                                    Questions
                                </div>
                            )}

                            <div
                                className={
                                    step >= 3
                                        ? "application-step active"
                                        : "application-step"
                                }
                            >
                                <span>
                                    {questions.length > 0 ? "3" : "2"}
                                </span>
                                Review
                            </div>
                        </div>

                        {step === 1 && (
                            <div className="application-step-content">
                                <section className="application-review-section">
                                    <div className="application-section-title">
                                        <FontAwesomeIcon icon={faUser} />

                                        <div>
                                            <h3>Your details</h3>
                                            <p>
                                                These details will be shared
                                                with the employer.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="application-details-grid">
                                        <div>
                                            <span>Name</span>
                                            <strong>
                                                {user?.name || "Not provided"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Email</span>
                                            <strong>
                                                {user?.email || "Not provided"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Phone</span>
                                            <strong>
                                                {user?.profile?.phone ||
                                                    "Not provided"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Location</span>
                                            <strong>
                                                {user?.profile?.city
                                                    ? `${user.profile.city}, ${user.profile.state || ""}`
                                                    : "Not provided"}
                                            </strong>
                                        </div>
                                    </div>
                                </section>

                                <section className="application-review-section">
                                    <div className="application-section-title">
                                        <FontAwesomeIcon icon={faFilePdf} />

                                        <div>
                                            <h3>Resume</h3>
                                            <p>
                                                Select the resume you want
                                                to send.
                                            </p>
                                        </div>
                                    </div>

                                    {user?.resume && !file && (
                                        <div className="existing-resume-card">
                                            <div>
                                                <FontAwesomeIcon
                                                    icon={faFilePdf}
                                                />

                                                <div>
                                                    <strong>
                                                        Your saved resume
                                                    </strong>
                                                    <span>
                                                        PDF resume from your
                                                        profile
                                                    </span>
                                                </div>
                                            </div>

                                            <a
                                                href={getResumeUrl(user.resume)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="resume-view-link"
                                            >
                                                View
                                            </a>
                                        </div>
                                    )}

                                    <label className="resume-upload-box">
                                        <FontAwesomeIcon icon={faUpload} />

                                        <span>
                                            {file
                                                ? file.name
                                                : user?.resume
                                                    ? "Upload a different resume"
                                                    : "Upload your resume"}
                                        </span>

                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={handleResumeChange}
                                        />
                                    </label>

                                    <small>
                                        PDF only, maximum 5 MB.
                                    </small>
                                </section>

                                <button
                                    type="button"
                                    className="application-primary-button"
                                    onClick={continueToQuestions}
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="application-step-content">
                                <section className="application-review-section">
                                    <div className="application-section-title">
                                        <div>
                                            <h3>Employer questions</h3>
                                            <p>
                                                Please answer the questions
                                                provided for this position.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="application-questions">
                                        {questions.map(
                                            (question, index) => {
                                                const id = getQuestionId(
                                                    question,
                                                    index
                                                );

                                                return (
                                                    <div
                                                        className="application-question"
                                                        key={id}
                                                    >
                                                        <label>
                                                            {question.question}

                                                            {question.required && (
                                                                <span>*</span>
                                                            )}
                                                        </label>

                                                        {question.type ===
                                                        "yes_no" ? (
                                                            <select
                                                                value={
                                                                    answers[id] ||
                                                                    ""
                                                                }
                                                                onChange={(event) =>
                                                                    updateAnswer(
                                                                        id,
                                                                        event.target.value
                                                                    )
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select answer
                                                                </option>
                                                                <option value="Yes">
                                                                    Yes
                                                                </option>
                                                                <option value="No">
                                                                    No
                                                                </option>
                                                            </select>
                                                        ) : question.type ===
                                                          "multiple_choice" ? (
                                                            <select
                                                                value={
                                                                    answers[id] ||
                                                                    ""
                                                                }
                                                                onChange={(event) =>
                                                                    updateAnswer(
                                                                        id,
                                                                        event.target.value
                                                                    )
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select answer
                                                                </option>

                                                                {(
                                                                    question.options ||
                                                                    []
                                                                ).map((option) => (
                                                                    <option
                                                                        key={option}
                                                                        value={option}
                                                                    >
                                                                        {option}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <textarea
                                                                value={
                                                                    answers[id] ||
                                                                    ""
                                                                }
                                                                onChange={(event) =>
                                                                    updateAnswer(
                                                                        id,
                                                                        event.target.value
                                                                    )
                                                                }
                                                                placeholder="Enter your answer"
                                                                rows={4}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </section>

                                <div className="application-button-row">
                                    <button
                                        type="button"
                                        className="application-secondary-button"
                                        onClick={() => setStep(1)}
                                    >
                                        Back
                                    </button>

                                    <button
                                        type="button"
                                        className="application-primary-button"
                                        onClick={continueToReview}
                                    >
                                        Review Application
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="application-step-content">
                                <section className="application-review-section">
                                    <div className="application-section-title">
                                        <FontAwesomeIcon icon={faCheck} />

                                        <div>
                                            <h3>
                                                Review your application
                                            </h3>
                                            <p>
                                                Check everything before
                                                submitting.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="final-review-card">
                                        <div>
                                            <span>Applicant</span>
                                            <strong>{user?.name}</strong>
                                        </div>

                                        <div>
                                            <span>Email</span>
                                            <strong>{user?.email}</strong>
                                        </div>

                                        <div>
                                            <span>Resume</span>
                                            <strong>
                                                {file?.name ||
                                                    "Saved profile resume"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Position</span>
                                            <strong>{job?.title}</strong>
                                        </div>

                                        <div>
                                            <span>Company</span>
                                            <strong>{job?.company}</strong>
                                        </div>
                                    </div>

                                    <label className="application-confirmation">
                                        <input
                                            type="checkbox"
                                            checked={confirmed}
                                            onChange={(event) =>
                                                setConfirmed(
                                                    event.target.checked
                                                )
                                            }
                                        />

                                        <span>
                                            I confirm that the information
                                            provided is accurate and I want
                                            to submit this application.
                                        </span>
                                    </label>
                                </section>

                                <div className="application-button-row">
                                    <button
                                        type="button"
                                        className="application-secondary-button"
                                        onClick={() =>
                                            setStep(
                                                questions.length > 0 ? 2 : 1
                                            )
                                        }
                                        disabled={submitting}
                                    >
                                        Back
                                    </button>

                                    <button
                                        type="button"
                                        className="application-primary-button"
                                        disabled={submitting}
                                        onClick={submitApplication}
                                    >
                                        <FontAwesomeIcon
                                            icon={faPaperPlane}
                                        />

                                        {submitting
                                            ? "Submitting..."
                                            : "Submit Application"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ApplicationModal;