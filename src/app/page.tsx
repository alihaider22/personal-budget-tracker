"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Transaction, Category, DashboardStats } from "@/types";
import {
  formatCurrency,
  formatDate,
  getCurrentMonthRange,
  calculateTotalByType,
} from "@/utils";
import TransactionForm from "@/components/TransactionForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTransactions,
  getCategories,
  addTransaction,
} from "@/lib/firebaseServices";

export default function Dashboard() {
  const { currentUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    monthlyBudget: 0,
    remainingBudget: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from Firebase when user is authenticated
  useEffect(() => {
    // Don't load data if still checking authentication
    if (authLoading) return;
    
    // If no user is authenticated, don't try to load data
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [transactionsData, categoriesData] = await Promise.all([
          getTransactions(currentUser.uid),
          getCategories(currentUser.uid),
        ]);

        setTransactions(transactionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, authLoading]);

  // Remove localStorage save effect - data is now saved to Firebase

  // Calculate stats whenever transactions change
  useEffect(() => {
    const currentMonthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const startOfMonth = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth(),
        1
      );
      const endOfMonth = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + 1,
        0
      );

      return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
    });

    const totalIncome = calculateTotalByType(
      currentMonthTransactions,
      "income"
    );
    const totalExpenses = calculateTotalByType(
      currentMonthTransactions,
      "expense"
    );
    const netIncome = totalIncome - totalExpenses;

    setStats({
      totalIncome,
      totalExpenses,
      netIncome,
      monthlyBudget: 300, // Default monthly budget
      remainingBudget: 300 - totalExpenses,
    });
  }, [transactions, selectedMonth]);

  const handleAddTransaction = () => {
    setIsTransactionFormOpen(true);
  };

  const handleSaveTransaction = async (
    transaction: Omit<Transaction, "id">
  ) => {
    if (!currentUser) return;

    try {
      const newTransaction = await addTransaction(transaction, currentUser.uid);
      setTransactions((prev) => [newTransaction, ...prev]);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while loading data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Budget Tracker
                </h1>
                <p className="text-gray-600">Manage your finances with ease</p>
              </div>
              <button
                onClick={handleAddTransaction}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalIncome)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.totalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Net Income
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      stats.netIncome >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(stats.netIncome)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Remaining Budget
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      stats.remainingBudget >= 0
                        ? "text-purple-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(stats.remainingBudget)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Transactions
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">
                    No transactions yet. Add your first transaction to get
                    started!
                  </p>
                </div>
              ) : (
                transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3`}
                        style={{ backgroundColor: "#6b7280" }}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Transaction Form Modal */}
        <TransactionForm
          isOpen={isTransactionFormOpen}
          onClose={() => setIsTransactionFormOpen(false)}
          onSave={handleSaveTransaction}
          categories={categories}
        />
      </div>
    </ProtectedRoute>
  );
}
