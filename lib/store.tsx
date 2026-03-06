import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { api } from "./api"

export type Customer = {
  id: string
  name: string
  phone: string
  address: string
  idProof: string
  notes: string
  createdAt: string
}

export type Loan = {
  id: string
  customerId: string
  amount: number
  interestRate: number
  startDate: string
  notes: string
  status: "active" | "closed" | "overdue"
  closedDate?: string
}

export type Payment = {
  id: string
  loanId: string
  customerId: string
  date: string
  amount: number
  notes: string
  type: "interest" | "closure"
}

export type Notification = {
  id: string
  type: "overdue" | "reminder" | "info"
  message: string
  customerName: string
  date: string
  read: boolean
}

export type Screen =
  | "login"
  | "dashboard"
  | "customers"
  | "add-customer"
  | "edit-customer"
  | "customer-profile"
  | "loans"
  | "add-loan"
  | "collections"
  | "payment-entry"
  | "reports"
  | "notifications"
  | "settings"

type AppState = {
  screen: Screen
  setScreen: (screen: Screen) => void
  isLoggedIn: boolean
  setIsLoggedIn: (v: boolean) => void
  user: { id: string, name: string, email: string, role: string } | null
  setUser: (user: any) => void
  loadDataForUser: (user: AppState["user"]) => Promise<void>
  customers: Customer[]
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => Promise<void>
  updateCustomer: (id: string, c: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  loans: Loan[]
  addLoan: (l: Omit<Loan, "id" | "status">) => Promise<void>
  closeLoan: (id: string, data: { paymentAmount: number, paymentDate: string, notes: string }) => Promise<void>
  payments: Payment[]
  addPayment: (p: Omit<Payment, "id">) => Promise<void>
  updatePayment: (id: string, p: Partial<Payment>) => Promise<void>
  deletePayment: (id: string) => Promise<void>
  notifications: Notification[]
  markNotificationRead: (id: string) => Promise<void>
  selectedCustomerId: string | null
  setSelectedCustomerId: (id: string | null) => void
  editingCustomerId: string | null
  setEditingCustomerId: (id: string | null) => void
  editingPaymentId: string | null
  setEditingPaymentId: (id: string | null) => void
  settings: {
    companyName: string
    defaultInterestRate: number
    darkMode: boolean
  }
  updateSettings: (s: Partial<AppState["settings"]>) => Promise<void>
  changePassword: (data: any) => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be inside AppProvider")
  return ctx
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("login")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<AppState["user"]>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    companyName: "Nexurah",
    defaultInterestRate: 3,
    darkMode: false,
  })

  // loadDataForUser: called directly after login with the fresh user object.
  // This avoids the React stale-closure bug where refreshData sees user=null
  // because state updates are batched and the callback hasn't been recreated yet.
  const loadDataForUser = useCallback(async (loggedInUser: AppState["user"]) => {
    if (!loggedInUser) return
    try {
      const scopedId = loggedInUser.id
      const [c, l, p, n, s] = await Promise.all([
        api.getCustomers(scopedId),
        api.getLoans(scopedId),
        api.getPayments(scopedId),
        api.getNotifications(scopedId),
        api.getSettings(),
      ])
      setCustomers(c)
      setLoans(l)
      setPayments(p)
      setNotifications(n)
      if (s.companyName) {
        setSettings(prev => ({ ...prev, ...s }))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }, [])

  // Expose refresh for use after adding/editing data
  const refreshData = useCallback(() => {
    if (user) loadDataForUser(user)
  }, [user, loadDataForUser])

  const changePassword = useCallback(async (data: any) => {
    if (!user) return
    await api.changePassword(user.id, data)
  }, [user])

  const addCustomer = useCallback(async (c: Omit<Customer, "id" | "createdAt">) => {
    if (!user) return
    const newCustomer = await api.addCustomer({ ...c, userId: user.id })
    setCustomers((prev) => [newCustomer, ...prev])
  }, [user])

  const updateCustomer = useCallback(async (id: string, c: Partial<Customer>) => {
    if (!user) return
    const updated = await api.updateCustomer(id, c, user.id)
    setCustomers((prev) => prev.map((cust) => (cust.id === id ? { ...cust, ...updated } : cust)))
  }, [user])

  const deleteCustomer = useCallback(async (id: string) => {
    if (!user) return
    await api.deleteCustomer(id, user.id)
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }, [user])

  const addLoan = useCallback(async (l: Omit<Loan, "id" | "status">) => {
    if (!user) return
    const newLoan = await api.addLoan({ ...l, userId: user.id })
    setLoans((prev) => [...prev, newLoan])
  }, [user])

  const closeLoan = useCallback(async (id: string, data: { paymentAmount: number, paymentDate: string, notes: string }) => {
    if (!user) return
    const result = await api.closeLoan(id, { ...data, userId: user.id }, user.id)
    // Refresh both loans and payments to ensure consistency
    setLoans((prev) => prev.map((l) => (l.id === id ? result.loan : l)))
    setPayments((prev) => [result.payment, ...prev])
  }, [user])

  const addPayment = useCallback(async (p: Omit<Payment, "id">) => {
    if (!user) return
    const newPayment = await api.addPayment({ ...p, userId: user.id })
    setPayments((prev) => [newPayment, ...prev])
  }, [user])

  const updatePayment = useCallback(async (id: string, p: Partial<Payment>) => {
    if (!user) return
    const updated = await api.updatePayment(id, p, user.id)
    setPayments((prev) => prev.map((pay) => (pay.id === id ? { ...pay, ...updated } : pay)))
  }, [user])

  const deletePayment = useCallback(async (id: string) => {
    if (!user) return
    await api.deletePayment(id, user.id)
    setPayments((prev) => prev.filter((p) => p.id !== id))
  }, [user])

  const markNotificationRead = useCallback(async (id: string) => {
    await api.markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const updateSettings = useCallback(async (s: Partial<AppState["settings"]>) => {
    const updated = await api.updateSettings(s)
    setSettings((prev) => ({ ...prev, ...updated }))
  }, [])

  return (
    <AppContext.Provider
      value={{
        screen, setScreen,
        isLoggedIn, setIsLoggedIn,
        user, setUser, loadDataForUser,
        customers, addCustomer, updateCustomer, deleteCustomer,
        loans, addLoan, closeLoan,
        selectedCustomerId, setSelectedCustomerId,
        editingCustomerId, setEditingCustomerId,
        editingPaymentId, setEditingPaymentId,
        payments, addPayment, updatePayment, deletePayment,
        notifications, markNotificationRead,
        settings, updateSettings,

        changePassword,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
