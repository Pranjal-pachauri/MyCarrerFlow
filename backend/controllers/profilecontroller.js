const User = require("../models/user");
const fs = require("fs");
const path = require("path");

// Private resume storage directory
const resumeDirectory = path.resolve(
    __dirname,
    "..",
    "uploads",
    "resumes"
);

// Safely resolve a resume filename inside the resumes directory
const getResumePath = (resume) => {
    if (!resume || typeof resume !== "string") {
        return null;
    }

    const filename = path.basename(
        resume.replace(/\\/g, "/")
    );

    if (
        !filename ||
        filename === "." ||
        filename === ".." ||
        path.extname(filename).toLowerCase() !== ".pdf"
    ) {
        return null;
    }

    const filePath = path.resolve(resumeDirectory, filename);

    if (!filePath.startsWith(resumeDirectory + path.sep)) {
        return null;
    }

    return filePath;
};


// Calculate profile completion percentage
const calculateProfileCompletion = (user) => {
    const profile = user.profile || {};
    const academic = profile.academic || {};
    const class12 = academic.class12 || {};
    const class10 = academic.class10 || {};
    const social = profile.social || {};

    const fields = [
        user.name,
        user.email,

        profile.phone,
        profile.city,
        profile.state,
        profile.headline,
        profile.bio,

        academic.university,
        academic.branch,
        academic.graduationYear,
        academic.cgpa,

        class12.board,
        class12.school,
        class12.percentage,
        class12.passingYear,

        class10.board,
        class10.school,
        class10.percentage,
        class10.passingYear,

        social.linkedin,
        social.github,
        social.portfolio
    ];

    const completedFields = fields.filter((value) => {
        return (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        );
    }).length;

    const sections = [
        Array.isArray(profile.skills) && profile.skills.length > 0,
        Array.isArray(profile.education) && profile.education.length > 0,
        Array.isArray(profile.codingProfiles) &&
            profile.codingProfiles.length > 0,
        Boolean(user.resume)
    ];

    const completedSections = sections.filter(Boolean).length;

    return Math.round(
        ((completedFields + completedSections) /
            (fields.length + sections.length)) * 100
    );
};


// GET PROFILE
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user,
            profileCompletion: calculateProfileCompletion(user)
        });

    } catch (error) {
        console.error("Get profile error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};


// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const profileData = req.body.profile;

        if (
            !profileData ||
            typeof profileData !== "object" ||
            Array.isArray(profileData)
        ) {
            return res.status(400).json({
                message: "Invalid profile data"
            });
        }

        const allowedFields = [
            "phone",
            "city",
            "state",
            "headline",
            "bio",
            "skills",
            "codingProfiles",
            "education",
            "academic",
            "social"
        ];

        // Update only permitted profile fields.
        for (const field of allowedFields) {
            if (
                Object.prototype.hasOwnProperty.call(
                    profileData,
                    field
                )
            ) {
                user.set(`profile.${field}`, profileData[field]);
            }
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password")
            .lean();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
            profileCompletion: calculateProfileCompletion(updatedUser)
        });

    } catch (error) {
        console.error("Update profile error:", error.message);

        return res.status(500).json({
            message: "Failed to update profile"
        });
    }
};


// UPLOAD OR REPLACE RESUME
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a PDF resume"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(404).json({
                message: "User not found"
            });
        }

        const newResumePath = req.file.path.replace(/\\/g, "/");

        const oldResumePath = getResumePath(user.resume);

        user.resume = newResumePath;
        await user.save();

        if (
            oldResumePath &&
            oldResumePath !== path.resolve(req.file.path) &&
            fs.existsSync(oldResumePath)
        ) {
            try {
                fs.unlinkSync(oldResumePath);
            } catch (fileError) {
                console.error(
                    "Old resume cleanup error:",
                    fileError.message
                );
            }
        }

        const updatedUser = await User.findById(user._id)
            .select("-password")
            .lean();

        return res.status(200).json({
            message: "Resume uploaded successfully",
            resume: updatedUser.resume,
            user: updatedUser,
            profileCompletion: calculateProfileCompletion(updatedUser)
        });

    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (fileError) {
                console.error(
                    "Resume cleanup error:",
                    fileError.message
                );
            }
        }

        console.error("Upload resume error:", error.message);

        return res.status(500).json({
            message: "Failed to upload resume"
        });
    }
};


// DOWNLOAD OWN RESUME
const downloadResume = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("resume");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.resume) {
            return res.status(404).json({
                message: "No resume has been uploaded"
            });
        }

        const filePath = getResumePath(user.resume);

        if (
            !filePath ||
            !fs.existsSync(filePath) ||
            !fs.statSync(filePath).isFile()
        ) {
            return res.status(404).json({
                message: "Resume file not found"
            });
        }

        res.setHeader("Cache-Control", "private, no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");

        return res.download(
            filePath,
            path.basename(filePath),
            (error) => {
                if (error && !res.headersSent) {
                    console.error(
                        "Resume download error:",
                        error.message
                    );

                    res.status(500).json({
                        message: "Failed to download resume"
                    });
                }
            }
        );

    } catch (error) {
        console.error("Download resume error:", error.message);

        if (!res.headersSent) {
            return res.status(500).json({
                message: "Failed to download resume"
            });
        }
    }
};


// DELETE RESUME
const deleteResume = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.resume) {
            return res.status(404).json({
                message: "No resume to delete"
            });
        }

        const resumePath = getResumePath(user.resume);

        user.resume = "";
        await user.save();

        if (resumePath && fs.existsSync(resumePath)) {
            try {
                fs.unlinkSync(resumePath);
            } catch (fileError) {
                console.error(
                    "Resume deletion error:",
                    fileError.message
                );
            }
        }

        const updatedUser = await User.findById(user._id)
            .select("-password")
            .lean();

        return res.status(200).json({
            message: "Resume deleted successfully",
            user: updatedUser,
            profileCompletion: calculateProfileCompletion(updatedUser)
        });

    } catch (error) {
        console.error("Delete resume error:", error.message);

        return res.status(500).json({
            message: "Failed to delete resume"
        });
    }
};


module.exports = {
    getProfile,
    updateProfile,
    uploadResume,
    deleteResume,
    downloadResume
};