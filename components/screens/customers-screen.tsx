"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useApp } from "@/lib/store"

export function CustomersScreen() {
  const {
    customers,
    loans,
    payments,
    deleteCustomer,
    setScreen,
    setSelectedCustomerId,
    setEditingCustomerId,
    searchQuery: search,
    setSearchQuery: setSearch,
  } = useApp()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [amountFilter, setAmountFilter] = useState<string>("all")

  const getCustomerLoanInfo = (customerId: string) => {
    const customerLoans = loans.filter(
      (l) => l.customerId === customerId && l.status === "active"
    )
    const totalLoan = customerLoans.reduce((sum, l) => sum + l.amount, 0)
    const totalInterest = customerLoans.reduce(
      (sum, l) => sum + l.amount * (l.interestRate / 100),
      0
    )
    const customerPayments = payments.filter((p) => p.customerId === customerId)
    const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0)
    const hasUnpaid = totalInterest > 0
    return {
      totalLoan,
      interestRate: customerLoans[0]?.interestRate || 0,
      totalPaid,
      hasActiveLoan: customerLoans.length > 0,
      loanCount: customerLoans.length,
    }
  }

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const info = getCustomerLoanInfo(c.id)
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && info.hasActiveLoan) ||
      (statusFilter === "inactive" && !info.hasActiveLoan)
    const matchAmount =
      amountFilter === "all" ||
      (amountFilter === "low" && info.totalLoan <= 50000) ||
      (amountFilter === "medium" && info.totalLoan > 50000 && info.totalLoan <= 100000) ||
      (amountFilter === "high" && info.totalLoan > 100000)
    return matchSearch && matchStatus && matchAmount
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your customer database ({customers.length} total)
          </p>
        </div>
        <Button onClick={() => setScreen("add-customer")}>
          <Plus className="mr-2 size-4" /> Add Customer
        </Button>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
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
                  <SelectItem value="active">Active Loan</SelectItem>
                  <SelectItem value="inactive">No Loan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={amountFilter} onValueChange={setAmountFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Loan Amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="low">{"Up to ₹50K"}</SelectItem>
                  <SelectItem value="medium">{"₹50K - ₹1L"}</SelectItem>
                  <SelectItem value="high">{"Above ₹1L"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Loan Amount</TableHead>
                <TableHead className="text-right">Interest Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => {
                const info = getCustomerLoanInfo(customer.id)
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="size-3" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{info.totalLoan.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {info.interestRate > 0 ? `${info.interestRate}%` : "-"}
                    </TableCell>
                    <TableCell>
                      {info.hasActiveLoan ? (
                        <Badge
                          variant="outline"
                          className="border-chart-2/30 bg-chart-2/10 text-chart-2"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No Loan
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => {
                                  setSelectedCustomerId(customer.id)
                                  setScreen("customer-profile")
                                }}
                              >
                                <Eye className="size-4" />
                                <span className="sr-only">View profile</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Profile</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => {
                                  setEditingCustomerId(customer.id)
                                  setScreen("edit-customer")
                                }}
                              >
                                <Pencil className="size-4" />
                                <span className="sr-only">Edit customer</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="size-4" />
                                    <span className="sr-only">Delete customer</span>
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {customer.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteCustomer(customer.id)}
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No customers found.
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
