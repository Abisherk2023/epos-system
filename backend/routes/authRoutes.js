const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


const db = require("../config/db");

const router = express.Router();

const JWT_SECRET = "epos_secret_key_123";

// =========================
// REGISTER USER
// =========================

router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    try {
        const checkSql =
            "SELECT * FROM users WHERE email = ?";

        db.query(checkSql, [email], async (err, results) => {
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

            const hashedPassword = await bcrypt.hash(
                password,
                10
            );

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
                    role || "cashier"
                ],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Failed to register user",
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        message: "User registered successfully",
                        userId: result.insertId
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// =========================
// LOGIN USER
// =========================

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql =
        "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

router.get(
    "/admin-test",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        res.json({
            message: "Admin access successful",
            user: req.user
        });
    }
);
// =========================
// GET CURRENT USER
// =========================

router.get("/me", authMiddleware, (req, res) => {
    res.json({
        message: "Authentication successful",
        user: req.user
    });
});

module.exports = router;