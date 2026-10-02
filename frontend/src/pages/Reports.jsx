import { useEffect, useState } from "react";
import api from "../api/axios";

function Reports() {

    const [report, setReport] = useState(null);

    const [users, setUsers] = useState([]);

    const [date, setDate] = useState("");
    const [userId, setUserId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    const [productReport, setProductReport] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const exportCSV = () => {

    if (!report || !report.sales || report.sales.length === 0) {
        alert("No sales data available to export.");
        return;
    }

    const headers = [
        "Sale ID",
        "Date",
        "Cashier",
        "Total Amount",
        "Payment Method"
    ];

    const rows = report.sales.map((sale) => [
        sale.id,
        new Date(sale.created_at).toLocaleString(),
        sale.cashier_name || "Unknown",
        Number(sale.total_amount).toFixed(2),
        sale.payment_method
    ]);

    const csvContent = [
        headers,
        ...rows
    ]
        .map((row) =>
            row
                .map((value) =>
                    `"${String(value).replace(/"/g, '""')}"`
                )
                .join(",")
        )
        .join("\n");

    const blob = new Blob(
        [csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `epos-sales-report-${date || "all"}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};
    // =========================
    // LOAD CASHIERS
    // =========================

    const fetchUsers = async () => {

        try {

            const response =
                await api.get("/users");

            setUsers(response.data);

        } catch (error) {

            console.error(
                "Failed to load users:",
                error
            );

        }

    };

    // =========================
    // LOAD SALES REPORT
    // =========================

    const fetchReport = async () => {

        try {

            setLoading(true);
            setError("");

            const params = {};

            if (date) {
                params.date = date;
            }

            if (userId) {
                params.user_id = userId;
            }

            if (paymentMethod) {
                params.payment_method =
                    paymentMethod;
            }

            const response =
                await api.get(
                    "/sales/report",
                    { params }
                );

            setReport(response.data);

        } catch (error) {

            console.error(
                "Failed to load report:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load sales report"
            );

        } finally {

            setLoading(false);

        }

    };

    // =========================
    // LOAD PRODUCT SALES REPORT
    // =========================

    const fetchProductReport = async () => {

        try {

            const params = {};

            if (date) {
                params.date = date;
            }

            const response =
                await api.get(
                    "/sales/product-report",
                    { params }
                );

            setProductReport(
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to load product report:",
                error
            );

        }

    };

    // =========================
    // LOAD ALL REPORT DATA
    // =========================

    const loadReports = async () => {

        await Promise.all([
            fetchReport(),
            fetchProductReport()
        ]);

    };

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        fetchUsers();
        loadReports();

    }, []);

    // =========================
    // APPLY FILTERS
    // =========================

    const handleApplyFilters = () => {

        loadReports();

    };

    // =========================
    // CLEAR FILTERS
    // =========================

    const clearFilters = async () => {

        setDate("");
        setUserId("");
        setPaymentMethod("");

        // Load all reports without filters
        try {

            setLoading(true);
            setError("");

            const [
                reportResponse,
                productResponse
            ] = await Promise.all([

                api.get("/sales/report"),

                api.get(
                    "/sales/product-report"
                )

            ]);

            setReport(
                reportResponse.data
            );

            setProductReport(
                productResponse.data
            );

        } catch (error) {

            console.error(
                "Failed to clear filters:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load sales report"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="reports-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">

                <div>

                    <h1>
                        📊 Sales Reports
                    </h1>

                    <p>
                        Analyze sales performance,
                        transactions and payments.
                    </p>

                </div>

            </div>

            {/* =========================
                FILTERS
            ========================= */}

            <div className="report-filters">

                {/* DATE */}

                <div className="filter-group">

                    <label>
                        📅 Date
                    </label>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) =>
                            setDate(
                                e.target.value
                            )
                        }
                    />

                </div>

                {/* CASHIER */}

                <div className="filter-group">

                    <label>
                        👤 Cashier
                    </label>

                    <select
                        value={userId}
                        onChange={(e) =>
                            setUserId(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            All Cashiers
                        </option>

                        {users.map((user) => (

                            <option
                                key={user.id}
                                value={user.id}
                            >
                                {user.name}
                            </option>

                        ))}

                    </select>

                </div>

                {/* PAYMENT */}

                <div className="filter-group">

                    <label>
                        💳 Payment Method
                    </label>

                    <select
                        value={paymentMethod}
                        onChange={(e) =>
                            setPaymentMethod(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            All Payments
                        </option>

                        <option value="cash">
                            Cash
                        </option>

                        <option value="card">
                            Card
                        </option>

                    </select>

                </div>

                {/* BUTTONS */}

                <div className="filter-buttons">


                    <button
                        className="primary-button"
                        onClick={
                            handleApplyFilters
                        }
                    >
                        🔍 Apply Filters
                    </button>

                    <button
                        className="secondary-button"
                        onClick={
                            clearFilters
                        }
                    >
                        🔄 Clear
                    </button>

                    <button
    className="secondary-button"
    onClick={exportCSV}
>
    📥 Export CSV
</button>

<button
    className="secondary-button"
    onClick={() => window.print()}
>
    🖨️ Print Report
</button>
                </div>

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
                LOADING
            ========================= */}

            {loading && (

                <div className="loading-message">

                    Loading report...

                </div>

            )}

            {/* =========================
                REPORT CONTENT
            ========================= */}

            {report && !loading && (

                <>

                    {/* =========================
                        SUMMARY CARDS
                    ========================= */}

                    <div className="report-summary">

                        {/* TRANSACTIONS */}

                        <div className="report-card">

                            <div className="report-card-icon">
                                🧾
                            </div>

                            <div>

                                <p>
                                    Transactions
                                </p>

                                <h2>
                                    {
                                        report.totalTransactions
                                    }
                                </h2>

                            </div>

                        </div>

                        {/* TOTAL SALES */}

                        <div className="report-card">

                            <div className="report-card-icon">
                                💰
                            </div>

                            <div>

                                <p>
                                    Total Sales
                                </p>

                                <h2>
                                    Rs.{" "}
                                    {Number(
                                        report.totalSales
                                    ).toFixed(2)}
                                </h2>

                            </div>

                        </div>

                        {/* CASH SALES */}

                        <div className="report-card">

                            <div className="report-card-icon">
                                💵
                            </div>

                            <div>

                                <p>
                                    Cash Sales
                                </p>

                                <h2>
                                    Rs.{" "}
                                    {Number(
                                        report.cashSales
                                    ).toFixed(2)}
                                </h2>

                            </div>

                        </div>

                        {/* CARD SALES */}

                        <div className="report-card">

                            <div className="report-card-icon">
                                💳
                            </div>

                            <div>

                                <p>
                                    Card Sales
                                </p>

                                <h2>
                                    Rs.{" "}
                                    {Number(
                                        report.cardSales
                                    ).toFixed(2)}
                                </h2>

                            </div>

                        </div>

                    </div>

                    {/* =========================
                        SALES DETAILS
                    ========================= */}

                    <div className="report-table-container">

                        <div className="report-table-header">

                            <div>

                                <h2>
                                    📋 Sales Details
                                </h2>

                                <p>
                                    {report.date}
                                </p>

                            </div>

                        </div>

                        {report.sales.length === 0 ? (

                            <div className="empty-message">

                                No sales found
                                for the selected
                                filters.

                            </div>

                        ) : (

                            <div className="table-responsive">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                Sale ID
                                            </th>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Cashier
                                            </th>

                                            <th>
                                                Payment
                                            </th>

                                            <th>
                                                Amount
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {report.sales.map(
                                            (sale) => (

                                                <tr
                                                    key={
                                                        sale.id
                                                    }
                                                >

                                                    <td>

                                                        <strong>
                                                            #
                                                            {
                                                                sale.id
                                                            }
                                                        </strong>

                                                    </td>

                                                    <td>

                                                        {new Date(
                                                            sale.created_at
                                                        ).toLocaleString()}

                                                    </td>

                                                    <td>

                                                        <strong>
                                                            👤{" "}
                                                            {
                                                                sale.cashier_name ||
                                                                "Unknown"
                                                            }
                                                        </strong>

                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                sale.payment_method
                                                                    ?.toLowerCase() ===
                                                                "cash"
                                                                    ? "payment-cash"
                                                                    : "payment-card"
                                                            }
                                                        >

                                                            {
                                                                sale.payment_method
                                                            }

                                                        </span>

                                                    </td>

                                                    <td>

                                                        <strong>
                                                            Rs.{" "}
                                                            {Number(
                                                                sale.total_amount
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </strong>

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
                        PRODUCT SALES REPORT
                    ========================= */}

                    <div className="report-table-container">

                        <div className="report-table-header">

                            <div>

                                <h2>
                                    📦 Product Sales Report
                                </h2>

                                <p>
                                    Products sold during
                                    the selected period
                                </p>

                            </div>

                        </div>

                        {productReport.length === 0 ? (

                            <div className="empty-message">

                                No product sales found.

                            </div>

                        ) : (

                            <div className="table-responsive">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                Product
                                            </th>

                                            <th>
                                                SKU
                                            </th>

                                            <th>
                                                Quantity Sold
                                            </th>

                                            <th>
                                                Revenue
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {productReport.map(
                                            (product) => (

                                                <tr
                                                    key={
                                                        product.id
                                                    }
                                                >

                                                    <td>

                                                        <strong>
                                                            {
                                                                product.name
                                                            }
                                                        </strong>

                                                    </td>

                                                    <td>

                                                        {
                                                            product.sku
                                                        }

                                                    </td>

                                                    <td>

                                                        {
                                                            product.quantity_sold
                                                        }

                                                    </td>

                                                    <td>

                                                        <strong>
                                                            Rs.{" "}
                                                            {Number(
                                                                product.total_revenue
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </strong>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </>

            )}

        </div>

    );

}

export default Reports;