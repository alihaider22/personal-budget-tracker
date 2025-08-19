"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Note: Removed body scroll lock to allow main content to remain scrollable

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/transactions", label: "Transactions", icon: CreditCard },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <>
      <nav className="shadow-sm border-b relative z-50 bg-card border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Desktop User Info and Theme Toggle */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {currentUser && (
                <>
                  <div className="flex items-center text-sm text-foreground">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden lg:inline">
                      {currentUser.email}
                    </span>
                    <span className="lg:hidden">User</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed inset-y-0 right-0 w-80 shadow-xl transform transition-transform duration-300 ease-in-out bg-card">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Budget Tracker
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 transition-colors text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 px-6 py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Theme Toggle for Mobile */}
              <div className="px-6 py-4 border-t border-border">
                <ThemeToggle />
              </div>

              {/* User Info Section */}
              {currentUser && (
                <div className="p-6 border-t border-border bg-muted">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-foreground">
                        User
                      </p>
                      <p className="text-xs truncate text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-background"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
