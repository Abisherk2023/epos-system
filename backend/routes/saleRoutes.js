const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
// Create a sale
router.post("/", (req, res) => {

    const {
        items,
        payment_method
    } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({
            message: "Cart is empty"
        });
    }

    if (!payment_method) {
        return res.status(400).json({
            message: "Payment method is required"
        });
    }

    // Check stock before creating sale
    let checkedItems = 0;
    let stockError = false;

    items.forEach((item) => {

        const stockSql = `
            SELECT name, stock_quantity
            FROM products
            WHERE id = ?
        `;

        db.query(
            stockSql,
            [item.product_id],
            (err, results) => {

                if (err) {
                    console.error(
                        "Stock check error:",
                        err.message
                    );

                    stockError = true;
                    return finishStockCheck();
                }

                if (results.length === 0) {
                    stockError = true;

                    return finishStockCheck();
                }

                const product = results[0];

                if (
                    Number(item.quantity) >
                    Number(product.stock_quantity)
                ) {
                    stockError = true;

                    return res.status(400).json({
                        message:
                            `Not enough stock for ${product.name}. ` +
                            `Available stock: ${product.stock_quantity}`
                    });
                }

                finishStockCheck();
            }
        );

        function finishStockCheck() {

            checkedItems++;

            if (
                checkedItems === items.length &&
                !stockError
            ) {
                createSale();
            }
        }
    });

    // Create sale
    function createSale() {

        let totalAmount = 0;

        items.forEach((item) => {
            totalAmount +=
                Number(item.price) *
                Number(item.quantity);
        });

        const saleSql = `
            INSERT INTO sales
            (total_amount, payment_method)
            VALUES (?, ?)
        `;

        db.query(
            saleSql,
            [totalAmount, payment_method],
            (err, saleResult) => {

                if (err) {
                    return res.status(500).json({
                        message: "Failed to create sale",
                        error: err.message
                    });
                }

                const saleId = saleResult.insertId;

                // Save sale items
                const itemSql = `
                    INSERT INTO sale_items
                    (sale_id, product_id, quantity, price, subtotal)
                    VALUES ?
                `;

                const itemValues = items.map((item) => [
                    saleId,
                    item.product_id,
                    item.quantity,
                    item.price,
                    Number(item.price) *
                    Number(item.quantity)
                ]);

                db.query(
                    itemSql,
                    [itemValues],
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                message:
                                    "Failed to save sale items",
                                error: err.message
                            });
                        }

                        // Reduce stock
                        let completedUpdates = 0;
                        let stockUpdateError = false;

                        items.forEach((item) => {

                            const updateStockSql = `
                                UPDATE products
                                SET stock_quantity =
                                    stock_quantity - ?
                                WHERE id = ?
                            `;

                            db.query(
                                updateStockSql,
                                [
                                    Number(item.quantity),
                                    item.product_id
                                ],
                                (err) => {

                                    if (err) {
                                        console.error(
                                            "Stock update error:",
                                            err.message
                                        );

                                        stockUpdateError = true;
                                    }

                                    completedUpdates++;

                                    if (
                                        completedUpdates ===
                                        items.length
                                    ) {

                                        if (stockUpdateError) {
                                            return res.status(500).json({
                                                message:
                                                    "Sale created but stock update failed"
                                            });
                                        }

                                        res.status(201).json({
                                            message:
                                                "Sale completed successfully",
                                            saleId: saleId,
                                            totalAmount:
                                                totalAmount
                                        });
                                    }
                                }
                            );
                        });
                    }
                );
            }
        );
    }
});

// Get all sales
router.get("/", (req, res) => {

    const sql = `
        SELECT
            id,
            total_amount,
            payment_method,
            created_at
        FROM sales
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch sales",
                error: err.message
            });
        }

        res.json(results);
    });
});


// =========================
// SALES REPORT
// =========================

// =========================
// SALES REPORT BY DATE
// =========================

router.get("/report", (req, res) => {

    const { date } = req.query;

    let sql = `
        SELECT

            COUNT(*) AS totalTransactions,

            COALESCE(
                SUM(total_amount),
                0
            ) AS totalSales,

            COALESCE(
                SUM(
                    CASE
                        WHEN payment_method = 'cash'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS cashSales,

            COALESCE(
                SUM(
                    CASE
                        WHEN payment_method = 'card'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS cardSales

        FROM sales
    `;

    const values = [];

    if (date) {

        sql += `
            WHERE DATE(created_at) = ?
        `;

        values.push(date);
    }

    db.query(
        sql,
        values,
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message:
                        "Failed to generate sales report",
                    error: err.message
                });

            }

            res.json({

                date: date || "All Dates",

                totalTransactions:
                    results[0]
                        .totalTransactions,

                totalSales:
                    results[0].totalSales,

                cashSales:
                    results[0].cashSales,

                cardSales:
                    results[0].cardSales
            });

        }
    );

});

// Dashboard statistics
// IMPORTANT: This must come BEFORE /:id

router.get("/dashboard", (req, res) => {

    const sql = `
        SELECT

            (SELECT COALESCE(SUM(total_amount), 0)
             FROM sales) AS totalSales,

            (SELECT COALESCE(SUM(total_amount), 0)
             FROM sales
             WHERE DATE(created_at) = CURDATE()) AS todaySales,

            (SELECT COUNT(*)
             FROM products) AS totalProducts,

            (SELECT COUNT(*)
             FROM products
             WHERE stock_quantity <= 5) AS lowStockProducts
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch dashboard data",
                error: err.message
            });
        }

        res.json(results[0]);
    });
});

// =========================
// PRODUCT SALES REPORT
// =========================

router.get("/product-report", (req, res) => {

    const { date } = req.query;

    let sql = `
        SELECT
            products.id,
            products.name,
            products.sku,

            SUM(sale_items.quantity) AS quantity_sold,

            SUM(sale_items.subtotal) AS total_revenue

        FROM sale_items

        INNER JOIN sales
            ON sale_items.sale_id = sales.id

        INNER JOIN products
            ON sale_items.product_id = products.id
    `;

    const values = [];

    if (date) {

        sql += `
            WHERE DATE(sales.created_at) = ?
        `;

        values.push(date);
    }

    sql += `
        GROUP BY
            products.id,
            products.name,
            products.sku

        ORDER BY
            quantity_sold DESC
    `;

    db.query(
        sql,
        values,
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message:
                        "Failed to generate product sales report",
                    error: err.message
                });

            }

            res.json(results);
        }
    );

});

// =========================
// DAILY SALES REPORT
// =========================

router.get("/daily-report", (req, res) => {

    const sql = `
        SELECT
            DATE(created_at) AS sale_date,
            COUNT(*) AS total_transactions,
            COALESCE(SUM(total_amount), 0) AS total_sales
        FROM sales
        GROUP BY DATE(created_at)
        ORDER BY sale_date ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to generate daily sales report",
                error: err.message
            });
        }

        res.json(results);
    });
});

// Get sale details
// This must come AFTER /dashboard
router.get("/:id", (req, res) => {

    const saleId = req.params.id;

    const sql = `
        SELECT
            sales.id AS sale_id,
            sales.total_amount,
            sales.payment_method,
            sales.created_at,

            sale_items.product_id,
            products.name AS product_name,
            sale_items.quantity,
            sale_items.price,
            sale_items.subtotal

        FROM sales

        INNER JOIN sale_items
            ON sales.id = sale_items.sale_id

        INNER JOIN products
            ON sale_items.product_id = products.id

        WHERE sales.id = ?
    `;

    db.query(
        sql,
        [saleId],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to fetch sale details",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Sale not found"
                });
            }

            res.json(results);
        }
    );
});

module.exports = router;