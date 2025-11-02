const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dbcon = require('../dbconnection/db_conn');
const ScanHistory = require('../Model/ScanHistory');
const User = require('../Model/User');
require('dotenv').config({ path: '../.env' });

dbcon();

const app = express();
app.use(express.json());
app.use(cors());

// Save classification result to user's history
app.post("/save-history", async (req, res) => {
    try {
        console.log("Received save-history request");

        // Extract token from Authorization header
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            console.log("No token provided");
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
            console.log("Token verified for user ID:", decoded.id);
        } catch (jwtError) {
            console.log("nvalid token:", jwtError.message);
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        // Find user in database
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log("User not found with ID:", decoded.id);
            return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log("User found:", user.email);

        // Extract data from request body
        const { animal_name, scientific_name, confidence, taxonomy, details } = req.body;

        // Validate required fields
        if (!animal_name || !scientific_name || confidence === undefined) {
            console.log("Missing required fields");
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                required: ["animal_name", "scientific_name", "confidence"]
            });
        }

        // Create new scan history document
        const history = new ScanHistory({
            user_id: user._id,
            animal_name,
            scientific_name,
            confidence,
            taxonomy: taxonomy || null,
            details: details || null,
            scan_date: new Date(),
        });

        // Save to MongoDB
        await history.save();
        console.log("History saved successfully with ID:", history._id);

        // Return success response
        res.status(200).json({
            success: true,
            message: "Scan history saved successfully",
            data: {
                id: history._id,
                animal_name: history.animal_name,
                scan_date: history.scan_date
            }
        });

    } catch (error) {
        console.error(" Save history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save scan history",
            error: error.message
        });
    }
});

//Retrieve user's scan history
app.get("/history", async (req, res) => {
    try {
        console.log("Received get-history request");

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get all scan history for the specific user
        const history = await ScanHistory.find({ user_id: user._id })
            .sort({ scan_date: -1 })
            .limit(50);

        console.log(`Retrieved ${history.length} history records`);

        res.status(200).json({
            success: true,
            message: "History retrieved successfully",
            count: history.length,
            data: history
        });

    } catch (error) {
        console.error("Get history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve scan history",
            error: error.message
        });
    }
});

//Delete a specific scan from history
app.delete("/history/:id", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const historyId = req.params.id;

        // Find and delete only if it belongs to the user
        const deleted = await ScanHistory.findOneAndDelete({
            _id: historyId,
            user_id: decoded.id
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "History record not found or unauthorized" });
        }

        console.log(`Deleted history record: ${historyId}`);

        res.status(200).json({
            success: true,
            message: "History record deleted successfully"
        });

    } catch (error) {
        console.error("Delete history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete history record",
            error: error.message
        });
    }
});

app.listen(8001, () => {
    console.log("Server is running on port 8001");
});