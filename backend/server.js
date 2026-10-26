const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");              
const profileRoutes = require("./routes/profileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();

// Security
app.disable("x-powered-by");
app.use(helmet());

// CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...(process.env.FRONTEND_URL || "")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin not allowed by CORS"));
        },
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

// Request body limits
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "20kb"
}));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many authentication attempts. Please try again later."
    }
});

// Connect to MongoDB
connectDB();

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile", apiLimiter, profileRoutes);
app.use("/api/jobs", apiLimiter, jobRoutes);
app.use("/api/applications", apiLimiter, applicationRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK"
    });
});

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "MyCareerFlow API is running"
    });
});

// Handle unknown endpoints
app.use((req, res) => {
    res.status(404).json({
        message: "API endpoint not found"
    });
});

// Centralized error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err.message === "Origin not allowed by CORS") {
        return res.status(403).json({
            message: "Request origin not allowed"
        });
    }

    console.error("API error:", err.message);

    res.status(err.status || 500).json({
        message:
            err.status && err.status < 500
                ? err.message
                : "Internal server error"
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`MyCareerFlow API running on port ${PORT}`);
});