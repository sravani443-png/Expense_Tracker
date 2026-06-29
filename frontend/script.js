const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const messageEl = document.getElementById("form-message");
const transactionList = document.getElementById("transaction-list");
const incomeList = document.getElementById("income-list");
const expenseList = document.getElementById("expense-list");
const emptyState = document.getElementById("empty-state");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const heroBalanceEl = document.getElementById("hero-balance");
const heroStatusEl = document.getElementById("hero-status");
const filterButtons = document.querySelectorAll(".filter-button");

let transactions = [];
let activeFilter = "all";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const setMessage = (message, tone = "neutral") => {
  messageEl.textContent = message;
  messageEl.dataset.tone = tone;
};

const getTotals = () =>
  transactions.reduce(
    (totals, item) => {
      const amount = Number(item.amount);
      if (item.type === "income") totals.income += amount;
      if (item.type === "expense") totals.expense += amount;
      totals.balance = totals.income - totals.expense;
      return totals;
    },
    { income: 0, expense: 0, balance: 0 }
  );

const transactionTemplate = (item, compact = false) => {
  const amount = Number(item.amount);
  const isIncome = item.type === "income";
  const sign = isIncome ? "+" : "-";
  const date = item.date ? dateFormatter.format(new Date(item.date)) : "No date";
  const category = item.category || "General";

  return `
    <article class="transaction-item ${isIncome ? "income-item" : "expense-item"}">
      <div class="transaction-main">
        <span class="type-dot" aria-hidden="true"></span>
        <div>
          <strong>${escapeHtml(item.description)}</strong>
          <span>${escapeHtml(category)}${compact ? "" : ` | ${date}`}</span>
        </div>
      </div>
      <div class="transaction-side">
        <strong>${sign}${formatCurrency(amount)}</strong>
        ${
          compact
            ? ""
            : `<button class="icon-button" type="button" data-delete="${item._id}" aria-label="Delete ${escapeHtml(
                item.description
              )}">Delete</button>`
        }
      </div>
    </article>
  `;
};

const renderSummary = () => {
  const totals = getTotals();
  balanceEl.textContent = formatCurrency(totals.balance);
  incomeEl.textContent = formatCurrency(totals.income);
  expenseEl.textContent = formatCurrency(totals.expense);
  heroBalanceEl.textContent = formatCurrency(totals.balance);
  heroStatusEl.textContent = totals.balance >= 0 ? "You are above water" : "Expenses are ahead";
};

const renderTransactions = () => {
  const visibleTransactions =
    activeFilter === "all" ? transactions : transactions.filter((item) => item.type === activeFilter);

  emptyState.hidden = transactions.length > 0;
  transactionList.innerHTML = visibleTransactions.length
    ? visibleTransactions.map((item) => transactionTemplate(item)).join("")
    : `<div class="empty-state inline"><strong>No ${activeFilter} records</strong><span>Try another filter.</span></div>`;

  const incomes = transactions.filter((item) => item.type === "income").slice(0, 5);
  const expenses = transactions.filter((item) => item.type === "expense").slice(0, 5);

  incomeList.innerHTML = incomes.length
    ? incomes.map((item) => transactionTemplate(item, true)).join("")
    : `<div class="empty-state inline"><strong>No income added</strong><span>Your income entries will appear here.</span></div>`;

  expenseList.innerHTML = expenses.length
    ? expenses.map((item) => transactionTemplate(item, true)).join("")
    : `<div class="empty-state inline"><strong>No expenses added</strong><span>Your expense entries will appear here.</span></div>`;
};

const render = () => {
  renderSummary();
  renderTransactions();
};

const fetchTransactions = async () => {
  try {
    const response = await fetch("/api/transactions");
    if (!response.ok) throw new Error("Unable to load transactions.");
    transactions = await response.json();
    render();
  } catch (error) {
    setMessage(error.message, "error");
  }
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("Saving transaction...");

  const selectedType = new FormData(form).get("type");
  const payload = {
    description: descriptionInput.value.trim(),
    amount: Number(amountInput.value),
    category: categoryInput.value,
    type: selectedType,
    date: dateInput.value,
  };

  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not save transaction.");

    form.reset();
    dateInput.value = new Date().toISOString().split("T")[0];
    form.querySelector('input[value="expense"]').checked = true;
    setMessage("Transaction added successfully.", "success");
    await fetchTransactions();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

transactionList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete]");
  if (!deleteButton) return;

  try {
    const response = await fetch(`/api/transactions/${deleteButton.dataset.delete}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Could not delete transaction.");
    setMessage("Transaction deleted.", "success");
    await fetchTransactions();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderTransactions();
  });
});

window.addEventListener("DOMContentLoaded", () => {
  dateInput.value = new Date().toISOString().split("T")[0];
  fetchTransactions();
});
