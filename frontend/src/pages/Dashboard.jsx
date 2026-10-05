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

    const [lowStockProducts, setLowStockProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");


    /* =========================
       LOAD DASHBOARD
    ========================= */

    useEffect(() => {
        loadDashboard();
    }, []);


    const loadDashboard = async () => {

        try {

            setError("");

            if (loading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }


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
               DASHBOARD SUMMARY
            ========================= */

            const dashboardData =
                dashboardResponse.data || {};


            setDashboard({

                totalSales:
                    Number(
                        dashboardData.totalSales
                    ) || 0,

                todaySales:
                    Number(
                        dashboardData.todaySales
                    ) || 0,

                totalTransactions:
                    Number(
                        dashboardData.totalTransactions
                    ) || 0,

                cashSales:
                    Number(
                        dashboardData.cashSales
                    ) || 0,

                cardSales:
                    Number(
                        dashboardData.cardSales
                    ) || 0,

                totalProducts:
                    Number(
                        dashboardData.totalProducts
                    ) || 0,

                lowStockProducts:
                    Number(
                        dashboardData.lowStockProducts
                    ) || 0

            });


            /* =========================
               DAILY SALES
            ========================= */

            const dailySalesData =
                Array.isArray(
                    dailySalesResponse.data
                )
                    ? dailySalesResponse.data
                    : [];


            const formattedDailySales =
                dailySalesData.map(
                    (item) => ({

                        date: formatChartDate(
                            item.sale_date
                        ),

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

            const productSalesData =
                Array.isArray(
                    productSalesResponse.data
                )
                    ? productSalesResponse.data
                    : [];


            const formattedProductSales =
                productSalesData
                    .map(
                        (item) => ({

                            name:
                                item.name ||
                                "Unknown Product",

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

            const productsData =
                Array.isArray(
                    productsResponse.data
                )
                    ? productsResponse.data
                    : [];


            const lowStock =
                productsData
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
                "Failed to load dashboard data."
            );


        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    /* =========================
       FORMAT DATE
    ========================= */

    const formatChartDate = (dateValue) => {

        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short"
            }
        );

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
       AVERAGE TRANSACTION
    ========================= */

    const averageTransaction =
        dashboard.totalTransactions > 0
            ? dashboard.totalSales /
              dashboard.totalTransactions
            : 0;


    /* =========================
       TOTAL PAYMENT SALES
    ========================= */

    const totalPaymentSales =
        dashboard.cashSales +
        dashboard.cardSales;


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (

            <div className="dashboard">

                <div className="dashboard-header">

                    <div>

                        <h1>
                            📊 Dashboard
                        </h1>

                        <p>
                            EPOS System Overview
                        </p>

                    </div>

                </div>


                <div className="loading-message">

                    Loading dashboard...

                </div>

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
                    disabled={refreshing}
                >

                    {refreshing
                        ? "⏳ Refreshing..."
                        : "🔄 Refresh Dashboard"}

                </button>

            </div>


            {/* =========================
                ERROR
            ========================= */}

            {error && (

                <div className="error-message">

                    ❌ {error}

                </div>

            )}


            {/* =========================
                SUMMARY CARDS
            ========================= */}

            <div className="dashboard-cards">


                {/* TOTAL SALES */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        💰
                    </div>

                    <div>

                        <h3>
                            Total Sales
                        </h3>

                        <p className="card-amount">
                            Rs.{" "}
                            {dashboard.totalSales.toFixed(2)}
                        </p>

                    </div>

                </div>


                {/* TODAY SALES */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        📅
                    </div>

                    <div>

                        <h3>
                            Today's Sales
                        </h3>

                        <p className="card-amount">
                            Rs.{" "}
                            {dashboard.todaySales.toFixed(2)}
                        </p>

                    </div>

                </div>


                {/* TRANSACTIONS */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        🧾
                    </div>

                    <div>

                        <h3>
                            Total Transactions
                        </h3>

                        <p className="card-number">
                            {dashboard.totalTransactions}
                        </p>

                    </div>

                </div>


                {/* AVERAGE TRANSACTION */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        📈
                    </div>

                    <div>

                        <h3>
                            Average Transaction
                        </h3>

                        <p className="card-amount">
                            Rs.{" "}
                            {averageTransaction.toFixed(2)}
                        </p>

                    </div>

                </div>


                {/* PRODUCTS */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        📦
                    </div>

                    <div>

                        <h3>
                            Total Products
                        </h3>

                        <p className="card-number">
                            {dashboard.totalProducts}
                        </p>

                    </div>

                </div>


                {/* LOW STOCK */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        ⚠️
                    </div>

                    <div>

                        <h3>
                            Low Stock Products
                        </h3>

                        <p className="card-number">
                            {dashboard.lowStockProducts}
                        </p>

                    </div>

                </div>


            </div>


            {/* =========================
                LOW STOCK ALERT
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


                <div className="dashboard-payment-total">

                    <strong>
                        Total Payment Sales
                    </strong>

                    <strong>
                        Rs.{" "}
                        {totalPaymentSales.toFixed(2)}
                    </strong>

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


                {totalPaymentSales === 0 ? (

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
                DAILY SALES
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

                    <div className="daily-sales-chart">

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

                                <Tooltip
                                    formatter={(value, name) => [

                                        `Rs. ${Number(
                                            value
                                        ).toFixed(2)}`,

                                        name === "sales"
                                            ? "Sales"
                                            : "Transactions"

                                    ]}
                                />

                                <Legend />


                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    name="Sales (Rs.)"
                                    stroke="#ec4899"
                                    strokeWidth={3}
                                    activeDot={{
                                        r: 7
                                    }}
                                />


                            </LineChart>

                        </ResponsiveContainer>

                    </div>

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

                    <div className="best-selling-chart">

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

                                <Tooltip
                                    formatter={(value) =>
                                        `${value} units`
                                    }
                                />

                                <Legend />


                                <Bar
                                    dataKey="quantity"
                                    name="Quantity Sold"
                                    fill="#ec4899"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                )}

            </div>


        </div>

    );

}


export default Dashboard;