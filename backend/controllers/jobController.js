const Job = require("../models/Job");
const Application = require("../models/Application");

// =========================================
// CREATE JOB
// =========================================

const createJob = async (req, res) => {

    try {

        const job = await Job.create({

            ...req.body,

            company:
                req.body.companyDetails?.name ||
                req.body.company,

            companyDetails: {

                ...req.body.companyDetails,

                name:
                    req.body.companyDetails?.name ||
                    req.body.company

            },

            createdBy: req.user._id

        });


        res.status(201).json({

            message: "Job created successfully",

            job

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};


// =========================================
// GET ALL JOBS
// =========================================

const getJobs = async (req, res) => {

    try {

        const {

            search = "",

            location = "",

            skill = "",

            page = 1,

            limit = 10

        } = req.query;


        const query = {
            isArchived: { $ne: true }
        };


        // =========================================
        // SEARCH
        // =========================================

        if (search.trim()) {

            const searchRegex =
                new RegExp(
                    search.trim(),
                    "i"
                );


            query.$or = [

                {
                    title: searchRegex
                },

                {
                    company: searchRegex
                },

                {
                    description: searchRegex
                },

                {
                    skills: searchRegex
                }

            ];

        }


        // =========================================
        // LOCATION FILTER
        // =========================================

        if (location.trim()) {

            query.location = {

                $regex: location.trim(),

                $options: "i"

            };

        }


        // =========================================
        // SKILL FILTER
        // =========================================

        if (skill.trim()) {

            query.skills = {

                $regex: skill.trim(),

                $options: "i"

            };

        }


        // =========================================
        // PAGINATION
        // =========================================

        const pageNumber =
            Math.max(
                Number(page) || 1,
                1
            );


        const limitNumber =
            Math.min(

                Math.max(
                    Number(limit) || 10,
                    1
                ),

                50

            );


        const skip =
            (pageNumber - 1) *
            limitNumber;


        // =========================================
        // DATABASE QUERY
        // =========================================

        const jobs =
            await Job.find(query)

                .populate(
                    "createdBy",
                    "name email"
                )

                .sort({
                    createdAt: -1
                })

                .skip(skip)

                .limit(limitNumber);


        const total =
            await Job.countDocuments(
                query
            );


        res.json({

            jobs,

            pagination: {

                page: pageNumber,

                limit: limitNumber,

                total,

                totalPages:
                    Math.ceil(
                        total /
                        limitNumber
                    )

            }

        });

    } catch (error) {

        console.error(
            "Get jobs error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to fetch jobs"

        });

    }

};


// =========================================
// GET SINGLE JOB
// =========================================

const getJobById = async (req, res) => {

    try {

        const job =
            await Job.findById(
                req.params.id
            );


        if (!job) {

            return res.status(404).json({

                message: "Job not found"

            });

        }


        res.json(job);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};


// =========================================
// UPDATE JOB
// =========================================

const updateJob = async (req, res) => {

    try {

        // Create a copy of the incoming data
        const updateData = {
            ...req.body
        };


        // Keep company and companyDetails.name
        // synchronized

        if (
            req.body.companyDetails?.name
        ) {

            updateData.company =
                req.body.companyDetails.name;

        }


        const job =
            await Job.findByIdAndUpdate(

                req.params.id,

                updateData,

                {

                    new: true,

                    runValidators: true

                }

            );


        if (!job) {

            return res.status(404).json({

                message: "Job not found"

            });

        }


        res.json({

            message:
                "Job updated successfully",

            job

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};


// =========================================
// DELETE JOB
// =========================================

// =========================================
// ARCHIVE JOB
// =========================================

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found."
            });
        }

        if (job.isArchived) {
            return res.status(400).json({
                message: "Job is already archived."
            });
        }

        job.isArchived = true;
        job.archivedAt = new Date();

        await job.save();

        return res.json({
            message: "Job archived successfully. Existing applications have been preserved.",
            job
        });
    } catch (error) {
        console.error("Archive job error:", error);

        return res.status(500).json({
            message: "Failed to archive job."
        });
    }
};


// =========================================
// GET JOB FILTERS
// =========================================

const getJobFilters = async (req, res) => {

    try {

        const locations =
            await Job.distinct(
                "location"
            );


        const skills =
            await Job.distinct(
                "skills"
            );


        res.json({

            locations:
                locations
                    .filter(Boolean)
                    .sort(),


            skills:
                skills
                    .filter(Boolean)
                    .sort()

        });

    } catch (error) {

        console.error(
            "Get job filters error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to fetch job filters"

        });

    }

};


module.exports = {

    createJob,

    getJobs,

    getJobById,

    updateJob,

    deleteJob,

    getJobFilters

};