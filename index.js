require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const commentRoutes = require("./routes/commentRoutes");
const permissionRoutes = require("./routes/permissionRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

app.get("/", (req, res) => {
    res.send("Manage My Shifts API is running.");
});

app.use("/api/user", userRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/permissions", permissionRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});