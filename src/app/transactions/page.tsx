"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Transaction, Category } from "@/types";
import {
  formatCurrency,
  formatDate,
  exportTransactionsAsCSV,
  exportTransactionsAsJSON,
} from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTransactions,
  getCategories,
  deleteTransaction,
} from "@/lib/firebaseServices";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function TransactionsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside export dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <p className="mt-4 text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesCategory =
      filterCategory === "" || transaction.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDeleteTransaction = async (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    const confirmMessage = `Are you sure you want to delete "${
      transaction.description
    }" (${formatCurrency(transaction.amount)})?`;

    if (confirm(confirmMessage)) {
      try {
        setDeletingTransactionId(id);
        await deleteTransaction(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction");
      } finally {
        setDeletingTransactionId(null);
      }
    }
  };

  const handleExportTransactions = () => {
    exportTransactionsAsCSV(filteredTransactions);
  };

  const handleExportJSON = () => {
    exportTransactionsAsJSON(
      filteredTransactions,
      currentUser?.email || undefined
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Transactions
                </h1>
                <p className="text-muted-foreground">
                  View and manage all your transactions
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-card rounded-lg shadow p-6 mb-6 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground placeholder-muted-foreground"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "all" | "income" | "expense")
                }
                className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Export Button */}
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>

                {showExportDropdown && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10"
                    ref={exportDropdownRef}
                  >
                    <button
                      onClick={() => {
                        handleExportTransactions();
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted border-b border-border"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        handleExportJSON();
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                      Export as JSON
                    </button>
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || filterType !== "all" || filterCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterCategory("");
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-muted-foreground">No transactions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-muted">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">
                            {transaction.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">
                            {transaction.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === "income"
                                ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-semibold ${
                              transaction.type === "income"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            disabled={deletingTransactionId === transaction.id}
                            className={`text-sm font-medium transition-colors ${
                              deletingTransactionId === transaction.id
                                ? "text-muted-foreground cursor-not-allowed"
                                : "text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            }`}
                          >
                            {deletingTransactionId === transaction.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
