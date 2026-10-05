const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);

// ========================================
// GET ALL PRODUCTS
// Admin + Cashier can view products
// ========================================

router.get("/", (req, res) => {

    const sql = `
        SELECT 
            products.id, 
            products.name, 
            products.sku, 
            products.price, 
            products.cost_price, 
            products.stock_quantity, 
            products.category_id, 
            products.image_url, 
            categories.name AS category_name, 
            products.created_at 
        FROM products 
        LEFT JOIN categories 
            ON products.category_id = categories.id 
        ORDER BY products.id DESC
    `;

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


// ========================================
// CREATE PRODUCT
// ADMIN ONLY
// ========================================

router.post(
    "/",
    roleMiddleware("admin"),
    (req, res) => {

        const {
            name,
            sku,
            price,
            cost_price,
            stock_quantity,
            category_id,
            image_url
        } = req.body;

        if (!name || !sku || price === undefined) {
            return res.status(400).json({
                message: "Name, SKU and price are required"
            });
        }

        const sql = `
            INSERT INTO products 
            (
                name,
                sku,
                price,
                cost_price,
                stock_quantity,
                category_id,
                image_url
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                name,
                sku,
                price,
                cost_price,
                stock_quantity,
                category_id,
                image_url
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        message: "Failed to add product",
                        error: err.message
                    });
                }

                res.status(201).json({
                    message: "Product added successfully",
                    productId: result.insertId
                });
            }
        );
    }
);


// ========================================
// UPDATE PRODUCT
// ADMIN ONLY
// ========================================

router.put(
    "/:id",
    roleMiddleware("admin"),
    (req, res) => {

        const { id } = req.params;

        const {
            name,
            sku,
            price,
            cost_price,
            stock_quantity,
            category_id,
            image_url
        } = req.body;

        const sql = `
            UPDATE products 
            SET 
                name = ?, 
                sku = ?, 
                price = ?, 
                cost_price = ?, 
                stock_quantity = ?, 
                category_id = ?, 
                image_url = ? 
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                name,
                sku,
                price,
                cost_price,
                stock_quantity,
                category_id,
                image_url,
                id
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        message: "Failed to update product",
                        error: err.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "Product not found"
                    });
                }

                res.json({
                    message: "Product updated successfully"
                });
            }
        );
    }
);


// ========================================
// DELETE PRODUCT
// ADMIN ONLY
// ========================================

router.delete(
    "/:id",
    roleMiddleware("admin"),
    (req, res) => {

        const { id } = req.params;

        const sql =
            "DELETE FROM products WHERE id = ?";

        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        message: "Failed to delete product",
                        error: err.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "Product not found"
                    });
                }

                res.json({
                    message: "Product deleted successfully"
                });
            }
        );
    }
);

module.exports = router;