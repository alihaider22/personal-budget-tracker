"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Category } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getCategories, addCategory, deleteCategory } from "@/lib/firebaseServices";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#6b7280",
  });

  // Load categories from Firebase
  useEffect(() => {
    if (!currentUser) return;

    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories(currentUser.uid);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [currentUser]);

  // Helper function to check if a category is a default category
  const isDefaultCategory = (category: Category) => {
    // Default categories don't have a userId field
    return !category.hasOwnProperty('userId');
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
      setCategories(prev => [...prev, newCategoryDoc]);

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
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    // Don't allow deletion of default categories
    if (isDefaultCategory(category)) {
      alert("Default categories cannot be deleted. You can only delete your custom categories.");
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete this category? This will also remove it from all transactions."
      )
    ) {
      try {
        await deleteCategory(id);
        setCategories(prev => prev.filter(cat => cat.id !== id));
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">
                  Manage your budget tracker preferences
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories Management */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              <p className="text-sm text-gray-600">
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
                />

                <select
                  value={newCategory.type}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      type: e.target.value as "income" | "expense",
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
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
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  onClick={handleAddCategory}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {/* Categories List */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Income Categories</h3>
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
                              ? 'border-gray-200 bg-gray-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <div>
                              <span className="font-medium text-gray-900">
                                {category.name}
                              </span>
                              {isDefault && (
                                <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          {!isDefault && (
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>

                <h3 className="font-medium text-gray-900 mt-6">
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
                              ? 'border-gray-200 bg-gray-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <div>
                              <span className="font-medium text-gray-900">
                                {category.name}
                              </span>
                              {isDefault && (
                                <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          {!isDefault && (
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900"
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Data Management
              </h2>
              <p className="text-sm text-gray-600">
                Manage your data and preferences
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-600">
                    Download your transactions as JSON
                  </p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Clear All Data</h3>
                  <p className="text-sm text-gray-600">
                    Delete all transactions and start fresh
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to clear all data? This action cannot be undone."
                      )
                    ) {
                      // Note: This would need to be implemented with Firebase delete operations
                      alert("Clear data functionality needs to be implemented with Firebase");
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear Data
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
