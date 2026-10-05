const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);


// ========================================
// GET ALL CATEGORIES
// Admin + Cashier can view categories
// ========================================

router.get("/", (req, res) => {

    const sql = `
        SELECT *
        FROM categories
        ORDER BY id DESC
    `;

    db.query(
        sql,
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            res.json(results);
        }
    );
});


// ========================================
// CREATE CATEGORY
// ADMIN ONLY
// ========================================

router.post(
    "/",
    roleMiddleware("admin"),
    (req, res) => {

        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const categoryName = name.trim();

        const sql =
            "INSERT INTO categories (name) VALUES (?)";

        db.query(
            sql,
            [categoryName],
            (err, result) => {

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
            }
        );
    }
);

module.exports = router;