const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// All user-management routes require login
router.use(authMiddleware);

// All user-management routes require admin
router.use(roleMiddleware("admin"));

// =========================
// GET ALL USERS
// =========================

router.get("/", (req, res) => {
    const sql = `
        SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch users",
                error: err.message
            });
        }

        res.json(results);
    });
});

// =========================
// CREATE USER
// =========================

router.post("/", async (req, res) => {
    const {
        name,
        email,
        password,
        role
    } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    const selectedRole = role || "cashier";

    if (!["admin", "cashier"].includes(selectedRole)) {
        return res.status(400).json({
            message: "Invalid role"
        });
    }

    try {
        const checkSql =
            "SELECT id FROM users WHERE email = ?";

        db.query(
            checkSql,
            [email],
            async (err, results) => {

                if (err) {
                    return res.status(500).json({
                        message: "Database error",
                        error: err.message
                    });
                }

                if (results.length > 0) {
                    return res.status(400).json({
                        message: "Email already exists"
                    });
                }

                const hashedPassword =
                    await bcrypt.hash(password, 10);

                const sql = `
                    INSERT INTO users
                    (name, email, password, role)
                    VALUES (?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        name,
                        email,
                        hashedPassword,
                        selectedRole
                    ],
                    (err, result) => {

                        if (err) {
                            return res.status(500).json({
                                message: "Failed to create user",
                                error: err.message
                            });
                        }

                        res.status(201).json({
                            message: "User created successfully",
                            userId: result.insertId
                        });
                    }
                );
            }
        );

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// =========================
// DELETE USER
// =========================

router.delete("/:id", (req, res) => {

    const userId = req.params.id;

    if (Number(userId) === Number(req.user.id)) {
        return res.status(400).json({
            message: "You cannot delete your own account"
        });
    }

    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [userId], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to delete user",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully"
        });
    });
});

module.exports = router;