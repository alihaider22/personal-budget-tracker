import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Transaction, Category } from "@/types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return format(parseISO(date), "MMM dd, yyyy");
};

export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
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
) => {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
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
