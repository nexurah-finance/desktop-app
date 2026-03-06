"use client"

import { useState, useMemo } from "react"
import {
  Download,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useApp } from "@/lib/store"

export function ReportsScreen() {
  const { payments, loans, customers, refreshData } = useApp()
  const [tab, setTab] = useState("daily")

  // Group payments by date
  const dailyData = useMemo(() => {
    const grouped = new Map<string, number>()
    payments.forEach((p) => {
      grouped.set(p.date, (grouped.get(p.date) || 0) + p.amount)
    })
    return Array.from(grouped.entries())
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [payments])

  // Group payments by month
  const monthlyData = useMemo(() => {
    const grouped = new Map<string, number>()
    payments.forEach((p) => {
      const monthKey = p.date.slice(0, 7)
      grouped.set(monthKey, (grouped.get(monthKey) || 0) + p.amount)
    })
    return Array.from(grouped.entries())
      .map(([month, amount]) => {
        const d = new Date(month + "-01")
        return {
          month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
          amount,
        }
      })
      .sort()
  }, [payments])

  // Loan summary
  const loanSummary = useMemo(() => {
    return loans.map((l) => {
      const customer = customers.find((c) => c.id === l.customerId)
      const loanPayments = payments.filter((p) => p.loanId === l.id)
      const totalPaid = loanPayments.reduce((sum, p) => sum + p.amount, 0)
      const monthlyInterest = l.amount * (l.interestRate / 100)
      return {
        id: l.id,
        customerName: customer?.name || "Unknown",
        loanAmount: l.amount,
        interestRate: l.interestRate,
        monthlyInterest,
        totalPaid,
        status: l.status,
      }
    })
  }, [loans, customers, payments])

  // Pie chart data for loan distribution
  const pieData = loans
    .filter((l) => l.status === "active")
    .map((l) => ({
      name: customers.find((c) => c.id === l.customerId)?.name.split(" ")[0] || "Unknown",
      value: l.amount,
    }))

  const PIE_COLORS = ["oklch(0.35 0.12 260)", "oklch(0.60 0.17 155)", "oklch(0.55 0.20 27)", "oklch(0.75 0.15 85)", "oklch(0.50 0.10 260)"]

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalLoanAmount = loans.filter((l) => l.status === "active").reduce((sum, l) => sum + l.amount, 0)
  const pendingInterest = loans
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + l.amount * (l.interestRate / 100), 0)

  const exportToExcel = () => {
    // 1. Daily Data
    const dailyWS = XLSX.utils.json_to_sheet(dailyData)
    // 2. Monthly Data
    const monthlyWS = XLSX.utils.json_to_sheet(monthlyData)
    // 3. Loan Summary
    const loanWS = XLSX.utils.json_to_sheet(loanSummary.map(l => ({
      Customer: l.customerName,
      "Loan Amount": l.loanAmount,
      "Interest %": l.interestRate,
      "Monthly Interest": l.monthlyInterest,
      "Total Paid": l.totalPaid,
      Status: l.status
    })))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, dailyWS, "Daily Collection")
    XLSX.utils.book_append_sheet(wb, monthlyWS, "Monthly Collection")
    XLSX.utils.book_append_sheet(wb, loanWS, "Loan Summary")

    XLSX.writeFile(wb, `Finance_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text("Finance Summary Report", 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 14, 30)

    // Summary Section
    doc.setTextColor(0)
    doc.setFontSize(14)
    doc.text("Overall Summary", 14, 45)
    doc.setFontSize(10)
    doc.text(`Total Collected: Rs. ${totalCollected.toLocaleString("en-IN")}`, 14, 55)
    doc.text(`Total Active Loans: Rs. ${totalLoanAmount.toLocaleString("en-IN")}`, 14, 62)
    doc.text(`Total Active Borrowers: ${loans.filter(l => l.status === "active").length}`, 14, 69)

    // Loan Summary Table
    doc.setFontSize(14)
    doc.text("Loan Details", 14, 85)
    
    autoTable(doc, {
      startY: 90,
      head: [['Customer', 'Loan Amount', 'Int %', 'Monthly Int', 'Total Paid', 'Status']],
      body: loanSummary.map(l => [
        l.customerName,
        `Rs. ${l.loanAmount.toLocaleString("en-IN")}`,
        `${l.interestRate}%`,
        `Rs. ${l.monthlyInterest.toLocaleString("en-IN")}`,
        `Rs. ${l.totalPaid.toLocaleString("en-IN")}`,
        l.status.toUpperCase()
      ]),
      headStyles: { fillColor: [50, 50, 200] }
    })

    doc.save(`Finance_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Detailed financial reports and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              const b = document.getElementById('sync-btn-icon')
              b?.classList.add('animate-spin')
              await refreshData()
              b?.classList.remove('animate-spin')
            }}
          >
            <TrendingUp id="sync-btn-icon" className="mr-2 size-4" /> Sync DB
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <FileSpreadsheet className="mr-2 size-4" /> Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileText className="mr-2 size-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-chart-2/10">
              <IndianRupee className="size-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Collected</p>
              <p className="font-mono text-lg font-bold text-foreground">₹{totalCollected.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Loans</p>
              <p className="font-mono text-lg font-bold text-foreground">₹{totalLoanAmount.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-chart-4/10">
              <AlertTriangle className="size-5 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Due</p>
              <p className="font-mono text-lg font-bold text-foreground">₹{pendingInterest.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Borrowers</p>
              <p className="text-lg font-bold text-foreground">{loans.filter((l) => l.status === "active").length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="daily">Daily Collection</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Collection</TabsTrigger>
          <TabsTrigger value="loans">Loan Summary</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily Collection</CardTitle>
              <CardDescription>Payments collected by date</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 250)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="oklch(0.50 0.02 260)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.50 0.02 260)" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Collected"]}
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.91 0.01 250)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="amount" fill="oklch(0.35 0.12 260)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Collection</CardTitle>
              <CardDescription>Aggregate payments by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 250)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="oklch(0.50 0.02 260)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.50 0.02 260)" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Collected"]}
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
        </TabsContent>

        <TabsContent value="loans" className="mt-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Loan Summary</CardTitle>
              <CardDescription>Overview of all loans and interest collected</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Loan Amount</TableHead>
                    <TableHead className="text-right">Interest %</TableHead>
                    <TableHead className="text-right">Monthly Interest</TableHead>
                    <TableHead className="text-right">Total Paid</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanSummary.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.customerName}</TableCell>
                      <TableCell className="text-right font-mono">₹{l.loanAmount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{l.interestRate}%</TableCell>
                      <TableCell className="text-right font-mono">₹{l.monthlyInterest.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right font-mono">₹{l.totalPaid.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            l.status === "active"
                              ? "border-chart-2/30 bg-chart-2/10 text-chart-2"
                              : "text-muted-foreground"
                          }
                        >
                          {l.status === "active" ? "Active" : "Closed"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Loan Distribution</CardTitle>
              <CardDescription>Active loan amounts by customer</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Loan Amount"]}
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.91 0.01 250)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
