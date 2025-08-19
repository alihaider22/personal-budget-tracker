"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Download } from "lucide-react";
import { Category, Transaction } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCategories,
  addCategory,
  deleteCategory,
  getTransactions,
  deleteTransaction,
} from "@/lib/firebaseServices";
import ProtectedRoute from "@/components/ProtectedRoute";
import { exportTransactionsAsJSON } from "@/utils";

export default function SettingsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#6b7280",
  });

  // Load data from Firebase
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
        const [categoriesData, transactionsData] = await Promise.all([
          getCategories(currentUser.uid),
          getTransactions(currentUser.uid),
        ]);
        setCategories(categoriesData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, authLoading]);

  // Helper function to check if a category is a default category
  const isDefaultCategory = (category: Category) => {
    // Default categories don't have a userId field
    return !category.hasOwnProperty("userId");
  };

  const handleAddCategory = async () => {
    if (!currentUser || !newCategory.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const categoryData = {
        name: newCategory.name.trim(),
        type: newCategory.type,
        color: newCategory.color,
      };

      const newCategoryDoc = await addCategory(categoryData, currentUser.uid);
      setCategories((prev) => [...prev, newCategoryDoc]);

      setNewCategory({
        name: "",
        type: "expense",
        color: "#6b7280",
      });
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find((cat) => cat.id === id);
    if (!category) return;

    // Don't allow deletion of default categories
    if (isDefaultCategory(category)) {
      alert(
        "Default categories cannot be deleted. You can only delete your custom categories."
      );
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete this category? This will also remove it from all transactions."
      )
    ) {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category");
      }
    }
  };

  const handleExportData = async () => {
    if (!currentUser) return;

    try {
      setExporting(true);

      // Get fresh transactions data from Firebase
      const transactionsData = await getTransactions(currentUser.uid);

      // Use shared export function
      exportTransactionsAsJSON(
        transactionsData,
        currentUser.email || undefined
      );

      alert("Transactions exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export transactions");
    } finally {
      setExporting(false);
    }
  };

  const handleClearAllData = async () => {
    if (!currentUser) return;

    const confirmMessage = `Are you sure you want to delete ALL your data? This will permanently delete:
    
• ${transactions.length} transactions
• ${
      categories.filter((cat) => !isDefaultCategory(cat)).length
    } custom categories

This action cannot be undone.`;

    if (confirm(confirmMessage)) {
      try {
        setClearing(true);

        // Delete all user transactions
        const deleteTransactionPromises = transactions.map((transaction) =>
          deleteTransaction(transaction.id)
        );
        await Promise.all(deleteTransactionPromises);

        // Delete all user categories (not default ones)
        const userCategories = categories.filter(
          (cat) => !isDefaultCategory(cat)
        );
        const deleteCategoryPromises = userCategories.map((category) =>
          deleteCategory(category.id)
        );
        await Promise.all(deleteCategoryPromises);

        // Clear local state
        setTransactions([]);
        setCategories(categories.filter((cat) => isDefaultCategory(cat)));

        alert("All data has been cleared successfully!");
      } catch (error) {
        console.error("Error clearing data:", error);
        alert("Failed to clear data. Please try again.");
      } finally {
        setClearing(false);
      }
    }
  };

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
          <p className="mt-4 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your budget tracker preferences
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories Management */}
          <div className="bg-card rounded-lg shadow mb-8 border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Categories
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your income and expense categories
              </p>
            </div>

            <div className="p-6">
              {/* Add New Category */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground placeholder-muted-foreground"
                />

                <select
                  value={newCategory.type}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      type: e.target.value as "income" | "expense",
                    })
                  }
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>

                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, color: e.target.value })
                  }
                  className="w-full h-10 border border-border rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />

                <button
                  onClick={handleAddCategory}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {/* Categories List */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">
                  Income Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories
                    .filter((cat) => cat.type === "income")
                    .map((category) => {
                      const isDefault = isDefaultCategory(category);
                      return (
                        <div
                          key={category.id}
                          className={`flex items-center justify-between p-4 border rounded-lg ${
                            isDefault
                              ? "border-border bg-muted"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <div>
                              <span className="font-medium text-foreground">
                                {category.name}
                              </span>
                              {isDefault && (
                                <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          {!isDefault && (
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>

                <h3 className="font-medium text-foreground mt-6">
                  Expense Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories
                    .filter((cat) => cat.type === "expense")
                    .map((category) => {
                      const isDefault = isDefaultCategory(category);
                      return (
                        <div
                          key={category.id}
                          className={`flex items-center justify-between p-4 border rounded-lg ${
                            isDefault
                              ? "border-border bg-muted"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <div>
                              <span className="font-medium text-foreground">
                                {category.name}
                              </span>
                              {isDefault && (
                                <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          {!isDefault && (
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-card rounded-lg shadow border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Data Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your data and preferences
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download your transactions as JSON
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {exporting ? "Exporting..." : "Export"}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">
                    Clear All Data
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Delete all transactions and start fresh
                  </p>
                </div>
                <button
                  onClick={handleClearAllData}
                  disabled={clearing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {clearing ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Clear Data"
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
