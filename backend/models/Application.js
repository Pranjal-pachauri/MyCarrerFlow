const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },

        status: {
            type: String,
            enum: [
                "Applied",
                "Shortlisted",
                "Selected",
                "Rejected",
                "Withdrawn"
            ],
            default: "Applied"
        },

        // Snapshot of applicant details at the time of application
        applicantSnapshot: {
            name: {
                type: String,
                default: ""
            },

            email: {
                type: String,
                default: ""
            },

            phone: {
                type: String,
                default: ""
            },

            city: {
                type: String,
                default: ""
            },

            state: {
                type: String,
                default: ""
            },

            headline: {
                type: String,
                default: ""
            },

            skills: {
                type: [String],
                default: []
            },

            linkedin: {
                type: String,
                default: ""
            },

            github: {
                type: String,
                default: ""
            },

            portfolio: {
                type: String,
                default: ""
            }
        },

        // Resume actually submitted for THIS application
        submittedResume: {
            type: String,
            default: ""
        },

        // Employer screening answers
        screeningAnswers: [
            {
                questionId: {
                    type: String,
                    default: ""
                },

                question: {
                    type: String,
                    default: ""
                },

                answer: {
                    type: String,
                    default: ""
                }
            }
        ],

        withdrawnAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);

// One student can apply only once to the same job
applicationSchema.index(
    {
        student: 1,
        job: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "Application",
    applicationSchema
);