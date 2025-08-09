export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: string;
  endDate?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: "checking" | "savings" | "credit" | "cash";
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyBudget: number;
  remainingBudget: number;
}
