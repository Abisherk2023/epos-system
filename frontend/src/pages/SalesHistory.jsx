import { useEffect, useState } from "react";
import api from "../api/axios";

function SalesHistory() {
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [saleItems, setSaleItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // =========================
    // FETCH SALES
    // =========================

    const fetchSales = async () => {
        try {
            setLoading(true);

            const response = await api.get("/sales");

            setSales(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "Error fetching sales:",
                error
            );

            alert("Failed to load sales history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    // =========================
    // VIEW SALE DETAILS
    // =========================

    const viewSaleDetails = async (saleId) => {
        try {
            setDetailsLoading(true);

            const response = await api.get(
                `/sales/${saleId}`
            );

            const items = Array.isArray(response.data)
                ? response.data
                : [];

            setSaleItems(items);
            setSelectedSale(saleId);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } catch (error) {
            console.error(
                "Error fetching sale details:",
                error
            );

            alert("Failed to load sale details.");
        } finally {
            setDetailsLoading(false);
        }
    };

    // =========================
    // CLOSE DETAILS
    // =========================

    const closeDetails = () => {
        setSelectedSale(null);
        setSaleItems([]);
    };

    // =========================
    // SELECTED SALE
    // =========================

    const selectedSaleData = sales.find(
        (sale) =>
            Number(sale.id) ===
            Number(selectedSale)
    );

    // =========================
    // SALE DETAIL DATA
    // =========================

    const detailData =
        saleItems.length > 0
            ? saleItems[0]
            : null;

    // =========================
    // RECEIPT CALCULATIONS
    // =========================

    const totalItems = saleItems.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );

    const receiptTotal =
        detailData?.total_amount !== undefined
            ? Number(detailData.total_amount)
            : Number(
                selectedSaleData?.total_amount || 0
            );

    const paymentMethod =
        detailData?.payment_method ||
        selectedSaleData?.payment_method ||
        "N/A";

    const saleDate =
        detailData?.created_at ||
        selectedSaleData?.created_at ||
        null;

    const invoiceNumber =
        detailData?.invoice_number ||
        selectedSaleData?.invoice_number ||
        `SALE-${selectedSale || ""}`;

    const cashierName =
        detailData?.cashier_name ||
        selectedSaleData?.cashier_name ||
        "Unknown";

    // =========================
    // FORMAT CURRENCY
    // =========================

    const formatCurrency = (amount) => {
        return Number(amount || 0).toFixed(2);
    };

    // =========================
    // FORMAT DATE
    // =========================

    const formatDateTime = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleString();
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString();
    };

    const formatTime = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleTimeString();
    };

    return (
        <div className="sales-history-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="sales-history-header">

                <div>
                    <h2>
                        🧾 Sales History
                    </h2>

                    <p>
                        View previous sales and
                        transaction details.
                    </p>
                </div>

                <div className="sales-count">
                    {sales.length} Sales
                </div>

            </div>

            {/* =========================
                SALES LIST
            ========================= */}

            <div className="sales-list-card">

                <div className="sales-list-header">

                    <h3>
                        📋 Sales Transactions
                    </h3>

                    <span>
                        {sales.length} transactions
                    </span>

                </div>

                {loading ? (

                    <div className="empty-state">
                        <p>
                            Loading sales...
                        </p>
                    </div>

                ) : sales.length === 0 ? (

                    <div className="empty-state">
                        <p>
                            No sales found.
                        </p>
                    </div>

                ) : (

                    <div className="table-container">

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
                                        Total
                                    </th>

                                    <th>
                                        Payment Method
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {sales.map((sale) => (

                                    <tr
                                        key={sale.id}
                                    >

                                        <td>
                                            <strong>
                                                #{sale.id}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong>
                                                {sale.invoice_number ||
                                                    `SALE-${sale.id}`}
                                            </strong>
                                        </td>

                                        <td>
                                            {formatDateTime(
                                                sale.created_at
                                            )}
                                        </td>

                                        <td>
                                            <strong>
                                                👤{" "}
                                                {sale.cashier_name ||
                                                    "Unknown"}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong>
                                                Rs.{" "}
                                                {formatCurrency(
                                                    sale.total_amount
                                                )}
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

                                            <button
                                                onClick={() =>
                                                    viewSaleDetails(
                                                        sale.id
                                                    )
                                                }
                                                className="view-sale-button"
                                                disabled={
                                                    detailsLoading
                                                }
                                            >
                                                👁️ View Details
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* =================================================
                SALE DETAILS
            ================================================= */}

            {selectedSale && (

                <div className="sale-details-card">

                    <div className="sale-details-header">

                        <div>

                            <h3>
                                🧾 Sale #
                                {selectedSale} Details
                            </h3>

                            <p>
                                Items included in this
                                transaction.
                            </p>

                        </div>

                        <button
                            onClick={closeDetails}
                            className="close-details-button"
                        >
                            ✕ Close
                        </button>

                    </div>

                    {/* =========================
                        LOADING
                    ========================= */}

                    {detailsLoading ? (

                        <div className="empty-state">

                            <p>
                                Loading sale details...
                            </p>

                        </div>

                    ) : saleItems.length > 0 ? (

                        <>

                            {/* =========================
                                SALE ITEMS
                            ========================= */}

                            <div className="table-container">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                Product
                                            </th>

                                            <th>
                                                Quantity
                                            </th>

                                            <th>
                                                Price
                                            </th>

                                            <th>
                                                Subtotal
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {saleItems.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        item.id ||
                                                        `${item.product_id}-${index}`
                                                    }
                                                >

                                                    <td>
                                                        <strong>
                                                            {
                                                                item.product_name
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            item.quantity
                                                        }
                                                    </td>

                                                    <td>
                                                        Rs.{" "}
                                                        {formatCurrency(
                                                            item.price
                                                        )}
                                                    </td>

                                                    <td>
                                                        Rs.{" "}
                                                        {formatCurrency(
                                                            item.subtotal
                                                        )}
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {/* =================================================
                                PROFESSIONAL RECEIPT
                            ================================================= */}

                            <div className="receipt-container">

                                <div
                                    id="receipt"
                                    className="receipt"
                                >

                                    {/* =========================
                                        RECEIPT HEADER
                                    ========================= */}

                                    <div className="receipt-header">

                                        <div className="receipt-logo">
                                            🛒
                                        </div>

                                        <h2>
                                            EPOS SYSTEM
                                        </h2>

                                        <p className="receipt-subtitle">
                                            SALES RECEIPT
                                        </p>

                                        <p className="receipt-business-info">
                                            Point of Sale System
                                        </p>

                                    </div>

                                    <hr />

                                    {/* =========================
                                        SALE INFORMATION
                                    ========================= */}

                                    <div className="receipt-info">

                                        <div className="receipt-info-row">

                                            <span>
                                                Sale No:
                                            </span>

                                            <strong>
                                                #{selectedSale}
                                            </strong>

                                        </div>

                                        <div className="receipt-info-row">

                                            <span>
                                                Invoice:
                                            </span>

                                            <strong>
                                                {invoiceNumber}
                                            </strong>

                                        </div>

                                        <div className="receipt-info-row">

                                            <span>
                                                Date:
                                            </span>

                                            <span>
                                                {formatDate(
                                                    saleDate
                                                )}
                                            </span>

                                        </div>

                                        <div className="receipt-info-row">

                                            <span>
                                                Time:
                                            </span>

                                            <span>
                                                {formatTime(
                                                    saleDate
                                                )}
                                            </span>

                                        </div>

                                        <div className="receipt-info-row">

                                            <span>
                                                Cashier:
                                            </span>

                                            <span>
                                                {cashierName}
                                            </span>

                                        </div>

                                    </div>

                                    <hr />

                                    {/* =========================
                                        PRODUCTS
                                    ========================= */}

                                    <div className="receipt-table-container">

                                        <table>

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Product
                                                    </th>

                                                    <th>
                                                        Qty
                                                    </th>

                                                    <th>
                                                        Price
                                                    </th>

                                                    <th>
                                                        Amount
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {saleItems.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <tr
                                                            key={
                                                                item.id ||
                                                                `${item.product_id}-receipt-${index}`
                                                            }
                                                        >

                                                            <td>
                                                                {
                                                                    item.product_name
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    item.quantity
                                                                }
                                                            </td>

                                                            <td>
                                                                Rs.{" "}
                                                                {formatCurrency(
                                                                    item.price
                                                                )}
                                                            </td>

                                                            <td>
                                                                Rs.{" "}
                                                                {formatCurrency(
                                                                    item.subtotal
                                                                )}
                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                    <hr />

                                    {/* =========================
                                        SUMMARY
                                    ========================= */}

                                    <div className="receipt-summary">

                                        <div className="receipt-summary-row">

                                            <span>
                                                Total Items
                                            </span>

                                            <span>
                                                {totalItems}
                                            </span>

                                        </div>

                                        <div className="receipt-total">

                                            <span>
                                                TOTAL
                                            </span>

                                            <span>
                                                Rs.{" "}
                                                {formatCurrency(
                                                    receiptTotal
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                    {/* =========================
                                        PAYMENT
                                    ========================= */}

                                    <div className="receipt-payment">

                                        <div className="receipt-payment-row">

                                            <span>
                                                Payment Method
                                            </span>

                                            <strong>
                                                {String(
                                                    paymentMethod
                                                ).toUpperCase()}
                                            </strong>

                                        </div>

                                    </div>

                                    <hr />

                                    {/* =========================
                                        FOOTER
                                    ========================= */}

                                    <div className="receipt-footer">

                                        <p>
                                            Thank you for your purchase!
                                        </p>

                                        <p className="receipt-footer-small">
                                            Please keep this receipt
                                            for your records.
                                        </p>

                                        <p className="receipt-footer-small">
                                            EPOS System
                                        </p>

                                    </div>

                                </div>

                                {/* =========================
                                    RECEIPT ACTIONS
                                ========================= */}

                                <div className="receipt-actions">

                                    <button
                                        onClick={() =>
                                            window.print()
                                        }
                                        className="receipt-print-button"
                                    >
                                        🖨️ Print Receipt
                                    </button>

                                    <button
                                        onClick={closeDetails}
                                        className="receipt-close-button"
                                    >
                                        ✕ Close Receipt
                                    </button>

                                </div>

                            </div>

                        </>

                    ) : (

                        <div className="empty-state">

                            <p>
                                No items found for
                                this sale.
                            </p>

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}

export default SalesHistory;