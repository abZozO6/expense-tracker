const API_URL = "http://localhost:3000/api/expenses";

let expenses = [];

const expenseForm = document.getElementById("expenseForm"); 
const editForm = document.getElementById("editForm");
const categoryFilter = document.getElementById("categoryFilter");
const expenseTableBody = document.getElementById("expenseTableBody");
const loadingSpinner = document.getElementById("loadingSpinner");
const alertContainer = document.getElementById("alertContainer");

const editModal = new bootstrap.Modal(
    document.getElementById("editModal")
);


// =========================
// UI Helpers
// =========================

function showLoading(show) {
    loadingSpinner.classList.toggle("d-none", !show);
}

function showAlert(message, type = "danger") {
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${escapeHtml(message)}
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
            ></button>
        </div>
    `;
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}


// =========================
// API - GET
// =========================

async function getExpenses() {
    try {
        const response = await fetch(API_URL);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to load expenses."
            );
        }

        return result;

    } catch (error) {
        showAlert(
            error.message || "Could not connect to the server."
        );

        throw error;
    }
}


// =========================
// API - POST
// =========================

async function addExpense(data) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to add expense."
            );
        }

        return result;

    } catch (error) {
        showAlert(
            error.message || "Could not add expense."
        );

        throw error;
    }
}


// =========================
// API - PUT
// =========================

async function updateExpense(id, data) {
    try {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to update expense."
            );
        }

        return result;

    } catch (error) {
        showAlert(
            error.message || "Could not update expense."
        );

        throw error;
    }
}


// =========================
// API - DELETE
// =========================

async function deleteExpense(id) {
    try {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to delete expense."
            );
        }

        return result;

    } catch (error) {
        showAlert(
            error.message || "Could not delete expense."
        );

        throw error;
    }
}


// =========================
// Refresh
// =========================

async function refresh() {
    showLoading(true);

    try {
        expenses = await getExpenses();

        renderTable();
        renderSummary();

    } catch (error) {

        expenseTableBody.innerHTML = "";

    } finally {

        showLoading(false);
    }
}


// =========================
// Render Table
// =========================

function renderTable() { 

    const selectedCategory = categoryFilter.value;

    const filteredExpenses =
        selectedCategory === "All"
            ? expenses
            : expenses.filter(
                expense =>
                    expense.category === selectedCategory
            );

    expenseTableBody.innerHTML = "";


    if (filteredExpenses.length === 0) {

        expenseTableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center text-muted py-4"
                >
                    No expenses found.
                </td>
            </tr>
        `;

        return;
    }


    filteredExpenses.forEach(expense => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                ${escapeHtml(expense.title)}
            </td>

            <td>
                $${Number(expense.amount).toFixed(2)}
            </td>

            <td>
                <span
                    class="badge ${getCategoryClass(expense.category)}"
                >
                    ${escapeHtml(expense.category)}
                </span>
            </td>

            <td>
                ${escapeHtml(expense.date)}
            </td>

            <td>

                <button
                    class="btn btn-sm btn-outline-primary me-1"
                    onclick="openEditModal(${expense.id})"
                >
                    Edit
                </button>

                <button
                    class="btn btn-sm btn-outline-danger"
                    onclick="handleDelete(${expense.id})"
                >
                    Delete
                </button>

            </td>
        `;

        expenseTableBody.appendChild(row);
    });
}


// =========================
// Category Badge
// =========================

function getCategoryClass(category) {

    const classes = {
        Food: "text-bg-success",
        Transport: "text-bg-primary",
        Bills: "text-bg-warning",
        Entertainment: "text-bg-danger",
        Other: "text-bg-secondary"
    };

    return classes[category] || "text-bg-secondary";
}


// =========================
// Summary Cards
// =========================

function renderSummary() {

    const total = expenses.reduce(
        (sum, expense) =>
            sum + Number(expense.amount),
        0
    );

    const count = expenses.length;

    const highest =
        expenses.length > 0
            ? Math.max(
                ...expenses.map(
                    expense => Number(expense.amount)
                )
            )
            : 0;


    document.getElementById(
        "totalAmount"
    ).textContent = `$${total.toFixed(2)}`;


    document.getElementById(
        "expenseCount"
    ).textContent = count;


    document.getElementById(
        "highestExpense"
    ).textContent = `$${highest.toFixed(2)}`;

 document.getElementById(
        "highestCategory"
    ).textContent = getHighestCategory();

}
function getHighestCategory() {
  const categoryTotals = {};

  expenses.forEach(expense => {
    const category = expense.category;

    categoryTotals[category] =
      (categoryTotals[category] || 0) + Number(expense.amount);
  });

  const highestCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0];

  return highestCategory ? highestCategory[0] : "—";
}

// =========================
// Validation
// =========================

function validateExpense(
    title,
    amount,
    category,
    date
) {

    if (!title.trim()) {
        return "Title is required.";
    }

    if (
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
    ) {
        return "Amount must be a number greater than 0.";
    }

    if (!category) {
        return "Category is required.";
    }

    if (!date) {
        return "Date is required.";
    }

    return null;
}


// =========================
// Add Expense
// =========================

expenseForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();// Prevent the default form submission behavior


        const title =
            document.getElementById("title").value;

        const amount =
            document.getElementById("amount").value;

        const category =
            document.getElementById("category").value;

        const date =
            document.getElementById("date").value;


        const validationError =
            validateExpense(
                title,
                amount,
                category,
                date
            );


        if (validationError) {

            showAlert(
                validationError,
                "warning"
            );

            return;
        }


        try {

            await addExpense({
                title: title.trim(),
                amount: Number(amount),
                category,
                date
            });


            expenseForm.reset();

            showAlert(
                "Expense added successfully.",
                "success"
            );


            await refresh();

        } catch {
            // Error already displayed.
        }

    }
);


// =========================
// Filter
// =========================

categoryFilter.addEventListener(
    "change",
    renderTable
);


// =========================
// Open Edit Modal
// =========================

function openEditModal(id) {

    const expense =
        expenses.find(
            item => item.id === id
        );


    if (!expense) {

        showAlert(
            "Expense not found."
        );

        return;
    }


    document.getElementById(
        "editId"
    ).value = expense.id;


    document.getElementById(
        "editTitle"
    ).value = expense.title;


    document.getElementById(
        "editAmount"
    ).value = expense.amount;


    document.getElementById(
        "editCategory"
    ).value = expense.category;


    document.getElementById(
        "editDate"
    ).value = expense.date;


    editModal.show();
}


// =========================
// Edit Expense
// =========================

editForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const id =
            Number(
                document.getElementById(
                    "editId"
                ).value
            );


        const title =
            document.getElementById(
                "editTitle"
            ).value;


        const amount =
            document.getElementById(
                "editAmount"
            ).value;


        const category =
            document.getElementById(
                "editCategory"
            ).value;


        const date =
            document.getElementById(
                "editDate"
            ).value;


        const validationError =
            validateExpense(
                title,
                amount,
                category,
                date
            );


        if (validationError) {

            showAlert(
                validationError,
                "warning"
            );

            return;
        }


        try {

            await updateExpense(
                id,
                {
                    title: title.trim(),
                    amount: Number(amount),
                    category,
                    date
                }
            );


            editModal.hide();

            showAlert(
                "Expense updated successfully.",
                "success"
            );


            await refresh();

        } catch {
            // Error already displayed.
        }

    }
);


// =========================
// Delete Expense
// =========================’

async function handleDelete(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteExpense(id);

        showAlert(
            "Expense deleted successfully.",
            "success"
        );

        await refresh();

    } catch {
        // Error already displayed.
    }
}


// Dark Mode
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function updateThemeButton() { // Update the theme button based on the current theme
    const isDark = document.body.classList.contains("dark-mode");

    themeIcon.textContent = isDark ? "☀️" : "🌙";
    themeToggle.title = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
} 

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode"); // Toggle the dark mode class on the body element

    const isDark = document.body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", isDark);

    updateThemeButton();
});

// Load saved theme
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

updateThemeButton();


// =========================
// Start Application
// =========================

refresh();