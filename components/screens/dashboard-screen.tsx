"use client"

import {
  Users,
  Landmark,
  IndianRupee,
  CalendarCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { useApp } from "@/lib/store"

const monthlyCollectionData = [
  { month: "Jul", amount: 1500 },
  { month: "Aug", amount: 5500 },
  { month: "Sep", amount: 7550 },
  { month: "Oct", amount: 8800 },
  { month: "Nov", amount: 11750 },
  { month: "Dec", amount: 4000 },
  { month: "Jan", amount: 4000 },
]

export function DashboardScreen() {
  const { customers, loans, payments, notifications, setScreen, setSelectedCustomerId } = useApp()

  const totalCustomers = customers.length
  const activeLoans = loans.filter((l) => l.status === "active").length
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const monthlyCollection = payments
    .filter((p) => p.date.startsWith("2026-01") || p.date.startsWith("2025-12"))
    .reduce((sum, p) => sum + p.amount, 0)
  const totalLoanAmount = loans.filter((l) => l.status === "active").reduce((sum, l) => sum + l.amount, 0)
  const overdueCount = notifications.filter((n) => n.type === "overdue" && !n.read).length

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const statCards = [
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
      trend: "+2 this month",
      trendUp: true,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Loans",
      value: activeLoans,
      icon: Landmark,
      trend: "+1 this month",
      trendUp: true,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Total Collected",
      value: `₹${totalCollected.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      trend: "+12% vs last month",
      trendUp: true,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Monthly Collection",
      value: `₹${monthlyCollection.toLocaleString("en-IN")}`,
      icon: CalendarCheck,
      trend: "Current cycle",
      trendUp: true,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Pending Amount",
      value: `₹${(totalLoanAmount - totalCollected).toLocaleString("en-IN")}`,
      icon: Clock,
      trend: `${activeLoans} active loans`,
      trendUp: false,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Overdue Customers",
      value: overdueCount,
      icon: AlertTriangle,
      trend: "Needs attention",
      trendUp: false,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, here{"'"}s your financial overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border border-border">
            <CardContent className="flex items-start gap-4 p-5">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <div className="flex items-center gap-1">
                  {stat.trendUp ? (
                    <ArrowUpRight className="size-3 text-chart-2" />
                  ) : (
                    <ArrowDownRight className="size-3 text-destructive" />
                  )}
                  <span className="text-xs text-muted-foreground">{stat.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Collection</CardTitle>
            <CardDescription>Interest collected over the past 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyCollectionData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.35 0.12 260)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.35 0.12 260)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 250)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.50 0.02 260)" />
                <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.50 0.02 260)" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Collected"]}
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.91 0.01 250)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="oklch(0.35 0.12 260)"
                  strokeWidth={2}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Loan Distribution</CardTitle>
            <CardDescription>Active loan amounts by customer</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={loans
                  .filter((l) => l.status === "active")
                  .map((l) => ({
                    name: customers.find((c) => c.id === l.customerId)?.name.split(" ")[0] || "Unknown",
                    amount: l.amount,
                  }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 250)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="oklch(0.50 0.02 260)" />
                <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.50 0.02 260)" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Loan Amount"]}
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.91 0.01 250)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="amount" fill="oklch(0.60 0.17 155)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments & Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Payments</CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
              </div>
              <button
                onClick={() => setScreen("collections")}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => {
                  const customer = customers.find((c) => c.id === payment.customerId)
                  return (
                    <TableRow
                      key={payment.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedCustomerId(payment.customerId)
                        setScreen("customer-profile")
                      }}
                    >
                      <TableCell className="font-medium">{customer?.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-chart-2/30 bg-chart-2/10 text-chart-2 text-xs"
                        >
                          Paid
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overdue Alerts</CardTitle>
            <CardDescription>Customers needing follow-up</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {notifications
              .filter((n) => n.type === "overdue")
              .map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">{n.customerName}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </div>
                </div>
              ))}
            {notifications.filter((n) => n.type === "reminder" && !n.read).length > 0 && (
              <div className="mt-1 border-t border-border pt-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Upcoming Reminders</p>
                {notifications
                  .filter((n) => n.type === "reminder" && !n.read)
                  .map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 rounded-lg border border-chart-4/20 bg-chart-4/5 p-3"
                    >
                      <Clock className="mt-0.5 size-4 shrink-0 text-chart-4" />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-foreground">{n.customerName}</p>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
