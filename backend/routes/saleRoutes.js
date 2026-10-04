const express = require("express");
const router = express.Router();

const db = require("../config/db");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);


// =====================================================
// CREATE SALE
// =====================================================

router.post("/", async (req, res) => {

    const {
        items,
        payment_method
    } = req.body;

    const userId = req.user.id;

    // =================================================
    // VALIDATION
    // =================================================

    if (!items || !Array.isArray(items) || items.length === 0) {

        return res.status(400).json({
            message: "Cart is empty"
        });

    }

    if (!payment_method) {

        return res.status(400).json({
            message: "Payment method is required"
        });

    }

    try {

        // =================================================
        // START TRANSACTION
        // =================================================

        await new Promise((resolve, reject) => {

            db.beginTransaction((err) => {

                if (err) {
                    reject(err);
                    return;
                }

                resolve();

            });

        });


        // =================================================
        // CHECK STOCK
        // =================================================

        for (const item of items) {

            const productResult = await new Promise(
                (resolve, reject) => {

                    const stockSql = `
                        SELECT
                            id,
                            name,
                            price,
                            stock_quantity
                        FROM products
                        WHERE id = ?
                        FOR UPDATE
                    `;

                    db.query(
                        stockSql,
                        [item.product_id],
                        (err, results) => {

                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve(results);

                        }
                    );

                }
            );


            // Product does not exist

            if (productResult.length === 0) {

                throw new Error(
                    `Product not found: ${item.product_id}`
                );

            }


            const product =
                productResult[0];


            // =================================================
            // VALIDATE QUANTITY
            // =================================================

            const quantity =
                Number(item.quantity);


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                throw new Error(
                    `Invalid quantity for ${product.name}`
                );

            }


            // =================================================
            // CHECK STOCK
            // =================================================

            if (
                quantity >
                Number(product.stock_quantity)
            ) {

                throw new Error(
                    `Not enough stock for ${product.name}. ` +
                    `Available stock: ${product.stock_quantity}`
                );

            }

        }


        // =================================================
        // CALCULATE TOTAL
        // =================================================

        let totalAmount = 0;


        items.forEach((item) => {

            const quantity =
                Number(item.quantity);

            const price =
                Number(item.price);

            totalAmount +=
                price * quantity;

        });


        // =================================================
        // CREATE SALE
        // =================================================

        const saleResult = await new Promise(
            (resolve, reject) => {

                const saleSql = `
                    INSERT INTO sales
                    (
                        user_id,
                        total_amount,
                        payment_method
                    )
                    VALUES (?, ?, ?)
                `;


                db.query(
                    saleSql,
                    [
                        userId,
                        totalAmount,
                        payment_method
                    ],
                    (err, result) => {

                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(result);

                    }
                );

            }
        );


        const saleId =
            saleResult.insertId;


        // =================================================
        // CREATE INVOICE NUMBER
        // =================================================

        const invoiceNumber =
            `INV-${new Date()
                .toISOString()
                .slice(0, 10)
                .replace(/-/g, "")}-${String(
                    saleId
                ).padStart(4, "0")}`;


        // =================================================
        // SAVE INVOICE NUMBER
        // =================================================

        await new Promise(
            (resolve, reject) => {

                const invoiceSql = `
                    UPDATE sales
                    SET invoice_number = ?
                    WHERE id = ?
                `;


                db.query(
                    invoiceSql,
                    [
                        invoiceNumber,
                        saleId
                    ],
                    (err) => {

                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();

                    }
                );

            }
        );


        // =================================================
        // CREATE SALE ITEMS
        // =================================================

        const itemValues =
            items.map((item) => {

                const quantity =
                    Number(item.quantity);

                const price =
                    Number(item.price);

                const subtotal =
                    price * quantity;


                return [
                    saleId,
                    item.product_id,
                    quantity,
                    price,
                    subtotal
                ];

            });


        await new Promise(
            (resolve, reject) => {

                const itemSql = `
                    INSERT INTO sale_items
                    (
                        sale_id,
                        product_id,
                        quantity,
                        price,
                        subtotal
                    )
                    VALUES ?
                `;


                db.query(
                    itemSql,
                    [itemValues],
                    (err) => {

                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();

                    }
                );

            }
        );


        // =================================================
        // REDUCE PRODUCT STOCK
        // =================================================

        for (const item of items) {

            const quantity =
                Number(item.quantity);


            await new Promise(
                (resolve, reject) => {

                    const updateStockSql = `
                        UPDATE products
                        SET stock_quantity =
                            stock_quantity - ?
                        WHERE id = ?
                    `;


                    db.query(
                        updateStockSql,
                        [
                            quantity,
                            item.product_id
                        ],
                        (err, result) => {

                            if (err) {
                                reject(err);
                                return;
                            }


                            // Extra safety check

                            if (
                                result.affectedRows === 0
                            ) {

                                reject(
                                    new Error(
                                        `Failed to update stock for product ${item.product_id}`
                                    )
                                );

                                return;
                            }


                            resolve();

                        }
                    );

                }
            );

        }


        // =================================================
        // COMMIT TRANSACTION
        // =================================================

        await new Promise(
            (resolve, reject) => {

                db.commit((err) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();

                });

            }
        );


        // =================================================
        // SUCCESS RESPONSE
        // =================================================

        return res.status(201).json({

            message:
                "Sale completed successfully",

            saleId:
                saleId,

            invoiceNumber:
                invoiceNumber,

            totalAmount:
                totalAmount

        });


    } catch (error) {

        console.error(
            "Sale transaction error:",
            error.message
        );


        // =================================================
        // ROLLBACK TRANSACTION
        // =================================================

        db.rollback((rollbackError) => {

            if (rollbackError) {

                console.error(
                    "Rollback error:",
                    rollbackError.message
                );

            } else {

                console.log(
                    "Transaction rolled back"
                );

            }

        });


        // =================================================
        // STOCK ERROR
        // =================================================

        if (
            error.message.startsWith(
                "Not enough stock"
            )
        ) {

            return res.status(400).json({
                message: error.message
            });

        }


        // =================================================
        // PRODUCT NOT FOUND
        // =================================================

        if (
            error.message.startsWith(
                "Product not found"
            )
        ) {

            return res.status(404).json({
                message: error.message
            });

        }


        // =================================================
        // INVALID QUANTITY
        // =================================================

        if (
            error.message.startsWith(
                "Invalid quantity"
            )
        ) {

            return res.status(400).json({
                message: error.message
            });

        }


        // =================================================
        // GENERAL ERROR
        // =================================================

        return res.status(500).json({

            message:
                "Failed to complete sale",

            error:
                error.message

        });

    }

});


// =====================================================
// GET ALL SALES
// =====================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT

            sales.id,

            sales.invoice_number,

            sales.total_amount,

            sales.payment_method,

            sales.created_at,

            users.name AS cashier_name,

            users.email AS cashier_email

        FROM sales

        LEFT JOIN users
            ON sales.user_id = users.id

        ORDER BY sales.id DESC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                return res.status(500).json({

                    message:
                        "Failed to fetch sales",

                    error:
                        err.message

                });

            }


            res.json(results);

        }
    );

});


// =====================================================
// ADMIN SALES REPORT
// =====================================================

router.get(
    "/report",
    roleMiddleware("admin"),
    (req, res) => {

        const {
            date,
            user_id,
            payment_method
        } = req.query;


        let sql = `
            SELECT

                sales.id,

                sales.invoice_number,

                sales.total_amount,

                sales.payment_method,

                sales.created_at,

                users.id AS cashier_id,

                users.name AS cashier_name,

                users.email AS cashier_email

            FROM sales

            LEFT JOIN users
                ON sales.user_id = users.id

            WHERE 1 = 1
        `;


        const values = [];


        // =================================================
        // FILTER BY DATE
        // =================================================

        if (date) {

            sql += `
                AND DATE(sales.created_at) = ?
            `;

            values.push(date);

        }


        // =================================================
        // FILTER BY CASHIER
        // =================================================

        if (user_id) {

            sql += `
                AND sales.user_id = ?
            `;

            values.push(user_id);

        }


        // =================================================
        // FILTER BY PAYMENT METHOD
        // =================================================

        if (payment_method) {

            sql += `
                AND sales.payment_method = ?
            `;

            values.push(payment_method);

        }


        sql += `
            ORDER BY sales.created_at DESC
        `;


        db.query(
            sql,
            values,
            (err, results) => {

                if (err) {

                    console.error(
                        "Sales report error:",
                        err.message
                    );


                    return res.status(500).json({

                        message:
                            "Failed to generate sales report",

                        error:
                            err.message

                    });

                }


                // =================================================
                // CALCULATE SUMMARY
                // =================================================

                let totalSales = 0;

                let cashSales = 0;

                let cardSales = 0;


                results.forEach((sale) => {

                    const amount =
                        Number(
                            sale.total_amount
                        );


                    totalSales += amount;


                    if (
                        sale.payment_method
                            ?.toLowerCase() === "cash"
                    ) {

                        cashSales += amount;

                    }


                    if (
                        sale.payment_method
                            ?.toLowerCase() === "card"
                    ) {

                        cardSales += amount;

                    }

                });


                // =================================================
                // REPORT RESPONSE
                // =================================================

                res.json({

                    date:
                        date ||
                        "All Dates",

                    user_id:
                        user_id ||
                        "All Cashiers",

                    payment_method:
                        payment_method ||
                        "All Payment Methods",

                    totalTransactions:
                        results.length,

                    totalSales:
                        totalSales.toFixed(2),

                    cashSales:
                        cashSales.toFixed(2),

                    cardSales:
                        cardSales.toFixed(2),

                    sales:
                        results

                });

            }
        );

    }
);


// =====================================================
// DASHBOARD STATISTICS
// =====================================================

router.get(
    "/dashboard",
    (req, res) => {

        const sql = `
            SELECT

                COALESCE(
                    SUM(total_amount),
                    0
                ) AS totalSales,

                COALESCE(
                    SUM(
                        CASE
                            WHEN DATE(created_at) = CURDATE()
                            THEN total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS todaySales,

                COUNT(*) AS totalTransactions,

                COALESCE(
                    SUM(
                        CASE
                            WHEN LOWER(payment_method) = 'cash'
                            THEN total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS cashSales,

                COALESCE(
                    SUM(
                        CASE
                            WHEN LOWER(payment_method) = 'card'
                            THEN total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS cardSales

            FROM sales
        `;


        db.query(
            sql,
            (err, salesResult) => {

                if (err) {

                    console.error(
                        "Dashboard sales error:",
                        err
                    );


                    return res.status(500).json({

                        message:
                            "Failed to load sales dashboard",

                        error:
                            err.message

                    });

                }


                // =================================================
                // TOTAL PRODUCTS
                // =================================================

                const productSql = `
                    SELECT
                        COUNT(*) AS totalProducts
                    FROM products
                `;


                db.query(
                    productSql,
                    (productErr, productResult) => {

                        if (productErr) {

                            return res.status(500).json({

                                message:
                                    "Failed to load product count",

                                error:
                                    productErr.message

                            });

                        }


                        // =================================================
                        // LOW STOCK PRODUCTS
                        // =================================================

                        const lowStockSql = `
                            SELECT
                                COUNT(*) AS lowStockProducts
                            FROM products
                            WHERE stock_quantity <= 5
                        `;


                        db.query(
                            lowStockSql,
                            (
                                lowStockErr,
                                lowStockResult
                            ) => {

                                if (lowStockErr) {

                                    return res.status(500).json({

                                        message:
                                            "Failed to load low stock count",

                                        error:
                                            lowStockErr.message

                                    });

                                }


                                // =================================================
                                // DASHBOARD RESPONSE
                                // =================================================

                                res.json({

                                    totalSales:
                                        salesResult[0]
                                            .totalSales,

                                    todaySales:
                                        salesResult[0]
                                            .todaySales,

                                    totalTransactions:
                                        salesResult[0]
                                            .totalTransactions,

                                    cashSales:
                                        salesResult[0]
                                            .cashSales,

                                    cardSales:
                                        salesResult[0]
                                            .cardSales,

                                    totalProducts:
                                        productResult[0]
                                            .totalProducts,

                                    lowStockProducts:
                                        lowStockResult[0]
                                            .lowStockProducts

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


// =====================================================
// PRODUCT SALES REPORT
// =====================================================

router.get(
    "/product-report",
    (req, res) => {

        const {
            date
        } = req.query;


        let sql = `
            SELECT

                products.id,

                products.name,

                products.sku,

                SUM(
                    sale_items.quantity
                ) AS quantity_sold,

                SUM(
                    sale_items.subtotal
                ) AS total_revenue

            FROM sale_items

            INNER JOIN sales
                ON sale_items.sale_id = sales.id

            INNER JOIN products
                ON sale_items.product_id = products.id
        `;


        const values = [];


        // =================================================
        // FILTER BY DATE
        // =================================================

        if (date) {

            sql += `
                WHERE DATE(sales.created_at) = ?
            `;

            values.push(date);

        }


        // =================================================
        // GROUP RESULTS
        // =================================================

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

                        error:
                            err.message

                    });

                }


                res.json(results);

            }
        );

    }
);


// =====================================================
// DAILY SALES REPORT
// =====================================================

router.get(
    "/daily-report",
    (req, res) => {

        const sql = `
            SELECT

                DATE(created_at) AS sale_date,

                COUNT(*) AS total_transactions,

                COALESCE(
                    SUM(total_amount),
                    0
                ) AS total_sales

            FROM sales

            GROUP BY
                DATE(created_at)

            ORDER BY
                sale_date ASC
        `;


        db.query(
            sql,
            (err, results) => {

                if (err) {

                    return res.status(500).json({

                        message:
                            "Failed to generate daily sales report",

                        error:
                            err.message

                    });

                }


                res.json(results);

            }
        );

    }
);


// =====================================================
// GET SALE DETAILS
// =====================================================

router.get(
    "/:id",
    (req, res) => {

        const saleId =
            req.params.id;


        const sql = `
            SELECT

                sales.id AS sale_id,

                sales.invoice_number,

                sales.total_amount,

                sales.payment_method,

                sales.created_at,

                users.name AS cashier_name,

                users.email AS cashier_email,

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

            LEFT JOIN users
                ON sales.user_id = users.id

            WHERE sales.id = ?
        `;


        db.query(
            sql,
            [saleId],
            (err, results) => {

                if (err) {

                    return res.status(500).json({

                        message:
                            "Failed to fetch sale details",

                        error:
                            err.message

                    });

                }


                if (results.length === 0) {

                    return res.status(404).json({

                        message:
                            "Sale not found"

                    });

                }


                res.json(results);

            }
        );

    }
);


module.exports = router;