"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/lib/store"

export function CollectionsScreen() {
  const { payments, customers, loans, setScreen, setSelectedCustomerId, setEditingPaymentId, deletePayment } = useApp()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  const filteredAndSorted = useMemo(() => {
    let result = payments.map((p) => {
      const customer = customers.find((c) => c.id === p.customerId)
      const loan = loans.find((l) => l.id === p.loanId)
      return { ...p, customerName: customer?.name || "Unknown", loanAmount: loan?.amount || 0 }
    })

    // Filter
    if (search) {
      result = result.filter((p) =>
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.notes?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc": return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc": return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "amount-desc": return b.amount - a.amount
        case "amount-asc": return a.amount - b.amount
        case "name-asc": return a.customerName.localeCompare(b.customerName)
        case "name-desc": return b.customerName.localeCompare(a.customerName)
        default: return 0
      }
    })

    return result
  }, [payments, customers, loans, search, sortBy])

  const currentMonthTotal = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    return payments
      .filter(p => {
        const d = new Date(p.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground">
            Total collected: ₹{totalCollected.toLocaleString("en-IN")} • This month: ₹{currentMonthTotal.toLocaleString("en-IN")}
          </p>
        </div>
        <Button onClick={() => setScreen("payment-entry")}>
          <Plus className="mr-2 size-4" /> Record Payment
        </Button>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer or notes..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                  <SelectItem value="amount-desc">Amount (High-Low)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Low-High)</SelectItem>
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
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSorted.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(p.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    ₹{p.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                    {p.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-chart-2/30 bg-chart-2/10 text-chart-2"
                    >
                      Paid
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setEditingPaymentId(p.id)
                          setScreen("payment-entry")
                        }}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit payment</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setSelectedCustomerId(p.customerId)
                          setScreen("customer-profile")
                        }}
                      >
                        <Eye className="size-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Delete payment</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this payment of ₹{p.amount.toLocaleString("en-IN")}?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePayment(p.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>


                </TableRow>
              ))}
              {filteredAndSorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No payment records found.
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
