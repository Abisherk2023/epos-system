import { useEffect, useState } from "react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

import api from "../api/axios";


function Dashboard() {

    const [dashboard, setDashboard] = useState({
        totalSales: 0,
        todaySales: 0,
        totalTransactions: 0,
        cashSales: 0,
        cardSales: 0,
        totalProducts: 0,
        lowStockProducts: 0
    });

    const [dailySales, setDailySales] = useState([]);

    const [productSales, setProductSales] = useState([]);

    const [lowStockProducts, setLowStockProducts] =
        useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        loadDashboard();

    }, []);


    const loadDashboard = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                dashboardResponse,
                dailySalesResponse,
                productSalesResponse,
                productsResponse
            ] = await Promise.all([

                api.get("/sales/dashboard"),

                api.get("/sales/daily-report"),

                api.get("/sales/product-report"),

                api.get("/products")

            ]);


            /* =========================
               DASHBOARD DATA
            ========================= */

            setDashboard({

                totalSales:
                    Number(
                        dashboardResponse.data.totalSales
                    ) || 0,

                todaySales:
                    Number(
                        dashboardResponse.data.todaySales
                    ) || 0,

                totalTransactions:
                    Number(
                        dashboardResponse.data.totalTransactions
                    ) || 0,

                cashSales:
                    Number(
                        dashboardResponse.data.cashSales
                    ) || 0,

                cardSales:
                    Number(
                        dashboardResponse.data.cardSales
                    ) || 0,

                totalProducts:
                    Number(
                        dashboardResponse.data.totalProducts
                    ) || 0,

                lowStockProducts:
                    Number(
                        dashboardResponse.data.lowStockProducts
                    ) || 0

            });


            /* =========================
               DAILY SALES
            ========================= */

            const formattedDailySales =
                dailySalesResponse.data.map(
                    (item) => ({

                        date: item.sale_date,

                        sales:
                            Number(
                                item.total_sales
                            ) || 0,

                        transactions:
                            Number(
                                item.total_transactions
                            ) || 0

                    })
                );


            setDailySales(
                formattedDailySales
            );


            /* =========================
               PRODUCT SALES
            ========================= */

            const formattedProductSales =
                productSalesResponse.data

                    .map(
                        (item) => ({

                            name: item.name,

                            quantity:
                                Number(
                                    item.quantity_sold
                                ) || 0,

                            revenue:
                                Number(
                                    item.total_revenue
                                ) || 0

                        })
                    )

                    .sort(
                        (a, b) =>
                            b.quantity -
                            a.quantity
                    )

                    .slice(0, 10);


            setProductSales(
                formattedProductSales
            );


            /* =========================
               LOW STOCK PRODUCTS
            ========================= */

            const lowStock =
                productsResponse.data

                    .filter(
                        (product) =>
                            Number(
                                product.stock_quantity
                            ) <= 5
                    )

                    .sort(
                        (a, b) =>
                            Number(
                                a.stock_quantity
                            ) -
                            Number(
                                b.stock_quantity
                            )
                    );


            setLowStockProducts(
                lowStock
            );


        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to load dashboard data"
            );


        } finally {

            setLoading(false);

        }

    };


    /* =========================
       PAYMENT CHART DATA
    ========================= */

    const paymentData = [

        {
            name: "Cash",
            value: dashboard.cashSales
        },

        {
            name: "Card",
            value: dashboard.cardSales
        }

    ];


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (

            <div className="dashboard">

                <h1>
                    📊 Dashboard
                </h1>

                <p className="loading-message">
                    Loading dashboard...
                </p>

            </div>

        );

    }


    return (

        <div className="dashboard">


            {/* =========================
                DASHBOARD HEADER
            ========================= */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        📊 Dashboard
                    </h1>

                    <p>
                        EPOS System Overview
                    </p>

                </div>


                <button
                    className="primary-button"
                    onClick={loadDashboard}
                >
                    🔄 Refresh
                </button>

            </div>


            {/* =========================
                ERROR
            ========================= */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* =========================
                SUMMARY CARDS
            ========================= */}

            <div className="dashboard-cards">


                {/* TOTAL SALES */}

                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        💰
                    </div>

                    <div>

                        <p>
                            Total Sales
                        </p>

                        <h2>
                            Rs.{" "}
                            {dashboard.totalSales.toFixed(2)}
                        </h2>

                    </div>

                </div>


                {/* TODAY SALES */}

                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        📅
                    </div>

                    <div>

                        <p>
                            Today's Sales
                        </p>

                        <h2>
                            Rs.{" "}
                            {dashboard.todaySales.toFixed(2)}
                        </h2>

                    </div>

                </div>


                {/* TRANSACTIONS */}

                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        🧾
                    </div>

                    <div>

                        <p>
                            Total Transactions
                        </p>

                        <h2>
                            {dashboard.totalTransactions}
                        </h2>

                    </div>

                </div>


                {/* PRODUCTS */}

                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        📦
                    </div>

                    <div>

                        <p>
                            Total Products
                        </p>

                        <h2>
                            {dashboard.totalProducts}
                        </h2>

                    </div>

                </div>


                {/* LOW STOCK */}

                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        ⚠️
                    </div>

                    <div>

                        <p>
                            Low Stock Products
                        </p>

                        <h2>
                            {dashboard.lowStockProducts}
                        </h2>

                    </div>

                </div>


            </div>


            {/* =========================
                LOW STOCK PRODUCTS
            ========================= */}

            <div className="low-stock-section">


                <div className="low-stock-header">

                    <div>

                        <h2>
                            ⚠️ Low Stock Alert
                        </h2>

                        <p>
                            Products that need restocking
                        </p>

                    </div>


                    <span className="low-stock-count">

                        {lowStockProducts.length}

                    </span>

                </div>


                {lowStockProducts.length === 0 ? (

                    <div className="stock-success">

                        ✅ All products have sufficient stock.

                    </div>

                ) : (

                    <div className="low-stock-table-container">

                        <table className="low-stock-table">

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        SKU
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {lowStockProducts.map(
                                    (product) => (

                                        <tr
                                            key={product.id}
                                        >

                                            <td>

                                                <strong>
                                                    {product.name}
                                                </strong>

                                            </td>


                                            <td>
                                                {product.sku}
                                            </td>


                                            <td>
                                                {product.category_name ||
                                                    "Uncategorized"}
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        Number(
                                                            product.stock_quantity
                                                        ) === 0
                                                            ? "stock-out"
                                                            : "stock-low"
                                                    }
                                                >

                                                    {Number(
                                                        product.stock_quantity
                                                    ) === 0
                                                        ? "OUT OF STOCK"
                                                        : `${product.stock_quantity} left`}

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =========================
                PAYMENT SUMMARY
            ========================= */}

            <div className="payment-summary">


                <div className="payment-summary-header">

                    <h2>
                        💳 Payment Summary
                    </h2>

                    <p>
                        Total sales by payment method
                    </p>

                </div>


                <div className="payment-summary-cards">


                    {/* CASH */}

                    <div className="payment-summary-card cash">

                        <div className="payment-icon">
                            💵
                        </div>

                        <div>

                            <p>
                                Cash Sales
                            </p>

                            <h2>
                                Rs.{" "}
                                {dashboard.cashSales.toFixed(2)}
                            </h2>

                        </div>

                    </div>


                    {/* CARD */}

                    <div className="payment-summary-card card">

                        <div className="payment-icon">
                            💳
                        </div>

                        <div>

                            <p>
                                Card Sales
                            </p>

                            <h2>
                                Rs.{" "}
                                {dashboard.cardSales.toFixed(2)}
                            </h2>

                        </div>

                    </div>


                </div>

            </div>


            {/* =========================
                PAYMENT METHOD CHART
            ========================= */}

            <div className="dashboard-chart-card">


                <div className="dashboard-chart-header">

                    <div>

                        <h2>
                            💳 Payment Methods
                        </h2>

                        <p>
                            Sales distribution by payment method
                        </p>

                    </div>

                </div>


                {dashboard.cashSales === 0 &&
                dashboard.cardSales === 0 ? (

                    <div className="empty-message">

                        No payment data available.

                    </div>

                ) : (

                    <div className="payment-chart">

                        <ResponsiveContainer
                            width="100%"
                            height={350}
                        >

                            <PieChart>

                                <Pie
                                    data={paymentData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label
                                >

                                    {paymentData.map(
                                        (entry, index) => (

                                            <Cell
                                                key={`cell-${index}`}
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip
                                    formatter={(value) =>
                                        `Rs. ${Number(value).toFixed(2)}`
                                    }
                                />


                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </div>

                )}

            </div>


            {/* =========================
                DAILY SALES CHART
            ========================= */}

            <div className="dashboard-chart-card">


                <div className="dashboard-chart-header">

                    <div>

                        <h2>
                            📈 Daily Sales
                        </h2>

                        <p>
                            Sales performance by day
                        </p>

                    </div>

                </div>


                {dailySales.length === 0 ? (

                    <div className="empty-message">

                        No sales data available.

                    </div>

                ) : (

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <LineChart
                            data={dailySales}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 10
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="date"
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="sales"
                                name="Sales (Rs.)"
                                strokeWidth={3}
                                activeDot={{
                                    r: 7
                                }}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                )}

            </div>


            {/* =========================
                TOP SELLING PRODUCTS
            ========================= */}

            <div className="dashboard-chart-card">


                <div className="dashboard-chart-header">

                    <div>

                        <h2>
                            🏆 Top Selling Products
                        </h2>

                        <p>
                            Products with the highest sales quantity
                        </p>

                    </div>

                </div>


                {productSales.length === 0 ? (

                    <div className="empty-message">

                        No product sales data available.

                    </div>

                ) : (

                    <ResponsiveContainer
                        width="100%"
                        height={400}
                    >

                        <BarChart
                            data={productSales}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 70
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="name"
                                angle={-35}
                                textAnchor="end"
                                interval={0}
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Bar
                                dataKey="quantity"
                                name="Quantity Sold"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                )}

            </div>


        </div>

    );

}


export default Dashboard;