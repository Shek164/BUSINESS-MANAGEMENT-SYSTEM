/* =========================================
   BUSINESS MANAGEMENT SYSTEM
   ========================================= */


let products =
    JSON.parse(
        localStorage.getItem("bizmanager_products")
    ) || [];


const productTable =
    document.getElementById("productTable");

const emptyState =
    document.getElementById("emptyState");

const productModal =
    document.getElementById("productModal");

const productForm =
    document.getElementById("productForm");

const searchInput =
    document.getElementById("searchProduct");

const stockFilter =
    document.getElementById("stockFilter");


/* =========================================
   STORAGE
   ========================================= */

function saveProducts() {

    localStorage.setItem(
        "bizmanager_products",
        JSON.stringify(products)
    );

}


/* =========================================
   MODAL
   ========================================= */

function openProductModal(product = null) {

    productModal.classList.add("show");

    productModal.setAttribute(
        "aria-hidden",
        "false"
    );


    if (product) {

        document.getElementById("modalTitle")
            .textContent = "Edit Product";

        document.getElementById("editingProductId")
            .value = product.id;

        document.getElementById("productName")
            .value = product.name;

        document.getElementById("productPrice")
            .value = product.price;

        document.getElementById("productStock")
            .value = product.stock;

    } else {

        productForm.reset();

        document.getElementById("editingProductId")
            .value = "";

        document.getElementById("modalTitle")
            .textContent = "Add Product";

    }


    setTimeout(() => {

        document
            .getElementById("productName")
            .focus();

    }, 100);

}


function closeProductModal() {

    productModal.classList.remove("show");

    productModal.setAttribute(
        "aria-hidden",
        "true"
    );

    productForm.reset();

}


/* =========================================
   ADD / EDIT PRODUCT
   ========================================= */

productForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const id =
            document
                .getElementById("editingProductId")
                .value;


        const name =
            document
                .getElementById("productName")
                .value
                .trim();


        const price =
            Number(
                document
                    .getElementById("productPrice")
                    .value
            );


        const stock =
            Number(
                document
                    .getElementById("productStock")
                    .value
            );


        if (
            !name ||
            price < 0 ||
            stock < 0
        ) {

            showToast(
                "Error",
                "Please enter valid product information.",
                "!"
            );

            return;

        }


        if (id) {

            const product =
                products.find(
                    item =>
                        item.id === Number(id)
                );


            if (product) {

                product.name = name;

                product.price = price;

                product.stock = stock;

                showToast(
                    "Product Updated",
                    `${name} has been updated.`
                );

            }

        } else {

            const newProduct = {

                id: Date.now(),

                name,

                price,

                stock

            };


            products.unshift(
                newProduct
            );


            showToast(
                "Product Added",
                `${name} has been added successfully.`
            );

        }


        saveProducts();

        renderProducts();

        updateDashboard();

        closeProductModal();

    }
);


/* =========================================
   RENDER PRODUCTS
   ========================================= */

function renderProducts() {

    const search =
        searchInput
            .value
            .trim()
            .toLowerCase();


    const filter =
        stockFilter.value;


    let filtered =
        products.filter(product => {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search);


            let matchesFilter = true;


            if (filter === "available") {

                matchesFilter =
                    product.stock > 10;

            }


            if (filter === "low") {

                matchesFilter =
                    product.stock > 0 &&
                    product.stock <= 10;

            }


            if (filter === "out") {

                matchesFilter =
                    product.stock === 0;

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    productTable.innerHTML = "";


    if (filtered.length === 0) {

        productTable.style.display = "none";

        emptyState.style.display = "block";

        return;

    }


    productTable.style.display = "table";

    emptyState.style.display = "none";


    filtered.forEach(product => {

        const row =
            document.createElement("tr");


        let statusClass = "available";

        let statusText = "Available";


        if (product.stock === 0) {

            statusClass = "out";

            statusText = "Out of stock";

        } else if (product.stock <= 10) {

            statusClass = "low";

            statusText = "Low stock";

        }


        row.innerHTML = `

            <td>
                ${escapeHTML(product.name)}
            </td>

            <td>
                KSh ${formatNumber(product.price)}
            </td>

            <td>
                ${formatNumber(product.stock)}
            </td>

            <td>

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </td>

            <td>

                <div class="action-group">

                    <button
                        class="action-btn edit-btn"
                        data-action="edit"
                        data-id="${product.id}">

                        Edit

                    </button>

                    <button
                        class="action-btn delete-btn"
                        data-action="delete"
                        data-id="${product.id}">

                        Delete

                    </button>

                </div>

            </td>

        `;


        productTable.appendChild(row);

    });

}


/* =========================================
   TABLE ACTIONS
   ========================================= */

productTable.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) return;


        const id =
            Number(button.dataset.id);


        const action =
            button.dataset.action;


        const product =
            products.find(
                item => item.id === id
            );


        if (!product) return;


        if (action === "edit") {

            openProductModal(product);

        }


        if (action === "delete") {

            deleteProduct(product);

        }

    }
);


/* =========================================
   DELETE
   ========================================= */

function deleteProduct(product) {

    const confirmed =
        confirm(
            `Delete "${product.name}"? This action cannot be undone.`
        );


    if (!confirmed) return;


    products =
        products.filter(
            item =>
                item.id !== product.id
        );


    saveProducts();

    renderProducts();

    updateDashboard();


    showToast(
        "Product Deleted",
        `${product.name} was removed.`
    );

}


/* =========================================
   DASHBOARD
   ========================================= */

function updateDashboard() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (total, product) =>
                total + product.stock,
            0
        );


    document.getElementById(
        "productCount"
    ).textContent =
        formatNumber(totalProducts);


    document.getElementById(
        "stockCount"
    ).textContent =
        formatNumber(totalStock);


    /*
        Revenue will become connected
        to the sales module later.
    */

    document.getElementById(
        "salesTotal"
    ).textContent =
        "KSh 0";


    /*
        Customer module will be added later.
    */

    document.getElementById(
        "customerCount"
    ).textContent =
        "0";


    const stockStatus =
        document.getElementById(
            "stockStatus"
        );


    const lowStock =
        products.filter(
            product =>
                product.stock <= 10
        ).length;


    if (lowStock > 0) {

        stockStatus.textContent =
            `${lowStock} item(s) need attention`;

    } else {

        stockStatus.textContent =
            "Inventory healthy";

    }

}


/* =========================================
   SEARCH & FILTER
   ========================================= */

searchInput.addEventListener(
    "input",
    renderProducts
);


stockFilter.addEventListener(
    "change",
    renderProducts
);


/* =========================================
   TOAST
   ========================================= */

let toastTimer;


function showToast(
    title,
    message,
    icon = "✓"
) {

    const toast =
        document.getElementById("toast");


    document.getElementById(
        "toastTitle"
    ).textContent =
        title;


    document.getElementById(
        "toastMessage"
    ).textContent =
        message;


    document.getElementById(
        "toastIcon"
    ).textContent =
        icon;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================
   MOBILE SIDEBAR
   ========================================= */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );

const overlay =
    document.getElementById(
        "overlay"
    );


function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );

    overlay.classList.remove(
        "show"
    );

}


mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.add(
            "open"
        );

        overlay.classList.add(
            "show"
        );

    }
);


overlay.addEventListener(
    "click",
    closeSidebar
);


document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        link.addEventListener(
            "click",
            closeSidebar
        );

    });


/* =========================================
   CLOSE MODAL WITH ESCAPE
   ========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeProductModal();

            closeSidebar();

        }

    }
);


/* =========================================
   SECURITY / OUTPUT HELPERS
   ========================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function formatNumber(value) {

    return Number(value)
        .toLocaleString(
            "en-KE"
        );

}


/* =========================================
   INITIALIZE
   ========================================= */

renderProducts();

updateDashboard();
/* =========================================
   SALES MANAGEMENT
========================================= */

let sales =
    JSON.parse(
        localStorage.getItem("bizmanager_sales")
    ) || [];


const saleModal =
    document.getElementById("saleModal");

const saleForm =
    document.getElementById("saleForm");

const saleProduct =
    document.getElementById("saleProduct");

const saleQuantity =
    document.getElementById("saleQuantity");

const saleTotal =
    document.getElementById("saleTotal");


/* OPEN SALE MODAL */

function openSaleModal() {

    populateSaleProducts();

    saleForm.reset();

    saleQuantity.value = 1;

    calculateSaleTotal();

    saleModal.classList.add("active");

    saleModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* CLOSE SALE MODAL */

function closeSaleModal() {

    saleModal.classList.remove("active");

    saleModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* POPULATE PRODUCT SELECT */

function populateSaleProducts() {

    saleProduct.innerHTML =
        `<option value="">
            Select product
        </option>`;

    products.forEach(product => {

        if (product.stock > 0) {

            const option =
                document.createElement("option");

            option.value = product.id;

            option.textContent =
                `${product.name} — KSh ${formatNumber(product.price)} (${product.stock} available)`;

            saleProduct.appendChild(option);
        }

    });
}


/* CALCULATE SALE TOTAL */

function calculateSaleTotal() {

    const selectedProduct =
        products.find(
            product =>
                String(product.id) ===
                String(saleProduct.value)
        );

    if (!selectedProduct) {

        saleTotal.textContent = "KSh 0";

        return;
    }

    const quantity =
        Number(saleQuantity.value) || 1;

    const total =
        selectedProduct.price * quantity;

    saleTotal.textContent =
        `KSh ${formatNumber(total)}`;
}


/* PRODUCT CHANGE */

saleProduct.addEventListener(
    "change",
    calculateSaleTotal
);


/* QUANTITY CHANGE */

saleQuantity.addEventListener(
    "input",
    calculateSaleTotal
);


/* SAVE SALE */

saleForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const customer =
            document
                .getElementById("saleCustomer")
                .value
                .trim();

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(saleProduct.value)
            );

        const quantity =
            Number(saleQuantity.value);

        const payment =
            document
                .getElementById("salePayment")
                .value;


        if (!product) {

            showToast(
                "Error",
                "Please select a product.",
                "!"
            );

            return;
        }


        if (quantity <= 0) {

            showToast(
                "Error",
                "Quantity must be at least 1.",
                "!"
            );

            return;
        }


        if (quantity > product.stock) {

            showToast(
                "Insufficient Stock",
                `Only ${product.stock} units are available.`,
                "!"
            );

            return;
        }


        const total =
            product.price * quantity;


        const newSale = {

            id: Date.now(),

            customer: customer,

            productId: product.id,

            productName: product.name,

            quantity: quantity,

            total: total,

            payment: payment,

            date: new Date().toISOString()

        };


        sales.unshift(newSale);


        /* REDUCE INVENTORY */

        product.stock -= quantity;

        saveProducts();


        /* SAVE SALES */

        localStorage.setItem(
            "bizmanager_sales",
            JSON.stringify(sales)
        );


        renderSales();

        updateSalesSummary();

        updateDashboard();


        closeSaleModal();


        showToast(
            "Sale Recorded",
            "The transaction was successfully saved.",
            "✓"
        );

    }
);


/* RENDER SALES */

function renderSales() {

    const table =
        document.getElementById("salesTable");

    const emptyState =
        document.getElementById("salesEmptyState");


    table.innerHTML = "";


    if (sales.length === 0) {

        emptyState.style.display = "block";

        return;
    }


    emptyState.style.display = "none";


    sales.forEach(sale => {

        const row =
            document.createElement("tr");


        const date =
            new Date(sale.date);


        const formattedDate =
            date.toLocaleDateString(
                "en-KE",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );


        const paymentClass =
            sale.payment === "Paid"
                ? "available"
                : "low";


        row.innerHTML = `

            <td>
                ${escapeHTML(sale.customer)}
            </td>

            <td>
                ${escapeHTML(sale.productName)}
            </td>

            <td>
                ${sale.quantity}
            </td>

            <td>
                KSh ${formatNumber(sale.total)}
            </td>

            <td>
                <span class="stock-badge ${paymentClass}">
                    ${sale.payment}
                </span>
            </td>

            <td>
                ${formattedDate}
            </td>

        `;


        table.appendChild(row);

    });

}


/* SALES SUMMARY */

function updateSalesSummary() {

    const today =
        new Date().toDateString();


    const todayTotal =
        sales
            .filter(
                sale =>
                    new Date(sale.date)
                        .toDateString() === today
            )
            .reduce(
                (sum, sale) =>
                    sum + sale.total,
                0
            );


    const pendingTotal =
        sales
            .filter(
                sale =>
                    sale.payment === "Pending"
            )
            .reduce(
                (sum, sale) =>
                    sum + sale.total,
                0
            );


    document.getElementById(
        "todaySales"
    ).textContent =
        `KSh ${formatNumber(todayTotal)}`;


    document.getElementById(
        "transactionCount"
    ).textContent =
        sales.length;


    document.getElementById(
        "pendingPayments"
    ).textContent =
        `KSh ${formatNumber(pendingTotal)}`;

}


/* UPDATE REVENUE */

function updateSalesRevenue() {

    const totalRevenue =
        sales.reduce(
            (sum, sale) =>
                sum + sale.total,
            0
        );


    const revenueElement =
        document.getElementById(
            "salesTotal"
        );


    if (revenueElement) {

        revenueElement.textContent =
            `KSh ${formatNumber(totalRevenue)}`;

    }

}


/* INITIALIZE SALES */

renderSales();

updateSalesSummary();

updateSalesRevenue();
/* =========================================
   CUSTOMER MANAGEMENT
========================================= */

let customers =
    JSON.parse(
        localStorage.getItem("bizmanager_customers")
    ) || [];


/* -----------------------------------------
   CUSTOMER ELEMENTS
----------------------------------------- */

const customerModal =
    document.getElementById("customerModal");

const customerForm =
    document.getElementById("customerForm");

const customerSearch =
    document.getElementById("customerSearch");


/* -----------------------------------------
   OPEN CUSTOMER MODAL
----------------------------------------- */

function openCustomerModal() {

    customerForm.reset();

    document
        .getElementById("customerStatus")
        .value = "Active";

    customerModal.classList.add("active");

    customerModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* -----------------------------------------
   CLOSE CUSTOMER MODAL
----------------------------------------- */

function closeCustomerModal() {

    customerModal.classList.remove("active");

    customerModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* -----------------------------------------
   SAVE CUSTOMER
----------------------------------------- */

customerForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            document
                .getElementById("customerName")
                .value
                .trim();

        const phone =
            document
                .getElementById("customerPhone")
                .value
                .trim();

        const email =
            document
                .getElementById("customerEmail")
                .value
                .trim();

        const status =
            document
                .getElementById("customerStatus")
                .value;


        /* BASIC VALIDATION */

        if (!name || !phone) {

            showToast(
                "Missing Information",
                "Please enter the customer name and phone number.",
                "!"
            );

            return;
        }


        /* CHECK FOR DUPLICATE PHONE */

        const existingCustomer =
            customers.find(
                customer =>
                    customer.phone === phone
            );


        if (existingCustomer) {

            showToast(
                "Customer Exists",
                "A customer with this phone number already exists.",
                "!"
            );

            return;
        }


        /* CREATE CUSTOMER */

        const newCustomer = {

            id: Date.now(),

            name: name,

            phone: phone,

            email: email,

            status: status,

            totalPurchases: 0,

            createdAt:
                new Date().toISOString()

        };


        /* ADD CUSTOMER */

        customers.unshift(newCustomer);


        /* SAVE TO LOCAL STORAGE */

        localStorage.setItem(
            "bizmanager_customers",
            JSON.stringify(customers)
        );


        /* UPDATE DISPLAY */

        renderCustomers();

        updateCustomerSummary();


        /* CLOSE MODAL */

        closeCustomerModal();


        /* SUCCESS MESSAGE */

        showToast(
            "Customer Added",
            `${name} has been added successfully.`,
            "✓"
        );

    }
);


/* -----------------------------------------
   RENDER CUSTOMERS
----------------------------------------- */

function renderCustomers(
    searchTerm = ""
) {

    const table =
        document.getElementById(
            "customersTable"
        );

    const emptyState =
        document.getElementById(
            "customersEmptyState"
        );


    if (!table) return;


    table.innerHTML = "";


    const search =
        searchTerm
            .toLowerCase()
            .trim();


    const filteredCustomers =
        customers.filter(customer => {

            return (
                customer.name
                    .toLowerCase()
                    .includes(search)

                ||

                customer.phone
                    .toLowerCase()
                    .includes(search)

                ||

                customer.email
                    .toLowerCase()
                    .includes(search)
            );

        });


    if (filteredCustomers.length === 0) {

        emptyState.style.display =
            "block";

        return;
    }


    emptyState.style.display =
        "none";


    filteredCustomers.forEach(
        customer => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <div class="customer-cell">

                        <div class="small-avatar">
                            ${getInitials(customer.name)}
                        </div>

                        <strong>
                            ${escapeHTML(customer.name)}
                        </strong>

                    </div>
                </td>


                <td>
                    ${escapeHTML(customer.phone)}
                </td>


                <td>
                    ${customer.email
                        ? escapeHTML(customer.email)
                        : "—"}
                </td>


                <td>
                    KSh ${formatNumber(
                        customer.totalPurchases
                    )}
                </td>


                <td>

                    <span class="stock-badge ${
                        customer.status === "Active"
                            ? "available"
                            : "low"
                    }">

                        ${customer.status}

                    </span>

                </td>


                <td>

                    <button
                        class="table-action"
                        onclick="deleteCustomer(${customer.id})"
                        title="Delete customer">

                        🗑

                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );

}


/* -----------------------------------------
   CUSTOMER INITIALS
----------------------------------------- */

function getInitials(name) {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


/* -----------------------------------------
   DELETE CUSTOMER
----------------------------------------- */

function deleteCustomer(id) {

    const customer =
        customers.find(
            item => item.id === id
        );


    if (!customer) return;


    const confirmed =
        confirm(
            `Delete ${customer.name} from your customers?`
        );


    if (!confirmed) return;


    customers =
        customers.filter(
            item => item.id !== id
        );


    localStorage.setItem(
        "bizmanager_customers",
        JSON.stringify(customers)
    );


    renderCustomers();

    updateCustomerSummary();


    showToast(
        "Customer Deleted",
        "The customer was removed successfully.",
        "✓"
    );

}


/* -----------------------------------------
   CUSTOMER SUMMARY
----------------------------------------- */

function updateCustomerSummary() {

    const total =
        customers.length;


    const active =
        customers.filter(
            customer =>
                customer.status === "Active"
        ).length;


    const salesTotal =
        customers.reduce(
            (sum, customer) =>
                sum + Number(
                    customer.totalPurchases || 0
                ),
            0
        );


    const totalElement =
        document.getElementById(
            "totalCustomers"
        );

    const activeElement =
        document.getElementById(
            "activeCustomers"
        );

    const salesElement =
        document.getElementById(
            "customerSalesTotal"
        );


    if (totalElement)
        totalElement.textContent = total;


    if (activeElement)
        activeElement.textContent = active;


    if (salesElement)
        salesElement.textContent =
            `KSh ${formatNumber(salesTotal)}`;

}


/* -----------------------------------------
   CUSTOMER SEARCH
----------------------------------------- */

if (customerSearch) {

    customerSearch.addEventListener(
        "input",
        function() {

            renderCustomers(
                this.value
            );

        }
    );

}


/* -----------------------------------------
   INITIALIZE CUSTOMERS
----------------------------------------- */

renderCustomers();

updateCustomerSummary();
/* =====================================================
   INVOICE MANAGEMENT
===================================================== */

let invoices =
    JSON.parse(
        localStorage.getItem("bizmanager_invoices")
    ) || [];


/* -----------------------------------------
   CREATE INVOICE FROM LATEST SALE
----------------------------------------- */

function createInvoiceFromLatestSale() {

    if (!sales || sales.length === 0) {

        showToast(
            "No Sales Available",
            "Record a sale before creating an invoice.",
            "!"
        );

        return;
    }


    const latestSale =
        [...sales].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        )[0];


    openInvoice(latestSale);

}


/* -----------------------------------------
   OPEN INVOICE
----------------------------------------- */

function openInvoice(sale) {

    const invoiceId =
        `INV-${String(
            invoices.length + 1
        ).padStart(6, "0")}`;


    const customer =
        customers.find(
            item =>
                item.name.toLowerCase() ===
                (sale.customer || "").toLowerCase()
        );


    document.getElementById(
        "invoiceNumber"
    ).textContent = invoiceId;


    document.getElementById(
        "invoiceCustomer"
    ).textContent =
        sale.customer || "Walk-in Customer";


    document.getElementById(
        "invoiceCustomerPhone"
    ).textContent =
        customer
            ? customer.phone
            : "—";


    document.getElementById(
        "invoiceDate"
    ).textContent =
        new Date(
            sale.date
        ).toLocaleDateString();


    document.getElementById(
        "invoiceProduct"
    ).textContent =
        sale.productName;


    document.getElementById(
        "invoiceQuantity"
    ).textContent =
        sale.quantity;


    const unitPrice =
        Number(sale.total || 0) /
        Number(sale.quantity || 1);


    document.getElementById(
        "invoicePrice"
    ).textContent =
        `KSh ${formatNumber(unitPrice)}`;


    document.getElementById(
        "invoiceTotal"
    ).textContent =
        `KSh ${formatNumber(sale.total)}`;


    document.getElementById(
        "invoiceGrandTotal"
    ).textContent =
        `KSh ${formatNumber(sale.total)}`;


    document.getElementById(
        "invoicePayment"
    ).textContent =
        sale.payment || "—";


    const invoice = {

        id: invoiceId,

        saleId: sale.id,

        customer:
            sale.customer ||
            "Walk-in Customer",

        amount:
            Number(sale.total || 0),

        payment:
            sale.payment,

        date:
            sale.date

    };


    const existing =
        invoices.find(
            item =>
                item.saleId === sale.id
        );


    if (!existing) {

        invoices.unshift(invoice);

        localStorage.setItem(
            "bizmanager_invoices",
            JSON.stringify(invoices)
        );

    }


    renderInvoices();

    updateInvoiceSummary();


    const modal =
        document.getElementById(
            "invoiceModal"
        );


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* -----------------------------------------
   CLOSE INVOICE
----------------------------------------- */

function closeInvoiceModal() {

    const modal =
        document.getElementById(
            "invoiceModal"
        );


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* -----------------------------------------
   RENDER INVOICES
----------------------------------------- */

function renderInvoices() {

    const table =
        document.getElementById(
            "invoicesTable"
        );

    const empty =
        document.getElementById(
            "invoicesEmptyState"
        );


    if (!table) return;


    table.innerHTML = "";


    if (invoices.length === 0) {

        empty.style.display =
            "block";

        return;
    }


    empty.style.display =
        "none";


    invoices.forEach(invoice => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(invoice.id)}
                </strong>
            </td>

            <td>
                ${escapeHTML(invoice.customer)}
            </td>

            <td>
                <strong>
                    KSh ${formatNumber(
                        invoice.amount
                    )}
                </strong>
            </td>

            <td>
                <span class="stock-badge available">
                    ${escapeHTML(
                        invoice.payment || "Paid"
                    )}
                </span>
            </td>

            <td>
                ${new Date(
                    invoice.date
                ).toLocaleDateString()}
            </td>

            <td>

                <button
                    class="table-action"
                    onclick="openInvoiceById('${invoice.id}')"
                    title="View invoice">

                    🧾

                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


/* -----------------------------------------
   OPEN EXISTING INVOICE
----------------------------------------- */

function openInvoiceById(invoiceId) {

    const invoice =
        invoices.find(
            item =>
                item.id === invoiceId
        );


    if (!invoice) return;


    const sale =
        sales.find(
            item =>
                item.id === invoice.saleId
        );


    if (!sale) {

        showToast(
            "Sale Not Found",
            "The original sale could not be found.",
            "!"
        );

        return;
    }


    openInvoice(sale);

}


/* -----------------------------------------
   INVOICE SUMMARY
----------------------------------------- */

function updateInvoiceSummary() {

    const total =
        invoices.length;


    const paid =
        invoices.filter(
            invoice =>
                invoice.payment &&
                invoice.payment.toLowerCase()
                    .includes("paid")
        ).length;


    const billed =
        invoices.reduce(
            (sum, invoice) =>
                sum +
                Number(
                    invoice.amount || 0
                ),
            0
        );


    const totalElement =
        document.getElementById(
            "totalInvoices"
        );

    const paidElement =
        document.getElementById(
            "paidInvoices"
        );

    const billedElement =
        document.getElementById(
            "totalBilled"
        );


    if (totalElement)
        totalElement.textContent =
            total;


    if (paidElement)
        paidElement.textContent =
            paid;


    if (billedElement)
        billedElement.textContent =
            `KSh ${formatNumber(billed)}`;

}


/* -----------------------------------------
   PRINT INVOICE
----------------------------------------- */

function printInvoice() {

    const invoiceContent =
        document.getElementById(
            "printInvoice"
        ).innerHTML;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>Invoice</title>

            <style>

                body {
                    font-family:
                        Arial,
                        sans-serif;

                    padding: 40px;

                    color: #111827;
                }

                table {
                    width: 100%;
                    border-collapse:
                        collapse;
                }

                th {
                    background:
                        #f1f5f9;

                    text-align:
                        left;

                    padding: 12px;
                }

                td {
                    padding: 12px;

                    border-bottom:
                        1px solid #e5e7eb;
                }

            </style>

        </head>

        <body>

            ${invoiceContent}

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

}


/* -----------------------------------------
   INITIALIZE INVOICES
----------------------------------------- */

renderInvoices();

updateInvoiceSummary();
/* =========================================
   INVOICE & RECEIPTS MANAGEMENT
========================================= */

let invoices =
    JSON.parse(
        localStorage.getItem("bizmanager_invoices")
    ) || [];


/* -----------------------------------------
   CREATE INVOICE FROM LATEST SALE
----------------------------------------- */

function createInvoiceFromLatestSale() {

    if (!sales || sales.length === 0) {

        showToast(
            "No Sales Available",
            "Record a sale before creating an invoice.",
            "!"
        );

        return;
    }

    const latestSale =
        [...sales].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        )[0];

    openInvoice(latestSale);
}


/* -----------------------------------------
   OPEN INVOICE
----------------------------------------- */

function openInvoice(sale) {

    const existingInvoice =
        invoices.find(
            invoice =>
                invoice.saleId === sale.id
        );

    const invoiceId =
        existingInvoice
            ? existingInvoice.id
            : `INV-${String(
                invoices.length + 1
            ).padStart(6, "0")}`;


    const customer =
        customers.find(
            item =>
                item.name.toLowerCase() ===
                (sale.customer || "")
                    .toLowerCase()
        );


    document.getElementById(
        "invoiceNumber"
    ).textContent = invoiceId;


    document.getElementById(
        "invoiceCustomer"
    ).textContent =
        sale.customer ||
        "Walk-in Customer";


    document.getElementById(
        "invoiceCustomerPhone"
    ).textContent =
        customer
            ? customer.phone
            : "—";


    document.getElementById(
        "invoiceDate"
    ).textContent =
        new Date(
            sale.date
        ).toLocaleDateString();


    document.getElementById(
        "invoiceProduct"
    ).textContent =
        sale.productName;


    document.getElementById(
        "invoiceQuantity"
    ).textContent =
        sale.quantity;


    const price =
        sale.quantity > 0
            ? Number(sale.total) /
              Number(sale.quantity)
            : 0;


    document.getElementById(
        "invoicePrice"
    ).textContent =
        `KSh ${formatNumber(price)}`;


    document.getElementById(
        "invoiceTotal"
    ).textContent =
        `KSh ${formatNumber(
            sale.total
        )}`;


    document.getElementById(
        "invoiceGrandTotal"
    ).textContent =
        `KSh ${formatNumber(
            sale.total
        )}`;


    document.getElementById(
        "invoicePayment"
    ).textContent =
        sale.payment || "—";


    /* SAVE INVOICE */

    if (!existingInvoice) {

        invoices.unshift({

            id: invoiceId,

            saleId: sale.id,

            customer:
                sale.customer ||
                "Walk-in Customer",

            amount:
                Number(sale.total) || 0,

            payment:
                sale.payment || "—",

            date:
                sale.date

        });


        localStorage.setItem(
            "bizmanager_invoices",
            JSON.stringify(invoices)
        );

    }


    renderInvoices();

    updateInvoiceSummary();


    const modal =
        document.getElementById(
            "invoiceModal"
        );


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* -----------------------------------------
   CLOSE INVOICE
----------------------------------------- */

function closeInvoiceModal() {

    const modal =
        document.getElementById(
            "invoiceModal"
        );

    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* -----------------------------------------
   RENDER INVOICES
----------------------------------------- */

function renderInvoices() {

    const table =
        document.getElementById(
            "invoicesTable"
        );

    const emptyState =
        document.getElementById(
            "invoicesEmptyState"
        );


    if (!table) return;


    table.innerHTML = "";


    if (invoices.length === 0) {

        emptyState.style.display =
            "block";

        return;
    }


    emptyState.style.display =
        "none";


    invoices.forEach(
        invoice => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(
                            invoice.id
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        invoice.customer
                    )}
                </td>

                <td>
                    KSh ${formatNumber(
                        invoice.amount
                    )}
                </td>

                <td>
                    <span class="stock-badge available">
                        ${escapeHTML(
                            invoice.payment
                        )}
                    </span>
                </td>

                <td>
                    ${new Date(
                        invoice.date
                    ).toLocaleDateString()}
                </td>

                <td>

                    <button
                        class="table-action"
                        onclick="openInvoiceById('${invoice.id}')"
                        title="View invoice">

                        👁

                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );

}


/* -----------------------------------------
   OPEN SAVED INVOICE
----------------------------------------- */

function openInvoiceById(invoiceId) {

    const invoice =
        invoices.find(
            item =>
                item.id === invoiceId
        );


    if (!invoice) return;


    const sale =
        sales.find(
            item =>
                item.id === invoice.saleId
        );


    if (!sale) {

        showToast(
            "Sale Not Found",
            "The original sale for this invoice could not be found.",
            "!"
        );

        return;
    }


    openInvoice(sale);

}


/* -----------------------------------------
   INVOICE SUMMARY
----------------------------------------- */

function updateInvoiceSummary() {

    const total =
        invoices.length;


    const paid =
        invoices.filter(
            invoice =>
                invoice.payment &&
                invoice.payment
                    .toLowerCase()
                    .includes("paid")
        ).length;


    const billed =
        invoices.reduce(
            (sum, invoice) =>
                sum +
                Number(
                    invoice.amount || 0
                ),
            0
        );


    const totalElement =
        document.getElementById(
            "totalInvoices"
        );

    const paidElement =
        document.getElementById(
            "paidInvoices"
        );

    const billedElement =
        document.getElementById(
            "totalBilled"
        );


    if (totalElement)
        totalElement.textContent =
            total;


    if (paidElement)
        paidElement.textContent =
            paid;


    if (billedElement)
        billedElement.textContent =
            `KSh ${formatNumber(
                billed
            )}`;

}


/* -----------------------------------------
   PRINT INVOICE
----------------------------------------- */

function printInvoice() {

    const invoiceContent =
        document.getElementById(
            "printInvoice"
        ).innerHTML;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>Invoice</title>

            <style>

                body {
                    font-family:
                        Arial,
                        sans-serif;

                    padding: 40px;

                    color: #111827;
                }

                table {
                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-top: 25px;
                }

                th,
                td {
                    padding: 12px;

                    border-bottom:
                        1px solid #ddd;

                    text-align: left;
                }

                .invoice-top {
                    display: flex;

                    justify-content:
                        space-between;
                }

                .invoice-number {
                    text-align: right;
                }

                .invoice-details {
                    display: flex;

                    justify-content:
                        space-between;

                    margin: 30px 0;
                }

                .invoice-total {
                    display: flex;

                    justify-content:
                        space-between;

                    margin-top: 30px;

                    padding-top: 20px;

                    border-top:
                        2px solid #111827;

                    font-size: 20px;
                }

                .invoice-payment {
                    margin-top: 20px;
                }

                .invoice-footer {
                    margin-top: 50px;

                    text-align: center;
                }

            </style>

        </head>

        <body>

            ${invoiceContent}

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

}


/* -----------------------------------------
   INITIALIZE INVOICES
----------------------------------------- */

renderInvoices();

updateInvoiceSummary();
