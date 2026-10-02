import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import api from "../api/axios";

function Dashboard() {
    const [dashboard, setDashboard] = useState({
        totalSales: 0,
        todaySales: 0,
        totalProducts: 0,
        lowStockProducts: 0
    });

    const [lowStockProducts, setLowStockProducts] = useState([]);

    const [salesReport, setSalesReport] = useState({
        totalTransactions: 0,
        totalSales: 0,
        todaySales: 0,
        cashSales: 0,
        cardSales: 0
    });

    const [productReport, setProductReport] = useState([]);

    const [dailySales, setDailySales] = useState([]);

    const [selectedDate, setSelectedDate] = useState("");

    // =========================
    // PAYMENT CHART DATA
    // =========================

    const paymentChartData = [
        {
            name: "Cash",
            value: Number(salesReport.cashSales)
        },
        {
            name: "Card",
            value: Number(salesReport.cardSales)
        }
    ];

    // =========================
    // FETCH DASHBOARD
    // =========================

    const fetchDashboard = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/sales/dashboard"
            );

            setDashboard(response.data);
        } catch (error) {
            console.error(
                "Error fetching dashboard:",
                error
            );
        }
    };

    // =========================
    // FETCH SALES REPORT
    // =========================

    const fetchSalesReport = async (date = "") => {
        try {
            const url = date
                ? `http://localhost:5000/api/sales/report?date=${date}`
                : "http://localhost:5000/api/sales/report";

            const response = await axios.get(url);

            setSalesReport(response.data);
        } catch (error) {
            console.error(
                "Error fetching sales report:",
                error
            );
        }
    };

    // =========================
    // FETCH PRODUCT REPORT
    // =========================

    const fetchProductReport = async (date = "") => {
        try {
            const url = date
                ? `http://localhost:5000/api/sales/product-report?date=${date}`
                : "http://localhost:5000/api/sales/product-report";

            const response = await axios.get(url);

            setProductReport(response.data);
        } catch (error) {
            console.error(
                "Error fetching product sales report:",
                error
            );
        }
    };

    // =========================
    // FETCH DAILY SALES
    // =========================

    const fetchDailySales = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/sales/daily-report"
            );

            setDailySales(response.data);
        } catch (error) {
            console.error(
                "Error fetching daily sales:",
                error
            );
        }
    };

    // =========================
    // FETCH LOW STOCK PRODUCTS
    // =========================

    const fetchLowStockProducts = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/products"
            );

            const lowStock = response.data.filter(
                (product) =>
                    Number(product.stock_quantity) <= 5
            );

            setLowStockProducts(lowStock);
        } catch (error) {
            console.error(
                "Error fetching products:",
                error
            );
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {
        fetchDashboard();
        fetchLowStockProducts();
        fetchSalesReport();
        fetchProductReport();
        fetchDailySales();
    }, []);

    // =========================
    // DATE CHANGE
    // =========================

    const handleDateChange = (e) => {
        const date = e.target.value;

        setSelectedDate(date);

        fetchSalesReport(date);
        fetchProductReport(date);
    };

    // =========================
    // SHOW ALL SALES
    // =========================

    const handleShowAllSales = () => {
        setSelectedDate("");

        fetchSalesReport();
        fetchProductReport();
    };

    return (
        <div className="dashboard-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="dashboard-header">

                <h2>
                    📊 EPOS Dashboard
                </h2>

                <p>
                    Monitor your sales, products and
                    inventory.
                </p>

            {/* =========================
    TOP 5 PRODUCTS
========================= */}

<section className="dashboard-section">

    <div className="section-header">

        <h3>
            🏆 Top 5 Products
        </h3>

    </div>

    {productReport.length === 0 ? (

        <div className="empty-state">

            <p>
                No product sales data found.
            </p>

        </div>

    ) : (

        <div className="top-products-list">

            {productReport
                .slice(0, 5)
                .map((product, index) => (

                    <div
                        className="top-product-item"
                        key={product.id}
                    >

                        <div className="top-product-rank">
                            #{index + 1}
                        </div>

                        <div className="top-product-info">

                            <strong>
                                {product.name}
                            </strong>

                            <span>
                                SKU: {product.sku}
                            </span>

                        </div>

                        <div className="top-product-sales">

                            <strong>
                                {product.quantity_sold}
                            </strong>

                            <span>
                                units sold
                            </span>

                        </div>

                        <div className="top-product-revenue">

                            <strong>
                                Rs.{" "}
                                {Number(
                                    product.total_revenue
                                ).toFixed(2)}
                            </strong>

                            <span>
                                revenue
                            </span>

                        </div>

                    </div>

                ))}

        </div>

    )}

</section>
            
            </div>


            {/* =========================
                DATE FILTER
            ========================= */}

            <div className="dashboard-filter-card">

                <h3>
                    📅 Sales Report
                </h3>

                <div className="dashboard-filter">

                    <div className="date-field">

                        <label htmlFor="reportDate">
                            Select Date
                        </label>

                        <input
                            id="reportDate"
                            name="reportDate"
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                        />

                    </div>

                    <div className="filter-button">

                        <button
                            className="show-all-button"
                            onClick={handleShowAllSales}
                        >
                            Show All Sales
                        </button>

                    </div>

                </div>

                <p className="report-info">

                    {selectedDate
                        ? `Showing sales for ${selectedDate}`
                        : "Showing all sales"}

                </p>

            </div>


            {/* =========================
                METRICS CARDS
            ========================= */}

            <div className="dashboard-cards">

                <div className="dashboard-card">

                    <div className="card-icon">
                        💰
                    </div>

                    <h3>
                        Total Sales
                    </h3>

                    <p className="card-amount">
                        Rs.{" "}
                        {Number(
                            salesReport.totalSales
                        ).toFixed(2)}
                    </p>

                </div>


                <div className="dashboard-card">

                    <div className="card-icon">
                        📈
                    </div>

                    <h3>
                        Today's Sales
                    </h3>

                    <p className="card-amount">

                        Rs.{" "}
                        {Number(
                            selectedDate
                                ? salesReport.totalSales
                                : dashboard.todaySales
                        ).toFixed(2)}

                    </p>

                </div>


                <div className="dashboard-card">

                    <div className="card-icon">
                        📦
                    </div>

                    <h3>
                        Total Products
                    </h3>

                    <p className="card-number">
                        {dashboard.totalProducts}
                    </p>

                </div>


                <div className="dashboard-card">

                    <div className="card-icon">
                        ⚠️
                    </div>

                    <h3>
                        Low Stock Products
                    </h3>

                    <p className="card-number">
                        {dashboard.lowStockProducts}
                    </p>

                </div>


                <div className="dashboard-card">

                    <div className="card-icon">
                        🧾
                    </div>

                    <h3>
                        Total Transactions
                    </h3>

                    <p className="card-number">
                        {salesReport.totalTransactions}
                    </p>

                </div>


                <div className="dashboard-card">

                    <div className="card-icon">
                        💵
                    </div>

                    <h3>
                        Cash Sales
                    </h3>

                    <p className="card-amount">
                        Rs.{" "}
                        {Number(
                            salesReport.cashSales
                        ).toFixed(2)}
                    </p>

                </div>


                <div className="dashboard-card">

                    <div className="card-icon">
                        💳
                    </div>

                    <h3>
                        Card Sales
                    </h3>

                    <p className="card-amount">
                        Rs.{" "}
                        {Number(
                            salesReport.cardSales
                        ).toFixed(2)}
                    </p>

                </div>

            </div>


            {/* =========================
                PRODUCT SALES REPORT
            ========================= */}

            <section className="dashboard-section">

                <div className="section-header">

                    <h3>
                        📊 Product Sales Report
                    </h3>

                </div>

                {productReport.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            No product sales found.
                        </p>

                    </div>

                ) : (

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Quantity Sold</th>
                                    <th>Total Revenue</th>
                                </tr>

                            </thead>

                            <tbody>

                                {productReport.map(
                                    (product) => (

                                        <tr
                                            key={product.id}
                                        >

                                            <td>
                                                {product.name}
                                            </td>

                                            <td>
                                                {product.sku}
                                            </td>

                                            <td>
                                                {
                                                    product.quantity_sold
                                                }
                                            </td>

                                            <td>
                                                Rs.{" "}
                                                {Number(
                                                    product.total_revenue
                                                ).toFixed(2)}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =========================
                LOW STOCK PRODUCTS
            ========================= */}

            <section className="dashboard-section">

                <div className="section-header">

                    <h3>
                        ⚠️ Low Stock Products
                    </h3>

                    <span className="stock-count">
                        {lowStockProducts.length} items
                    </span>

                </div>

                {lowStockProducts.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            ✅ No low stock products.
                        </p>

                    </div>

                ) : (

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Stock</th>
                                </tr>

                            </thead>

                            <tbody>

                                {lowStockProducts.map(
                                    (product) => (

                                        <tr
                                            key={product.id}
                                        >

                                            <td>
                                                {product.id}
                                            </td>

                                            <td>
                                                {product.name}
                                            </td>

                                            <td>
                                                {product.sku}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        Number(
                                                            product.stock_quantity
                                                        ) <= 2
                                                            ? "stock-danger"
                                                            : "stock-warning"
                                                    }
                                                >
                                                    {
                                                        product.stock_quantity
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =========================
                PAYMENT METHOD SALES
            ========================= */}

            <section className="dashboard-section">

                <div className="section-header">

                    <h3>
                        💳 Payment Method Sales
                    </h3>

                </div>

                <div className="payment-chart-container">

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <PieChart>

                            <Pie
                                data={paymentChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                label
                            >

                                {paymentChartData.map(
                                    (entry, index) => (

                                        <Cell
                                            key={`cell-${index}`}
                                        />

                                    )
                                )}

                            </Pie>

                            <Tooltip
                                formatter={(value) =>
                                    `Rs. ${Number(
                                        value
                                    ).toFixed(2)}`
                                }
                            />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </section>


            {/* =========================
                DAILY SALES
            ========================= */}

            <section className="dashboard-section">

                <div className="section-header">

                    <h3>
                        📈 Daily Sales
                    </h3>

                </div>

                {dailySales.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            No daily sales data found.
                        </p>

                    </div>

                ) : (

                    <div className="daily-sales-chart">

                        <ResponsiveContainer
                            width="100%"
                            height={350}
                        >

                            <BarChart
                                data={dailySales}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    left: 10,
                                    bottom: 20
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="sale_date"
                                />

                                <YAxis />

                                <Tooltip
                                    formatter={(value) =>
                                        `Rs. ${Number(
                                            value
                                        ).toFixed(2)}`
                                    }
                                />

                                <Legend />

                                <Bar
                                    dataKey="total_sales"
                                    name="Sales"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                )}

            </section>


            {/* =========================
                BEST-SELLING PRODUCTS
            ========================= */}

            <section className="dashboard-section">

                <div className="section-header">

                    <h3>
                        🏆 Best-Selling Products
                    </h3>

                </div>

                {productReport.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            No product sales data found.
                        </p>

                    </div>

                ) : (

                    <div className="best-selling-chart">

                        <ResponsiveContainer
                            width="100%"
                            height={400}
                        >

                            <BarChart
                                data={productReport}
                                layout="vertical"
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 30,
                                    bottom: 20
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    type="number"
                                />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={120}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        `${value} units`
                                    }
                                />

                                <Legend />

                                <Bar
                                    dataKey="quantity_sold"
                                    name="Quantity Sold"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                )}

            </section>

        </div>
    );
}

export default Dashboard;