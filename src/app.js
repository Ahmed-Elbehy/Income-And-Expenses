const STORAGE_KEY = "daily-finance-records";

const form = document.getElementById("transaction-form");
const incomeTotalEl = document.getElementById("income-total");
const expenseTotalEl = document.getElementById("expense-total");
const balanceTotalEl = document.getElementById("balance-total");
const monthlyBalanceEl = document.getElementById("monthly-balance");
const incomeTableEl = document.getElementById("income-table");
const expenseTableEl = document.getElementById("expense-table");
const monthlyTableEl = document.getElementById("monthly-table");
const incomeCountEl = document.getElementById("income-count");
const expenseCountEl = document.getElementById("expense-count");

let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

// Set today's date as default
document.getElementById("date").valueAsDate = new Date();

// Tab Navigation
const tabButtons = document.querySelectorAll(".tab-button");
const pageContents = document.querySelectorAll(".page-content");

function showPage(pageId) {
  pageContents.forEach((page) => page.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");

  tabButtons.forEach((btn) => {
    btn.classList.remove("active", "bg-slate-900", "text-white");
    btn.classList.add("bg-slate-100", "text-slate-700");
  });

  const activeBtn = document.querySelector(`[data-page="${pageId}"]`);
  if (activeBtn) {
    activeBtn.classList.add("active", "bg-slate-900", "text-white");
    activeBtn.classList.remove("bg-slate-100", "text-slate-700");
  }
}

document
  .getElementById("tab-form")
  .addEventListener("click", () => showPage("page-form"));
document
  .getElementById("tab-income")
  .addEventListener("click", () => showPage("page-income"));
document
  .getElementById("tab-expense")
  .addEventListener("click", () => showPage("page-expense"));
document
  .getElementById("tab-summary")
  .addEventListener("click", () => showPage("page-summary"));

// Set data-page attributes for buttons
document.getElementById("tab-form").setAttribute("data-page", "page-form");
document.getElementById("tab-income").setAttribute("data-page", "page-income");
document
  .getElementById("tab-expense")
  .setAttribute("data-page", "page-expense");
document
  .getElementById("tab-summary")
  .setAttribute("data-page", "page-summary");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatArabicDate(dateStr) {
  const date = new Date(dateStr);
  const dayName = date.toLocaleDateString("ar-SA", { weekday: "long" });
  const dateFormatted = date.toLocaleDateString("ar-SA");
  return `${dayName} - ${dateFormatted}`;
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getMonthKey(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthName(monthKey) {
  const [year, month] = monthKey.split("-");
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString("ar-SA", { month: "long", year: "numeric" });
}

function updateTotals() {
  const income = records
    .filter((r) => r.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = records
    .filter((r) => r.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expense;

  incomeTotalEl.textContent = formatCurrency(income);
  expenseTotalEl.textContent = formatCurrency(expense);
  balanceTotalEl.textContent = formatCurrency(balance);
  balanceTotalEl.className =
    balance >= 0
      ? "text-emerald-600 font-semibold"
      : "text-rose-600 font-semibold";

  // Current month balance
  const currentMonth = getCurrentMonthKey();
  const monthlyIncome = records
    .filter((r) => r.type === "income" && getMonthKey(r.date) === currentMonth)
    .reduce((sum, item) => sum + item.amount, 0);
  const monthlyExpense = records
    .filter((r) => r.type === "expense" && getMonthKey(r.date) === currentMonth)
    .reduce((sum, item) => sum + item.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  monthlyBalanceEl.textContent = formatCurrency(monthlyBalance);
  monthlyBalanceEl.className =
    monthlyBalance >= 0
      ? "text-emerald-600 font-semibold"
      : "text-rose-600 font-semibold";
}

function renderIncome() {
  const incomeRecords = records.filter((r) => r.type === "income");
  incomeCountEl.innerHTML = `<span class="text-sm font-semibold">${incomeRecords.length} سجل</span>`;

  incomeTableEl.innerHTML = incomeRecords.length
    ? incomeRecords
        .map(
          (record) => `
      <tr class="border-b border-emerald-100 hover:bg-emerald-50">
        <td colspan="3" class="px-4 py-3 text-right text-slate-700 w-full break-words">${record.description}</td>
      </tr>
      <tr class="border-b border-emerald-100 hover:bg-emerald-50 border-b-4">
        <td class="px-4 py-3 text-center text-slate-600 w-1/3">${formatArabicDate(record.date)}</td>
        <td class="px-4 py-3 text-right font-semibold text-emerald-600 w-1/3">${formatCurrency(record.amount)}</td>
        <td class="px-4 py-3 text-center flex gap-2 justify-center w-1/3">
          <button type="button" class="edit-record inline-flex items-center justify-center px-3 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200" data-id="${record.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="delete-record inline-flex items-center justify-center px-3 py-2 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200" data-id="${record.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `,
        )
        .join("")
    : '<tr><td colspan="4" class="px-4 py-8 text-center text-slate-500">لا توجد إيرادات</td></tr>';

  attachEventListeners();
}

function renderExpense() {
  const expenseRecords = records.filter((r) => r.type === "expense");
  expenseCountEl.innerHTML = `<span class="text-sm font-semibold">${expenseRecords.length} سجل</span>`;

  expenseTableEl.innerHTML = expenseRecords.length
    ? expenseRecords
        .map(
          (record) => `
      <tr class="border-b border-rose-100 hover:bg-rose-50">
        <td colspan="3" class="px-4 py-3 text-right text-slate-700 w-full break-words">${record.description}</td>
      </tr>
      <tr class="border-b border-rose-100 hover:bg-rose-50">
        <td class="px-4 py-3 text-center text-slate-600 w-1/3">${formatArabicDate(record.date)}</td>
        <td class="px-4 py-3 text-right font-semibold text-rose-600 w-1/3">${formatCurrency(record.amount)}</td>
        <td class="px-4 py-3 text-center flex gap-2 justify-center w-1/3">
          <button type="button" class="edit-record inline-flex items-center justify-center px-3 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200" data-id="${record.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="delete-record inline-flex items-center justify-center px-3 py-2 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200" data-id="${record.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `,
        )
        .join("")
    : '<tr><td colspan="4" class="px-4 py-8 text-center text-slate-500">لا توجد مصروفات</td></tr>';

  attachEventListeners();
}

function renderMonthlyBreakdown() {
  // Group records by month
  const monthlyData = {};
  records.forEach((record) => {
    const monthKey = getMonthKey(record.date);
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        income: 0,
        expense: 0,
      };
    }
    if (record.type === "income") {
      monthlyData[monthKey].income += record.amount;
    } else {
      monthlyData[monthKey].expense += record.amount;
    }
  });

  // Sort months in descending order
  const sortedMonths = Object.keys(monthlyData).sort().reverse();

  monthlyTableEl.innerHTML = sortedMonths.length
    ? sortedMonths
        .map((monthKey) => {
          const data = monthlyData[monthKey];
          const balance = data.income - data.expense;
          return `
      <tr class="border-b border-slate-200 hover:bg-slate-50">
        <td class="px-4 py-3 text-left font-semibold text-slate-700">${getMonthName(monthKey)}</td>
        <td class="px-4 py-3 text-right text-emerald-600 font-semibold">${formatCurrency(data.income)}</td>
        <td class="px-4 py-3 text-right text-rose-600 font-semibold">${formatCurrency(data.expense)}</td>
        <td class="px-4 py-3 text-right font-semibold ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}">${formatCurrency(balance)}</td>
      </tr>
    `;
        })
        .join("")
    : '<tr><td colspan="4" class="px-4 py-8 text-center text-slate-500">لا توجد بيانات</td></tr>';
}

function attachEventListeners() {
  document.querySelectorAll(".edit-record").forEach((button) => {
    button.addEventListener("click", () => openEditPopup(button.dataset.id));
  });

  document.querySelectorAll(".delete-record").forEach((button) => {
    button.addEventListener("click", () => confirmDelete(button.dataset.id));
  });
}

function resetForm() {
  form.reset();
  document.getElementById("date").valueAsDate = new Date();
}

function openEditPopup(id) {
  const record = records.find((item) => item.id === id);
  if (!record) return;

  Swal.fire({
    title: "تعديل السجل",
    html: `
      <input id="swal-description" class="swal2-input" placeholder="الوصف" value="${record.description}">
      <select id="swal-type" class="swal2-select">
        <option value="income" ${record.type === "income" ? "selected" : ""}>إيراد</option>
        <option value="expense" ${record.type === "expense" ? "selected" : ""}>مصروف</option>
      </select>
      <input id="swal-date" type="date" class="swal2-input" value="${record.date}">
      <input id="swal-amount" type="number" min="0" step="0.01" class="swal2-input" placeholder="المبلغ" value="${record.amount}">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "حفظ",
    preConfirm: () => {
      const description = document
        .getElementById("swal-description")
        .value.trim();
      const type = document.getElementById("swal-type").value;
      const date = document.getElementById("swal-date").value;
      const amount = parseFloat(document.getElementById("swal-amount").value);
      if (!description || !date || Number.isNaN(amount) || amount <= 0) {
        Swal.showValidationMessage("يرجى إدخال جميع البيانات بشكل صحيح.");
      }
      return { description, type, date, amount };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      record.description = result.value.description;
      record.type = result.value.type;
      record.date = result.value.date;
      record.amount = result.value.amount;
      saveRecords();
      renderIncome();
      renderExpense();
      renderMonthlyBreakdown();
      updateTotals();
      Swal.fire("تم التعديل", "تم تحديث السجل بنجاح.", "success");
    }
  });
}

function confirmDelete(id) {
  Swal.fire({
    title: "هل تريد حذف هذا السجل؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "حذف",
    cancelButtonText: "إلغاء",
    confirmButtonColor: "#dc2626",
  }).then((result) => {
    if (result.isConfirmed) {
      records = records.filter((item) => item.id !== id);
      saveRecords();
      renderIncome();
      renderExpense();
      renderMonthlyBreakdown();
      updateTotals();
      Swal.fire("تم الحذف", "تم حذف السجل بنجاح.", "success");
    }
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const description = form.elements.description.value.trim();
  const type = form.elements.type.value;
  const date = form.elements.date.value;
  const amount = parseFloat(form.elements.amount.value);

  if (!description || !date || Number.isNaN(amount) || amount <= 0) {
    Swal.fire("خطأ في الإدخال", "يرجى إدخال جميع البيانات بشكل صحيح.", "error");
    return;
  }

  records.push({
    id: crypto.randomUUID(),
    description,
    type,
    date,
    amount,
  });

  saveRecords();
  renderIncome();
  renderExpense();
  renderMonthlyBreakdown();
  updateTotals();
  Swal.fire({
    title: "تم الحفظ",
    text: "تم حفظ المعاملة بنجاح.",
    icon: "success",
    timer: 1400,
    showConfirmButton: false,
  });
  resetForm();
});

// Initial render
renderIncome();
renderExpense();
renderMonthlyBreakdown();
updateTotals();
