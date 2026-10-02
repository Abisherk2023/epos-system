import { useEffect, useState } from "react";
import api from "../api/axios";

function SalesHistory() {

    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [saleItems, setSaleItems] = useState([]);

    // =========================
    // FETCH SALES
    // =========================

    const fetchSales = async () => {
        try {

            const response = await api.get("/sales");

            setSales(response.data);

        } catch (error) {

            console.error(
                "Error fetching sales:",
                error
            );

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

            const response = await api.get(
                `/sales/${saleId}`
            );

            setSaleItems(response.data);

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

            alert(
                "Failed to load sale details"
            );

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
    // SELECTED SALE INFORMATION
    // =========================

    const selectedSaleData = sales.find(
        (sale) =>
            Number(sale.id) ===
            Number(selectedSale)
    );


    // =========================
    // RECEIPT CALCULATIONS
    // =========================

    const totalItems = saleItems.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );


    const receiptTotal =
        saleItems.length > 0
            ? Number(
                saleItems[0].total_amount || 0
            )
            : Number(
                selectedSaleData?.total_amount || 0
            );


    const paymentMethod =
        saleItems.length > 0
            ? saleItems[0].payment_method
            : selectedSaleData?.payment_method;


    const saleDate =
        saleItems.length > 0
            ? saleItems[0].created_at
            : selectedSaleData?.created_at;


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


                {sales.length === 0 ? (

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

                                {sales.map(
                                    (sale) => (

                                        <tr
                                            key={
                                                sale.id
                                            }
                                        >
<td>
    <strong>
        #{sale.id}
    </strong>
</td>

<td>
    {new Date(
        sale.created_at
    ).toLocaleString()}
</td>

<td>
    <strong>
        👤 {sale.cashier_name || "Unknown"}
    </strong>
</td>

<td>
    <strong>
        Rs.{" "}
        {Number(
            sale.total_amount
        ).toFixed(2)}
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

                                                <button
                                                    onClick={() =>
                                                        viewSaleDetails(
                                                            sale.id
                                                        )
                                                    }
                                                    className="view-sale-button"
                                                >

                                                    👁️ View Details

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

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
                                {selectedSale}
                                {" "}Details
                            </h3>

                            <p>
                                Items included in this
                                transaction.
                            </p>

                        </div>


                        <button
                            onClick={
                                closeDetails
                            }
                            className="close-details-button"
                        >

                            ✕ Close

                        </button>

                    </div>


                    {/* =========================
                        SALE ITEMS
                    ========================= */}

                    {saleItems.length > 0 ? (

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
                                        (item, index) => (

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

                                                    {Number(
                                                        item.price
                                                    ).toFixed(2)}

                                                </td>


                                                <td>

                                                    Rs.{" "}

                                                    {Number(
                                                        item.subtotal
                                                    ).toFixed(2)}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="empty-state">

                            <p>
                                No items found for
                                this sale.
                            </p>

                        </div>

                    )}


                    {/* =================================================
                        PROFESSIONAL RECEIPT
                    ================================================= */}

                    {saleItems.length > 0 && (

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
                                            Date:
                                        </span>

                                        <span>
                                            {saleDate
                                                ? new Date(
                                                    saleDate
                                                ).toLocaleDateString()
                                                : new Date().toLocaleDateString()}
                                        </span>

                                    </div>


                                    <div className="receipt-info-row">

                                        <span>
                                            Time:
                                        </span>

                                        <span>
                                            {saleDate
                                                ? new Date(
                                                    saleDate
                                                ).toLocaleTimeString()
                                                : new Date().toLocaleTimeString()}
                                        </span>

                                    </div>


                                    <div className="receipt-info-row">

                                        <span>
                                            Cashier:
                                        </span>

                                        <span>
                                            EPOS User
                                        </span>

                                    </div>

                                    <div className="receipt-info-row">
    <span>
        Invoice:
    </span>

    <span>
        {selectedSaleData &&
            `INV-${new Date(
                selectedSaleData.created_at
            )
                .toISOString()
                .slice(0, 10)
                .replace(/-/g, "")}-${String(
                selectedSaleData.id
            ).padStart(4, "0")}`}
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
                                                (item, index) => (

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
                                                            {Number(
                                                                item.price
                                                            ).toFixed(2)}
                                                        </td>

                                                        <td>
                                                            Rs.{" "}
                                                            {Number(
                                                                item.subtotal
                                                            ).toFixed(2)}
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
                                            {receiptTotal.toFixed(2)}
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
                                            {paymentMethod
                                                ? paymentMethod.toUpperCase()
                                                : "N/A"}
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
                                    onClick={
                                        closeDetails
                                    }
                                    className="receipt-close-button"
                                >
                                    ✕ Close Receipt
                                </button>

                            </div>

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}

export default SalesHistory;