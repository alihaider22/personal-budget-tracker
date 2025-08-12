import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Transaction, Category } from "@/types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startOfMonth, endOfMonth };
};

export const filterTransactionsByMonth = (
  transactions: Transaction[],
  date: Date
) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return transactions.filter((transaction) => {
    const transactionDate = parseISO(transaction.date);
    return transactionDate >= start && transactionDate <= end;
  });
};

export const calculateTotalByType = (
  transactions: Transaction[],
  type: "income" | "expense"
): number => {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
};

export const getCategoryColor = (
  categoryId: string,
  categories: Category[]
) => {
  const category = categories.find((cat) => cat.id === categoryId);
  return category?.color || "#6b7280";
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Export utilities
export const exportTransactionsAsCSV = (transactions: Transaction[]) => {
  if (transactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  // Create CSV content
  const headers = ["Date", "Description", "Category", "Type", "Amount"];
  const csvContent = [
    headers.join(","),
    ...transactions.map((transaction) =>
      [
        formatDate(transaction.date),
        `"${transaction.description}"`,
        `"${transaction.category}"`,
        transaction.type,
        transaction.amount,
      ].join(",")
    ),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `transactions_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTransactionsAsJSON = (
  transactions: Transaction[],
  userEmail?: string
) => {
  if (transactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  // Create export data
  const exportData = {
    exportedAt: new Date().toISOString(),
    user: userEmail,
    transactions: transactions,
    summary: {
      totalTransactions: transactions.length,
      totalIncome: transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    },
  };

  // Create JSON content
  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `transactions-export-${new Date().toISOString().split("T")[0]}.json`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
