
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
// =========================================
// STUDENT: APPLY FOR A JOB
// =========================================

const applyJob = async (req, res) => {
    try {
        const { screeningAnswers = "[]" } = req.body || {};

        const student = await User.findById(req.user._id);

        if (!student) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found."
            });
        }

        // Prevent duplicate applications.
        const existingApplication = await Application.findOne({
            student: student._id,
            job: job._id
        }).populate("job", "title company location package");

        if (existingApplication) {
            return res.status(409).json({
                message: "You have already applied for this job.",
                application: existingApplication
            });
        }

        // Use the newly uploaded resume or the saved profile resume.
        const submittedResume =
            req.file?.path?.replace(/\\/g, "/") ||
            student.resume;

        if (!submittedResume) {
            return res.status(400).json({
                message: "Please upload a resume before applying."
            });
        }

        // Validate screening answers.
        let parsedAnswers;

        try {
            parsedAnswers =
                typeof screeningAnswers === "string"
                    ? JSON.parse(screeningAnswers)
                    : screeningAnswers;

            if (!Array.isArray(parsedAnswers)) {
                throw new Error("Answers must be an array.");
            }
        } catch {
            return res.status(400).json({
                message: "Invalid screening answers."
            });
        }

        // Save a snapshot of the student's details at application time.
        const profile = student.profile || {};
        const social = profile.social || {};

        const applicantSnapshot = {
            name: student.name || "",
            email: student.email || "",
            phone: profile.phone || "",
            city: profile.city || "",
            state: profile.state || "",
            headline: profile.headline || "",
            skills: profile.skills || [],
            linkedin: social.linkedin || "",
            github: social.github || "",
            portfolio: social.portfolio || ""
        };

        const application = await Application.create({
            student: student._id,
            job: job._id,
            applicantSnapshot,
            submittedResume,
            screeningAnswers: parsedAnswers,
            status: "Applied"
        });

        const populatedApplication = await Application
            .findById(application._id)
            .populate(
                "job",
                "title company location package skills"
            );

        return res.status(201).json({
            message: "Application submitted successfully.",
            application: populatedApplication
        });
    } catch (error) {
        console.error("Apply for job error:", error);

        // A unique-index violation means an application already exists.
        if (error.code === 11000) {
            try {
                const existingApplication = await Application
                    .findOne({
                        student: req.user._id,
                        job: req.params.jobId
                    })
                    .populate(
                        "job",
                        "title company location package"
                    );

                if (existingApplication) {
                    return res.status(409).json({
                        message:
                            "You have already applied for this job.",
                        application: existingApplication
                    });
                }
            } catch (lookupError) {
                console.error(
                    "Could not retrieve existing application:",
                    lookupError
                );
            }

            return res.status(409).json({
                message:
                    "An application already exists for this student and job."
            });
        }

        return res.status(500).json({
            message:
                error.message || "Failed to submit application."
        });
    }
};

// =========================================
// STUDENT: CHECK APPLICATION FOR ONE JOB
// =========================================

const getMyJobApplication = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found."
            });
        }

        const application = await Application
            .findOne({
                student: req.user._id,
                job: job._id
            })
            .populate(
                "job",
                "title company location package skills"
            );

        return res.json({
            hasApplied: Boolean(application),
            application: application || null
        });
    } catch (error) {
        console.error("Check job application error:", error);

        return res.status(500).json({
            message: "Failed to check application status."
        });
    }
};

// =========================================
// STUDENT: GET OWN APPLICATIONS
// =========================================

const myApplications = async (req, res) => {
    try {
        const applications = await Application
            .find({
                student: req.user._id
            })
            .populate("job")
            .sort({ createdAt: -1 });

        return res.json(applications);
    } catch (error) {
        console.error("Get my applications error:", error);

        return res.status(500).json({
            message: "Failed to fetch your applications."
        });
    }
};

// =========================================
// ADMIN: GET ALL APPLICATIONS
// =========================================

const getAllApplications = async (req, res) => {
    try {
        const applications = await Application
            .find()
            .populate("student", "name email")
            .populate(
                "job",
                "title company location package skills"
            )
            .sort({ createdAt: -1 });

        return res.json(applications);
    } catch (error) {
        console.error("Get all applications error:", error);

        return res.status(500).json({
            message: "Failed to fetch applications."
        });
    }
};

// =========================================
// ADMIN: UPDATE APPLICATION STATUS
// =========================================

const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Applied",
            "Shortlisted",
            "Rejected",
            "Selected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status."
            });
        }

        const application = await Application
            .findByIdAndUpdate(
                req.params.id,
                { status },
                {
                    new: true,
                    runValidators: true
                }
            )
            .populate("student", "name email")
            .populate(
                "job",
                "title company location package"
            );

        if (!application) {
            return res.status(404).json({
                message: "Application not found."
            });
        }

        return res.json({
            message: "Application status updated successfully.",
            application
        });
    } catch (error) {
        console.error("Update application status error:", error);

        return res.status(500).json({
            message: "Failed to update application status."
        });
    }
};

// =========================================
// STUDENT: WITHDRAW APPLICATION
// Only applications with status "Applied" can be withdrawn.
// =========================================

const withdrawApplication = async (req, res) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            student: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found."
            });
        }

        if (application.status !== "Applied") {
            return res.status(400).json({
                message:
                    `This application cannot be withdrawn because its status is "${application.status}". Only applications with status "Applied" can be withdrawn.`
            });
        }

        application.status = "Withdrawn";
        application.withdrawnAt = new Date();

        await application.save();

        const populatedApplication = await Application
            .findById(application._id)
            .populate(
                "job",
                "title company location package skills"
            );

        return res.json({
            message: "Application withdrawn successfully.",
            application: populatedApplication
        });
    } catch (error) {
        console.error("Withdraw application error:", error);

        return res.status(500).json({
            message:
                error.message || "Failed to withdraw application."
        });
    }
};

// STUDENT: Download own application's resume
// ADMIN: Download a resume attached to any application
const downloadApplicationResume = async (req, res) => {
    try {
        const { id } = req.params;

        let application;

        if (req.user.role === "admin") {
            application = await Application.findById(id);
        } else {
            application = await Application.findOne({
                _id: id,
                student: req.user._id
            });
        }

        if (!application) {
            return res.status(404).json({
                message: "Application not found."
            });
        }

        if (!application.submittedResume) {
            return res.status(404).json({
                message: "No resume is attached to this application."
            });
        }

        // Accept only a filename from the stored path.
        // This prevents a stored path from escaping the resume directory.
        const filename = path.basename(
            application.submittedResume.replace(/\\/g, "/")
        );

        if (!filename || filename === "." || filename === "..") {
            return res.status(400).json({
                message: "Invalid resume file path."
            });
        }

        const resumeDirectory = path.resolve(
            __dirname,
            "..",
            "uploads",
            "resumes"
        );

        const filePath = path.join(resumeDirectory, filename);

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            return res.status(404).json({
                message: "Resume file not found."
            });
        }

        res.setHeader("Cache-Control", "private, no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");

        return res.download(filePath, filename, (error) => {
            if (error && !res.headersSent) {
                console.error("Resume download error:", error);

                return res.status(500).json({
                    message: "Failed to download resume."
                });
            }
        });
    } catch (error) {
        console.error("Download application resume error:", error);

        return res.status(500).json({
            message: "Failed to download resume."
        });
    }
};
module.exports = {
    applyJob,
    getMyJobApplication,
    myApplications,
    getAllApplications,
    updateApplicationStatus,
    withdrawApplication,
    downloadApplicationResume
};