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
