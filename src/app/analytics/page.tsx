"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { Transaction, Category } from "@/types";
import { formatCurrency, calculateTotalByType } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactions, getCategories } from "@/lib/firebaseServices";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AnalyticsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show loading while loading data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

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

  const totalIncome = calculateTotalByType(currentMonthTransactions, "income");
  const totalExpenses = calculateTotalByType(
    currentMonthTransactions,
    "expense"
  );
  const netIncome = totalIncome - totalExpenses;

  // Calculate category breakdown
  const categoryBreakdown = categories
    .filter((category) => category.type === "expense")
    .map((category) => {
      const categoryTransactions = currentMonthTransactions.filter(
        (transaction) =>
          transaction.category === category.name &&
          transaction.type === "expense"
      );
      const total = categoryTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      return {
        name: category.name,
        total,
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
        color: category.color,
      };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Analytics
                </h1>
                <p className="text-muted-foreground">
                  Insights into your spending patterns
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg shadow p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly Income
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Net Income
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      netIncome >= 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(netIncome)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg shadow border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Expense by Category
                </h2>
              </div>
              <div className="p-6">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-muted-foreground text-center">
                    No expenses recorded for this month.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.map((category) => (
                      <div
                        key={category.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-sm font-medium text-foreground">
                            {category.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(category.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {category.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-lg shadow border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Spending Trends
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Income vs Expenses
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {formatCurrency(totalIncome)}
                      </span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {formatCurrency(totalExpenses)}
                      </span>
                    </div>
                  </div>

                  {/* Simple progress bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-red-400 h-2 rounded-full"
                      style={{
                        width: `${
                          totalIncome + totalExpenses > 0
                            ? (totalExpenses / (totalIncome + totalExpenses)) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {totalIncome + totalExpenses > 0
                          ? (
                              (totalIncome / (totalIncome + totalExpenses)) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-muted-foreground">Income</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {totalIncome + totalExpenses > 0
                          ? (
                              (totalExpenses / (totalIncome + totalExpenses)) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-muted-foreground">Expenses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-card rounded-lg shadow border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-border">
              {currentMonthTransactions.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-muted-foreground">
                    No transactions recorded for this month.
                  </p>
                </div>
              ) : (
                currentMonthTransactions.slice(0, 10).map((transaction) => (
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
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
