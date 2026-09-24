require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const shiftRoutes = require("./routes/shiftRoutes");
app.use("/api/shifts", shiftRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

app.get("/", (req, res) => {
    res.send("Manage My Shifts API is running.");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});