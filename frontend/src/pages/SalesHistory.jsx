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
            const response = await api.get(`/sales/${saleId}`);

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

    return (
        <div className="sales-history-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="sales-history-header">

                <div>
                    <h2>🧾 Sales History</h2>

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
                                    <th>Sale ID</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>
                                        Payment Method
                                    </th>
                                    <th>Action</th>
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
                                                    #
                                                    {sale.id}
                                                </strong>
                                            </td>

                                            <td>
                                                {new Date(
                                                    sale.created_at
                                                ).toLocaleString()}
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
                                                    {sale.payment_method}
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


            {/* =========================
                SALE DETAILS
            ========================= */}

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
                                        (item) => (

                                            <tr
                                                key={
                                                    item.product_id
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
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>

                                                <td>
                                                    Rs.{" "}
                                                    {Number(
                                                        item.subtotal
                                                    ).toFixed(
                                                        2
                                                    )}
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


                    {/* =========================
                        SALE SUMMARY
                    ========================= */}

                    {saleItems.length > 0 && (

                        <div className="sale-summary">

                            <div className="sale-summary-row">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    Rs.{" "}
                                    {Number(
                                        saleItems[0]
                                            .total_amount
                                    ).toFixed(2)}
                                </strong>

                            </div>

                            <div className="sale-summary-row">

                                <span>
                                    Payment
                                </span>

                                <span
                                    className={
                                        saleItems[0]
                                            .payment_method
                                            ?.toLowerCase() ===
                                        "cash"
                                            ? "payment-cash"
                                            : "payment-card"
                                    }
                                >
                                    {
                                        saleItems[0]
                                            .payment_method
                                    }
                                </span>

                            </div>


                            {/* =========================
                                ACTIONS
                            ========================= */}

                            <div className="sale-detail-actions">

                                <button
                                    onClick={() =>
                                        window.print()
                                    }
                                    className="print-sale-button"
                                >
                                    🖨️ Print Receipt
                                </button>

                                <button
                                    onClick={
                                        closeDetails
                                    }
                                    className="close-sale-button"
                                >
                                    Close Details
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