const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        company: {
            type: String,
            required: true
        },

        isArchived: {
            type: Boolean,
            default: false
        },

        archivedAt: {
            type: Date,
            default: null
        },

        /*
         * Detailed company information
         */
        companyDetails: {

            name: {
                type: String,
                default: ""
            },

            logo: {
                type: String,
                default: ""
            },

            website: {
                type: String,
                default: ""
            },

            industry: {
                type: String,
                default: ""
            },

            size: {
                type: String,
                default: ""
            },

            foundedYear: {
                type: String,
                default: ""
            },

            headquarters: {
                type: String,
                default: ""
            },

            about: {
                type: String,
                default: ""
            },

            locations: {
                type: [String],
                default: []
            },

            benefits: {
                type: [String],
                default: []
            }
        },

        description: {
            type: String,
            required: true
        },

        responsibilities: {
            type: [String],
            default: []
        },

        skills: {
            type: [String],
            required: true
        },

        preferredSkills: {
            type: [String],
            default: []
        },

        package: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        employmentType: {
            type: String,
            enum: [
                "Full Time",
                "Part Time",
                "Internship",
                "Contract"
            ],
            default: "Full Time"
        },

        workMode: {
            type: String,
            enum: [
                "On-site",
                "Hybrid",
                "Remote"
            ],
            default: "On-site"
        },

        eligibility: {
            type: String,
            default: ""
        },

        applicationQuestions: [
            {
                question: {
                    type: String,
                    required: true
                },

                type: {
                    type: String,
                    enum: [
                        "yes_no",
                        "short_text",
                        "multiple_choice"
                    ],
                    default: "short_text"
                },

                options: {
                    type: [String],
                    default: []
                },

                required: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },

    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Job ||
    mongoose.model("Job", jobSchema);