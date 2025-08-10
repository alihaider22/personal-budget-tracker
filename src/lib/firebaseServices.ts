import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Transaction, Category, Budget } from "@/types";

// Transactions
export const addTransaction = async (
  transaction: Omit<Transaction, "id">,
  userId: string
) => {
  const docRef = await addDoc(collection(db, "transactions"), {
    ...transaction,
    userId,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...transaction };
};

export const getTransactions = async (userId: string) => {
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date,
    createdAt:
      doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
  })) as Transaction[];
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
) => {
  const docRef = doc(db, "transactions", id);
  await updateDoc(docRef, updates);
};

export const deleteTransaction = async (id: string) => {
  const docRef = doc(db, "transactions", id);
  await deleteDoc(docRef);
};

// Categories
export const addCategory = async (
  category: Omit<Category, "id">,
  userId: string
) => {
  const docRef = await addDoc(collection(db, "categories"), {
    ...category,
    userId,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...category };
};

export const getCategories = async (userId: string) => {
  const q = query(
    collection(db, "categories"),
    where("userId", "==", userId),
    orderBy("name")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
};

export const updateCategory = async (
  id: string,
  updates: Partial<Category>
) => {
  const docRef = doc(db, "categories", id);
  await updateDoc(docRef, updates);
};

export const deleteCategory = async (id: string) => {
  const docRef = doc(db, "categories", id);
  await deleteDoc(docRef);
};

// Budgets
export const addBudget = async (budget: Omit<Budget, "id">, userId: string) => {
  const docRef = await addDoc(collection(db, "budgets"), {
    ...budget,
    userId,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...budget };
};

export const getBudgets = async (userId: string) => {
  const q = query(
    collection(db, "budgets"),
    where("userId", "==", userId),
    orderBy("startDate", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate,
    endDate: doc.data().endDate,
  })) as Budget[];
};

export const updateBudget = async (id: string, updates: Partial<Budget>) => {
  const docRef = doc(db, "budgets", id);
  await updateDoc(docRef, updates);
};

export const deleteBudget = async (id: string) => {
  const docRef = doc(db, "budgets", id);
  await deleteDoc(docRef);
};
