import { useEffect, useState } from "react";
import api from "../api/axios";

function POS() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [amountPaid, setAmountPaid] = useState("");
    const [completedSale, setCompletedSale] = useState(null);

    // =========================
    // GET LOGGED-IN USER
    // =========================

    const getLoggedInUser = () => {
        try {
            const savedUser =
                localStorage.getItem("user");

            if (!savedUser) {
                return null;
            }

            return JSON.parse(savedUser);

        } catch (error) {
            console.error(
                "Failed to read logged-in user:",
                error
            );

            return null;
        }
    };

    // =========================
    // FETCH PRODUCTS
    // =========================

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products");

            setProducts(response.data);

        } catch (error) {
            console.error(
                "Error fetching products:",
                error
            );
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // =========================
    // ADD TO CART
    // =========================

    const addToCart = () => {

        if (!selectedProduct) {
            alert("Please select a product");
            return;
        }

        const product = products.find(
            (p) => p.id === Number(selectedProduct)
        );

        if (!product) {
            return;
        }

        const existingItem = cart.find(
            (item) =>
                item.product_id === product.id
        );

        const currentCartQuantity =
            existingItem
                ? existingItem.quantity
                : 0;

        const requestedQuantity =
            currentCartQuantity +
            Number(quantity);

        if (
            requestedQuantity >
            Number(product.stock_quantity)
        ) {
            alert(
                `Not enough stock!\n\n` +
                `Available stock: ${product.stock_quantity}\n` +
                `Already in cart: ${currentCartQuantity}`
            );

            return;
        }

        if (existingItem) {

            setCart(
                cart.map((item) =>
                    item.product_id === product.id
                        ? {
                              ...item,

                              quantity:
                                  item.quantity +
                                  Number(quantity),

                              subtotal:
                                  (
                                      item.quantity +
                                      Number(quantity)
                                  ) *
                                  Number(item.price)
                          }
                        : item
                )
            );

        } else {

            setCart([
                ...cart,

                {
                    product_id:
                        product.id,

                    name:
                        product.name,

                    price:
                        Number(product.price),

                    quantity:
                        Number(quantity),

                    subtotal:
                        Number(product.price) *
                        Number(quantity)
                }
            ]);
        }

        setSelectedProduct("");
        setQuantity(1);
    };

    // =========================
    // INCREASE QUANTITY
    // =========================

    const increaseQuantity = (productId) => {

        const cartItem = cart.find(
            (item) =>
                item.product_id === productId
        );

        const product = products.find(
            (p) => p.id === productId
        );

        if (!cartItem || !product) {
            return;
        }

        if (
            cartItem.quantity >=
            Number(product.stock_quantity)
        ) {
            alert(
                `Cannot add more.\n\n` +
                `Available stock: ${product.stock_quantity}`
            );

            return;
        }

        setCart(
            cart.map((item) =>
                item.product_id === productId
                    ? {
                          ...item,

                          quantity:
                              item.quantity + 1,

                          subtotal:
                              (item.quantity + 1) *
                              Number(item.price)
                      }
                    : item
            )
        );
    };

    // =========================
    // DECREASE QUANTITY
    // =========================

    const decreaseQuantity = (productId) => {

        const cartItem = cart.find(
            (item) =>
                item.product_id === productId
        );

        if (!cartItem) {
            return;
        }

        if (cartItem.quantity === 1) {
            removeFromCart(productId);
            return;
        }

        setCart(
            cart.map((item) =>
                item.product_id === productId
                    ? {
                          ...item,

                          quantity:
                              item.quantity - 1,

                          subtotal:
                              (item.quantity - 1) *
                              Number(item.price)
                      }
                    : item
            )
        );
    };

    // =========================
    // REMOVE FROM CART
    // =========================

    const removeFromCart = (productId) => {

        setCart(
            cart.filter(
                (item) =>
                    item.product_id !== productId
            )
        );
    };

    // =========================
    // TOTAL
    // =========================

    const total = cart.reduce(
        (sum, item) =>
            sum + Number(item.subtotal),
        0
    );

    // =========================
    // CHANGE
    // =========================

    const change =
        Number(amountPaid || 0) -
        total;

    // =========================
    // CHECKOUT
    // =========================

    const handleCheckout = async () => {

        if (cart.length === 0) {
            alert("Cart is empty");
            return;
        }

        if (!paymentMethod) {
            alert(
                "Please select a payment method"
            );
            return;
        }

        if (
            paymentMethod === "cash" &&
            Number(amountPaid || 0) < total
        ) {
            alert(
                `Insufficient payment!\n\n` +
                `Total: Rs. ${total.toFixed(2)}\n` +
                `Amount Paid: Rs. ${Number(
                    amountPaid || 0
                ).toFixed(2)}`
            );

            return;
        }

        try {

            const response = await api.post(
                "/sales",
                {
                    items: cart,

                    payment_method:
                        paymentMethod
                }
            );

            // Get current logged-in cashier
            const loggedInUser =
                getLoggedInUser();

            // Create completed receipt data
            setCompletedSale({
    saleId:
        response.data.saleId,

    invoiceNumber:
        response.data.invoiceNumber,

                totalAmount:
                    Number(
                        response.data.totalAmount
                    ),

                paymentMethod:
                    paymentMethod,

                amountPaid:
                    paymentMethod === "cash"
                        ? Number(amountPaid)
                        : Number(
                              response.data
                                  .totalAmount
                          ),

                change:
                    paymentMethod === "cash"
                        ? Number(amountPaid) -
                          Number(
                              response.data
                                  .totalAmount
                          )
                        : 0,

                cashierName:
                    loggedInUser?.name ||
                    "Cashier",

                cashierEmail:
                    loggedInUser?.email ||
                    "",

                items:
                    cart.map((item) => ({
                        name:
                            item.name,

                        quantity:
                            item.quantity,

                        price:
                            Number(item.price),

                        subtotal:
                            Number(item.subtotal)
                    }))
            });

            // Clear cart
            setCart([]);

            setSelectedProduct("");

            setQuantity(1);

            setAmountPaid("");

            // Refresh stock
            await fetchProducts();

        } catch (error) {

            console.error(
                "Checkout error:",
                error
            );

            console.log(
                "Status:",
                error.response?.status
            );

            console.log(
                "Response:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Checkout failed"
            );
        }
    };

    // =========================
    // SEARCH PRODUCTS
    // =========================

    const filteredProducts =
        products.filter((product) => {

            const search =
                productSearch.toLowerCase();

            return (
                product.name
                    .toLowerCase()
                    .includes(search) ||

                product.sku
                    .toLowerCase()
                    .includes(search)
            );
        });

    // =========================
    // SELECT PRODUCT FROM CARD
    // =========================

    const selectProductFromCard = (product) => {

        if (
            Number(product.stock_quantity) <= 0
        ) {
            alert(
                "This product is out of stock"
            );

            return;
        }

        const existingItem = cart.find(
            (item) =>
                item.product_id === product.id
        );

        const currentCartQuantity =
            existingItem
                ? existingItem.quantity
                : 0;

        if (
            currentCartQuantity + 1 >
            Number(product.stock_quantity)
        ) {
            alert(
                `Not enough stock!\n\n` +
                `Available stock: ${product.stock_quantity}\n` +
                `Already in cart: ${currentCartQuantity}`
            );

            return;
        }

        if (existingItem) {

            setCart(
                cart.map((item) =>
                    item.product_id === product.id
                        ? {
                              ...item,

                              quantity:
                                  item.quantity + 1,

                              subtotal:
                                  (item.quantity + 1) *
                                  Number(item.price)
                          }
                        : item
                )
            );

        } else {

            setCart([
                ...cart,

                {
                    product_id:
                        product.id,

                    name:
                        product.name,

                    price:
                        Number(product.price),

                    quantity: 1,

                    subtotal:
                        Number(product.price)
                }
            ]);
        }
    };

    return (
        <div className="pos-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="pos-header">

                <div>

                    <h2>
                        🛒 POS Billing
                    </h2>

                    <p>
                        Select products and create
                        a customer sale.
                    </p>

                </div>

                <div className="pos-cart-count">
                    🛒 {cart.length} Items
                </div>

            </div>

            {/* =========================
                PRODUCT SELECTION
            ========================= */}

            <section className="pos-section">

                <div className="pos-section-header">

                    <h3>
                        📦 Add Product to Cart
                    </h3>

                </div>

                {/* SEARCH */}

                <div className="pos-search">

                    <label htmlFor="productSearch">
                        Search Product
                    </label>

                    <input
                        type="text"
                        name="productSearch"
                        id="productSearch"
                        placeholder="Search product or SKU..."
                        value={productSearch}
                        onChange={(e) =>
                            setProductSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

                {/* PRODUCT CARDS */}

                <div className="pos-product-grid">

                    {filteredProducts.length === 0 ? (

                        <div className="pos-empty-products">

                            <p>
                                No products found.
                            </p>

                        </div>

                    ) : (

                        filteredProducts.map(
                            (product) => (

                                <div
                                    key={product.id}
                                    className="pos-product-card"
                                >

                                    {product.image_url ? (

                                        <img
                                            src={
                                                product.image_url
                                            }
                                            alt={
                                                product.name
                                            }
                                            className="pos-product-image"
                                        />

                                    ) : (

                                        <div className="pos-no-image">
                                            No Image
                                        </div>

                                    )}

                                    <h3>
                                        {product.name}
                                    </h3>

                                    <p className="pos-product-sku">
                                        SKU: {product.sku}
                                    </p>

                                    <p className="pos-product-price">
                                        Rs.{" "}
                                        {Number(
                                            product.price
                                        ).toFixed(2)}
                                    </p>

                                    <p
                                        className={
                                            Number(
                                                product.stock_quantity
                                            ) <= 5
                                                ? "pos-stock-low"
                                                : "pos-stock-ok"
                                        }
                                    >
                                        Stock:{" "}
                                        {
                                            product.stock_quantity
                                        }
                                    </p>

                                    <button
                                        onClick={() =>
                                            selectProductFromCard(
                                                product
                                            )
                                        }
                                        disabled={
                                            Number(
                                                product.stock_quantity
                                            ) <= 0
                                        }
                                        className={
                                            Number(
                                                product.stock_quantity
                                            ) <= 0
                                                ? "pos-out-button"
                                                : "pos-add-button"
                                        }
                                    >
                                        {Number(
                                            product.stock_quantity
                                        ) <= 0
                                            ? "Out of Stock"
                                            : "Add to Cart 🛒"}
                                    </button>

                                </div>
                            )
                        )
                    )}

                </div>

                {/* EXISTING PRODUCT SELECT */}

                <div className="pos-manual-add">

                    <div className="pos-select-field">

                        <label htmlFor="selectedProduct">
                            Select Product
                        </label>

                        <select
                            id="selectedProduct"
                            name="selectedProduct"
                            value={
                                selectedProduct
                            }
                            onChange={(e) =>
                                setSelectedProduct(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Select Product
                            </option>

                            {filteredProducts.map(
                                (product) => (

                                    <option
                                        key={
                                            product.id
                                        }
                                        value={
                                            product.id
                                        }
                                        disabled={
                                            Number(
                                                product.stock_quantity
                                            ) <= 0
                                        }
                                    >
                                        {product.name} -
                                        Rs.{" "}
                                        {product.price} (
                                        {Number(
                                            product.stock_quantity
                                        ) > 0
                                            ? `Stock: ${product.stock_quantity}`
                                            : "Out of Stock"}
                                        )
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    <div className="pos-quantity-field">

                        <label htmlFor="quantity">
                            Quantity
                        </label>

                        <input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="pos-manual-button">

                        <button
                            onClick={addToCart}
                            className="pos-manual-add-button"
                        >
                            ➕ Add to Cart
                        </button>

                    </div>

                </div>

            </section>

            {/* =========================
                CART
            ========================= */}

            <section className="pos-section">

                <div className="pos-cart-header">

                    <h3>
                        🛒 Shopping Cart
                    </h3>

                    {cart.length > 0 && (

                        <button
                            onClick={() => {

                                if (
                                    window.confirm(
                                        "Are you sure you want to clear the cart?"
                                    )
                                ) {
                                    setCart([]);
                                }

                            }}
                            className="pos-clear-button"
                        >
                            🗑️ Clear Cart
                        </button>

                    )}

                </div>

                {cart.length === 0 ? (

                    <div className="pos-empty-cart">

                        <div className="pos-empty-cart-icon">
                            🛒
                        </div>

                        <h3>
                            Your cart is empty
                        </h3>

                        <p>
                            Select a product above
                            to start a sale.
                        </p>

                    </div>

                ) : (

                    <div className="pos-cart-list">

                        {cart.map(
                            (item) => (

                                <div
                                    key={
                                        item.product_id
                                    }
                                    className="pos-cart-item"
                                >

                                    <div className="pos-cart-product">

                                        <h3>
                                            {item.name}
                                        </h3>

                                        <p>
                                            Rs.{" "}
                                            {Number(
                                                item.price
                                            ).toFixed(2)}
                                        </p>

                                    </div>

                                    <div className="pos-cart-quantity">

                                        <button
                                            onClick={() =>
                                                decreaseQuantity(
                                                    item.product_id
                                                )
                                            }
                                            className="pos-minus-button"
                                        >
                                            −
                                        </button>

                                        <span>
                                            {
                                                item.quantity
                                            }
                                        </span>

                                        <button
                                            onClick={() =>
                                                increaseQuantity(
                                                    item.product_id
                                                )
                                            }
                                            className="pos-plus-button"
                                        >
                                            +
                                        </button>

                                    </div>

                                    <div className="pos-cart-subtotal">

                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            Rs.{" "}
                                            {Number(
                                                item.subtotal
                                            ).toFixed(2)}
                                        </strong>

                                    </div>

                                    <button
                                        onClick={() =>
                                            removeFromCart(
                                                item.product_id
                                            )
                                        }
                                        className="pos-remove-button"
                                    >
                                        🗑️ Remove
                                    </button>

                                </div>
                            )
                        )}

                    </div>

                )}

                <div className="pos-total">

                    <span>
                        Total
                    </span>

                    <span>
                        Rs. {total.toFixed(2)}
                    </span>

                </div>

            </section>

            {/* =========================
                PAYMENT
            ========================= */}

            <section className="pos-section">

                <h3 className="pos-payment-title">
                    💳 Payment
                </h3>

                <div className="pos-amount-to-pay">

                    <span>
                        Amount to Pay
                    </span>

                    <span>
                        Rs. {total.toFixed(2)}
                    </span>

                </div>

                <label className="pos-payment-label">
                    Payment Method
                </label>

                <div className="pos-payment-methods">

                    <button
                        onClick={() =>
                            setPaymentMethod("cash")
                        }
                        disabled={
                            cart.length === 0
                        }
                        className={
                            paymentMethod === "cash"
                                ? "pos-cash-active"
                                : "pos-payment-inactive"
                        }
                    >
                        💵 Cash
                    </button>

                    <button
                        onClick={() =>
                            setPaymentMethod("card")
                        }
                        disabled={
                            cart.length === 0
                        }
                        className={
                            paymentMethod === "card"
                                ? "pos-card-active"
                                : "pos-payment-inactive"
                        }
                    >
                        💳 Card
                    </button>

                </div>

                {/* CASH */}

                {paymentMethod === "cash" && (

                    <div className="pos-cash-box">

                        <label htmlFor="amountPaid">
                            💵 Amount Paid
                        </label>

                        <input
                            id="amountPaid"
                            name="amountPaid"
                            type="number"
                            min="0"
                            value={amountPaid}
                            onChange={(e) =>
                                setAmountPaid(
                                    e.target.value
                                )
                            }
                            placeholder="Enter amount received"
                        />

                        <div className="pos-change">

                            <span>
                                Change
                            </span>

                            <span
                                className={
                                    change >= 0
                                        ? "change-positive"
                                        : "change-negative"
                                }
                            >
                                Rs.{" "}
                                {change >= 0
                                    ? change.toFixed(2)
                                    : "0.00"}
                            </span>

                        </div>

                        {Number(
                            amountPaid || 0
                        ) < total &&
                            Number(
                                amountPaid || 0
                            ) > 0 && (

                                <p className="pos-insufficient">
                                    ⚠️ Insufficient
                                    payment
                                </p>
                            )}

                    </div>
                )}

                {/* CARD */}

                {paymentMethod === "card" && (

                    <div className="pos-card-box">

                        <h4>
                            💳 Card Payment
                        </h4>

                        <p>
                            Customer will pay{" "}
                            <strong>
                                Rs.{" "}
                                {total.toFixed(2)}
                            </strong>{" "}
                            by card.
                        </p>

                    </div>
                )}

                {/* CHECKOUT */}

                <button
                    onClick={handleCheckout}
                    disabled={
                        cart.length === 0 ||
                        (
                            paymentMethod === "cash" &&
                            Number(
                                amountPaid || 0
                            ) < total
                        )
                    }
                    className={
                        cart.length === 0 ||
                        (
                            paymentMethod === "cash" &&
                            Number(
                                amountPaid || 0
                            ) < total
                        )
                            ? "pos-checkout-disabled"
                            : "pos-checkout-button"
                    }
                >
                    {cart.length === 0
                        ? "Cart is Empty"
                        : paymentMethod === "cash" &&
                          Number(
                              amountPaid || 0
                          ) < total
                        ? "Enter Sufficient Amount"
                        : "✅ Complete Sale"}
                </button>

            </section>

            {/* =========================
                RECEIPT
            ========================= */}

            {completedSale && (

                <div className="receipt-container">

                    <div
                        id="receipt"
                        className="receipt"
                    >

                        {/* BUSINESS HEADER */}

                        <div className="receipt-header">

                            <div className="receipt-logo">
                                🛒
                            </div>

                            <h2>
                                EPOS SYSTEM
                            </h2>

                            <p className="receipt-subtitle">
                                Sales Receipt
                            </p>

                            <p className="receipt-business-info">
                                Point of Sale System
                            </p>

                        </div>

                        <hr />

                        {/* SALE INFORMATION */}

                        <div className="receipt-info">

                            <div className="receipt-info-row">

                                <span>
                                    <strong>
                                        Sale No:
                                    </strong>
                                </span>

                                <span>
                                    #{completedSale.saleId}
                                </span>

                            </div>

                            <div className="receipt-info-row">

                                <span>
                                    <strong>
                                        Date:
                                    </strong>
                                </span>

                                <span>
                                    {new Date().toLocaleDateString()}
                                </span>

                            </div>

                            <div className="receipt-info-row">

                                <span>
                                    <strong>
                                        Time:
                                    </strong>
                                </span>

                                <span>
                                    {new Date().toLocaleTimeString()}
                                </span>

                            </div>

                            {/* ACTUAL CASHIER */}

                            <div className="receipt-info-row">

                                <span>
                                    <strong>
                                        Cashier:
                                    </strong>
                                </span>

                                <span>
                                    {completedSale.cashierName}
                                </span>

                            </div>

                            <div className="receipt-info-row">
    <span>
        <strong>
            Invoice:
        </strong>
    </span>

    <span>
        {completedSale.invoiceNumber}
    </span>
</div>

                        </div>

                        <hr />

                        {/* PRODUCTS */}

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

                                    {completedSale.items.map(
                                        (item, index) => (

                                            <tr
                                                key={index}
                                            >

                                                <td>
                                                    {item.name}
                                                </td>

                                                <td>
                                                    {item.quantity}
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

                        {/* SUMMARY */}

                        <div className="receipt-summary">

                            <div className="receipt-summary-row">

                                <span>
                                    Total Items
                                </span>

                                <span>
                                    {completedSale.items.reduce(
                                        (total, item) =>
                                            total +
                                            Number(
                                                item.quantity
                                            ),
                                        0
                                    )}
                                </span>

                            </div>

                            <div className="receipt-total">

                                <span>
                                    TOTAL
                                </span>

                                <span>
                                    Rs.{" "}
                                    {Number(
                                        completedSale.totalAmount
                                    ).toFixed(2)}
                                </span>

                            </div>

                        </div>

                        <hr />

                        {/* PAYMENT */}

                        <div className="receipt-payment">

                            <div className="receipt-payment-row">

                                <span>
                                    <strong>
                                        Payment Method
                                    </strong>
                                </span>

                                <span>
                                    {completedSale.paymentMethod.toUpperCase()}
                                </span>

                            </div>

                            {completedSale.paymentMethod ===
                                "cash" && (
                                <>

                                    <div className="receipt-payment-row">

                                        <span>
                                            Amount Paid
                                        </span>

                                        <span>
                                            Rs.{" "}
                                            {Number(
                                                completedSale.amountPaid
                                            ).toFixed(2)}
                                        </span>

                                    </div>

                                    <div className="receipt-payment-row receipt-change">

                                        <span>
                                            Change
                                        </span>

                                        <span>
                                            Rs.{" "}
                                            {Number(
                                                completedSale.change
                                            ).toFixed(2)}
                                        </span>

                                    </div>

                                </>
                            )}

                        </div>

                        <hr />

                        {/* FOOTER */}

                        <div className="receipt-footer">

                            <p>
                                Thank You! 🙏
                            </p>

                            <p>
                                Please visit us again.
                            </p>

                            <p className="receipt-footer-small">
                                Powered by EPOS System
                            </p>

                        </div>

                    </div>

                    {/* RECEIPT ACTIONS */}

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
                            onClick={() =>
                                setCompletedSale(null)
                            }
                            className="receipt-close-button"
                        >
                            ✕ Close Receipt
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

export default POS;