const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense-tracker";

const memoryTransactions = [];

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("MongoDB connected");
    } catch (err) {
        console.warn("MongoDB unavailable. Using in-memory storage.");
        console.warn(err.message);
    }
};

connectDB();

app.use("/api/transactions", require("./routes/transactionRoutes")(memoryTransactions));

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        database: mongoose.connection.readyState === 1 ? "mongodb" : "memory",
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Expense Tracker running on port ${PORT}`);
});
