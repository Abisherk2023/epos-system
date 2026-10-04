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
    const [usersLoading, setUsersLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // FORMAT CURRENCY
    // =========================

    const formatCurrency = (amount) => {
        return Number(amount || 0).toFixed(2);
    };

    // =========================
    // FORMAT DATE
    // =========================

    const formatDateTime = (dateValue) => {
        if (!dateValue) {
            return "N/A";
        }

        const dateObject = new Date(dateValue);

        if (Number.isNaN(dateObject.getTime())) {
            return "N/A";
        }

        return dateObject.toLocaleString();
    };

    // =========================
    // LOAD CASHIERS
    // =========================

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);

            const response = await api.get("/users");

            setUsers(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to load users:",
                error
            );

            setUsers([]);
        } finally {
            setUsersLoading(false);
        }
    };

    // =========================
    // LOAD SALES REPORT
    // =========================

    const fetchReport = async (
        customFilters = null
    ) => {
        try {
            const params = {};

            const filters =
                customFilters || {
                    date,
                    userId,
                    paymentMethod
                };

            if (filters.date) {
                params.date = filters.date;
            }

            if (filters.userId) {
                params.user_id = filters.userId;
            }

            if (filters.paymentMethod) {
                params.payment_method =
                    filters.paymentMethod;
            }

            const response = await api.get(
                "/sales/report",
                { params }
            );

            setReport(response.data);

            return response.data;
        } catch (error) {
            console.error(
                "Failed to load sales report:",
                error
            );

            throw error;
        }
    };

    // =========================
    // LOAD PRODUCT SALES REPORT
    // =========================

    const fetchProductReport = async (
        customDate = date
    ) => {
        try {
            const params = {};

            if (customDate) {
                params.date = customDate;
            }

            const response = await api.get(
                "/sales/product-report",
                { params }
            );

            setProductReport(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

            return response.data;
        } catch (error) {
            console.error(
                "Failed to load product report:",
                error
            );

            throw error;
        }
    };

    // =========================
    // LOAD ALL REPORT DATA
    // =========================

    const loadReports = async (
        customFilters = null
    ) => {
        try {
            setLoading(true);
            setError("");

            const filters =
                customFilters || {
                    date,
                    userId,
                    paymentMethod
                };

            await Promise.all([
                fetchReport(filters),
                fetchProductReport(filters.date)
            ]);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load sales report."
            );
        } finally {
            setLoading(false);
        }
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
        loadReports({
            date,
            userId,
            paymentMethod
        });
    };

    // =========================
    // CLEAR FILTERS
    // =========================

    const clearFilters = () => {
        setDate("");
        setUserId("");
        setPaymentMethod("");

        loadReports({
            date: "",
            userId: "",
            paymentMethod: ""
        });
    };

    // =========================
    // EXPORT CSV
    // =========================

    const exportCSV = () => {
        if (
            !report ||
            !Array.isArray(report.sales) ||
            report.sales.length === 0
        ) {
            alert(
                "No sales data available to export."
            );
            return;
        }

        const headers = [
            "Sale ID",
            "Invoice Number",
            "Date",
            "Cashier",
            "Total Amount",
            "Payment Method"
        ];

        const rows = report.sales.map(
            (sale) => [
                sale.id,
                sale.invoice_number ||
                    `SALE-${sale.id}`,
                formatDateTime(
                    sale.created_at
                ),
                sale.cashier_name ||
                    "Unknown",
                formatCurrency(
                    sale.total_amount
                ),
                sale.payment_method ||
                    "N/A"
            ]
        );

        const csvContent = [
            headers,
            ...rows
        ]
            .map((row) =>
                row
                    .map((value) => {
                        const text =
                            String(value ?? "");

                        return `"${text.replace(
                            /"/g,
                            '""'
                        )}"`;
                    })
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `epos-sales-report-${
                date || "all"
            }.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    // =========================
    // PRINT REPORT
    // =========================

    const printReport = () => {
        window.print();
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
                        disabled={usersLoading}
                    >

                        <option value="">
                            All Cashiers
                        </option>

                        {users.map(
                            (user) => (

                                <option
                                    key={user.id}
                                    value={user.id}
                                >
                                    {user.name}
                                </option>

                            )
                        )}

                    </select>

                </div>

                {/* PAYMENT METHOD */}

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
                        disabled={loading}
                    >
                        🔍{" "}
                        {loading
                            ? "Loading..."
                            : "Apply Filters"}
                    </button>

                    <button
                        className="secondary-button"
                        onClick={
                            clearFilters
                        }
                        disabled={loading}
                    >
                        🔄 Clear
                    </button>

                    <button
                        className="secondary-button"
                        onClick={
                            exportCSV
                        }
                        disabled={
                            loading ||
                            !report ||
                            !report.sales ||
                            report.sales.length ===
                                0
                        }
                    >
                        📥 Export CSV
                    </button>

                    <button
                        className="secondary-button"
                        onClick={
                            printReport
                        }
                        disabled={
                            loading ||
                            !report
                        }
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
                                    {formatCurrency(
                                        report.totalSales
                                    )}
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
                                    {formatCurrency(
                                        report.cashSales
                                    )}
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
                                    {formatCurrency(
                                        report.cardSales
                                    )}
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
                                    {date
                                        ? `Filtered date: ${date}`
                                        : "All sales"}
                                </p>

                            </div>

                        </div>

                        {!report.sales ||
                        report.sales.length ===
                            0 ? (

                            <div className="empty-message">

                                No sales found for
                                the selected filters.

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
                                                Invoice
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

                                                        <strong>
                                                            {
                                                                sale.invoice_number ||
                                                                `SALE-${sale.id}`
                                                            }
                                                        </strong>

                                                    </td>

                                                    <td>

                                                        {
                                                            formatDateTime(
                                                                sale.created_at
                                                            )
                                                        }

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
                                                                String(
                                                                    sale.payment_method ||
                                                                    ""
                                                                ).toLowerCase() ===
                                                                "cash"
                                                                    ? "payment-cash"
                                                                    : "payment-card"
                                                            }
                                                        >
                                                            {String(
                                                                sale.payment_method ||
                                                                "N/A"
                                                            ).toUpperCase()}
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <strong>
                                                            Rs.{" "}
                                                            {formatCurrency(
                                                                sale.total_amount
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
                                    the selected period.
                                </p>

                            </div>

                        </div>

                        {productReport.length ===
                        0 ? (

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
                                            (
                                                product
                                            ) => (

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
                                                            {formatCurrency(
                                                                product.total_revenue
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