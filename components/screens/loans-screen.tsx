"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Calculator, Plus, Eye, Search, Filter, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/lib/store"

export function LoansScreen() {
  const { loans, customers, payments, setScreen, setSelectedCustomerId } = useApp()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  const filteredAndSortedLoans = useMemo(() => {
    let result = loans.map(loan => ({
      ...loan,
      customerName: customers.find(c => c.id === loan.customerId)?.name || "Unknown"
    }))

    // Filter
    if (search) {
      result = result.filter(l => l.customerName.toLowerCase().includes(search.toLowerCase()))
    }
    if (statusFilter !== "all") {
      result = result.filter(l => l.status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc": return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        case "date-asc": return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case "amount-desc": return b.amount - a.amount
        case "amount-asc": return a.amount - b.amount
        case "rate-desc": return b.interestRate - a.interestRate
        case "rate-asc": return a.interestRate - b.interestRate
        case "name-asc": return a.customerName.localeCompare(b.customerName)
        case "name-desc": return b.customerName.localeCompare(a.customerName)
        default: return 0
      }
    })

    return result
  }, [loans, customers, search, statusFilter, sortBy])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Loans</h1>
          <p className="text-sm text-muted-foreground">
            Manage all active and closed loans ({loans.length} total)
          </p>
        </div>
        <Button onClick={() => setScreen("add-loan")}>
          <Plus className="mr-2 size-4" /> Add Loan
        </Button>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                  <SelectItem value="amount-desc">Amount (High-Low)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Low-High)</SelectItem>
                  <SelectItem value="rate-desc">Interest (High-Low)</SelectItem>
                  <SelectItem value="rate-asc">Interest (Low-High)</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Loan Amount</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Monthly Interest</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedLoans.map((loan) => {
                const monthlyInterest = loan.amount * (loan.interestRate / 100)
                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.customerName}</TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{loan.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">{loan.interestRate}%</TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{monthlyInterest.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(loan.startDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          loan.status === "active"
                            ? "border-chart-2/30 bg-chart-2/10 text-chart-2"
                            : "text-muted-foreground"
                        }
                      >
                        {loan.status === "active" ? "Active" : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setSelectedCustomerId(loan.customerId)
                          setScreen("customer-profile")
                        }}
                      >
                        <Eye className="size-4" />
                        <span className="sr-only">View loan details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredAndSortedLoans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No loans found matching your filters.
                  </TableCell>
                </TableRow>
              )}

            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export function AddLoanScreen() {
  const { customers, addLoan, setScreen, settings } = useApp()
  const [form, setForm] = useState({
    customerId: "",
    amount: "",
    interestRate: String(settings.defaultInterestRate),
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const monthlyInterest = useMemo(() => {
    const amt = parseFloat(form.amount) || 0
    const rate = parseFloat(form.interestRate) || 0
    return amt * (rate / 100)
  }, [form.amount, form.interestRate])

  const handleSubmit = () => {
    if (!form.customerId || !form.amount || !form.interestRate) return
    addLoan({
      customerId: form.customerId,
      amount: parseFloat(form.amount),
      interestRate: parseFloat(form.interestRate),
      startDate: form.startDate,
      notes: form.notes,
    })
    setScreen("loans")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setScreen("loans")}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Loan</h1>
          <p className="text-sm text-muted-foreground">Create a new loan for a customer</p>
        </div>
      </div>

      <div className="grid max-w-3xl grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="border border-border lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Loan Details</CardTitle>
            <CardDescription>Fill in the loan information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>
                Select Customer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.customerId}
                onValueChange={(v) => setForm({ ...form, customerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="loanAmount">
                  Loan Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="loanAmount"
                  type="number"
                  placeholder="e.g., 50000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="interestRate">
                  Interest % <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 3"
                  value={form.interestRate}
                  onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="loanNotes">Notes</Label>
              <Textarea
                id="loanNotes"
                placeholder="Loan purpose or notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setScreen("loans")}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.customerId || !form.amount || !form.interestRate}
              >
                Create Loan
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border lg:col-span-2 h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="size-4 text-primary" />
              <CardTitle className="text-base">Calculation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 rounded-lg bg-secondary p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loan Amount</span>
                <span className="font-mono font-semibold text-foreground">
                  ₹{(parseFloat(form.amount) || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Interest Rate</span>
                <span className="font-mono font-semibold text-foreground">
                  {form.interestRate || 0}%
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Monthly Interest</span>
                  <span className="text-lg font-bold text-primary font-mono">
                    ₹{monthlyInterest.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
