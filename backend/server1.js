const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(
    "/uploads",
    express.static("uploads")
);


// Database
connectDB();


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// Test routes
app.get("/", (req, res) => {
    res.json({
        message: "PlacementHub API is running"
    });
});


app.get("/api/health", (req, res) => {
    res.json({
        status: "OK"
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});