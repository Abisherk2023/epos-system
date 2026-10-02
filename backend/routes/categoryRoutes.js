const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

// GET all categories
router.get("/", (req, res) => {

    const sql = "SELECT * FROM categories";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        res.json(results);
    });
});

// POST category
router.post("/", (req, res) => {

    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Category name is required"
        });
    }

    const sql = "INSERT INTO categories (name) VALUES (?)";

    db.query(sql, [name], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to add category",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Category added successfully",
            categoryId: result.insertId
        });
    });
});

module.exports = router;