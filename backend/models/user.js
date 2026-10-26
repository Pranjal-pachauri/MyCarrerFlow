const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },
       googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        
        avatar: {
            type: String,
            default: ""
        },
        resetPasswordTokenHash: {
            type: String,
            default: ""
        },
        
        resetPasswordExpires: {
            type: Date,
            default: null
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        },

        resume: {
            type: String,
            default: ""
        },

        profile: {
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

            bio: {
                type: String,
                default: ""
            },

            skills: {
                type: [String],
                default: []
            },

            codingProfiles: [
                {
                    name: {
                        type: String,
                        required: true
                    },

                    url: {
                        type: String,
                        required: true
                    }
                }
            ],

            education: [
                {
                    degree: {
                        type: String,
                        default: ""
                    },

                    institution: {
                        type: String,
                        default: ""
                    },

                    field: {
                        type: String,
                        default: ""
                    },

                    startYear: {
                        type: String,
                        default: ""
                    },

                    endYear: {
                        type: String,
                        default: ""
                    },

                    grade: {
                        type: String,
                        default: ""
                    }
                }
            ],

            academic: {
                university: {
                    type: String,
                    default: ""
                },

                branch: {
                    type: String,
                    default: ""
                },

                graduationYear: {
                    type: String,
                    default: ""
                },

                cgpa: {
                    type: String,
                    default: ""
                },

                class12: {
                    board: {
                        type: String,
                        default: ""
                    },

                    school: {
                        type: String,
                        default: ""
                    },

                    percentage: {
                        type: String,
                        default: ""
                    },

                    passingYear: {
                        type: String,
                        default: ""
                    }
                },

                class10: {
                    board: {
                        type: String,
                        default: ""
                    },

                    school: {
                        type: String,
                        default: ""
                    },

                    percentage: {
                        type: String,
                        default: ""
                    },

                    passingYear: {
                        type: String,
                        default: ""
                    }
                }
            },

            social: {
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
            }
        }
    },

    {
        timestamps: true
    }
);

const User =
    mongoose.models.User ||
    mongoose.model("User", userSchema);

module.exports = User;