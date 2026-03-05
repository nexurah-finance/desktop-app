"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Eye,
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
import { useApp } from "@/lib/store"

export function CollectionsScreen() {
  const { payments, customers, loans, setScreen, setSelectedCustomerId } = useApp()
  const [search, setSearch] = useState("")

  const enrichedPayments = payments
    .map((p) => {
      const customer = customers.find((c) => c.id === p.customerId)
      const loan = loans.find((l) => l.id === p.loanId)
      return { ...p, customerName: customer?.name || "Unknown", loanAmount: loan?.amount || 0 }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filtered = enrichedPayments.filter((p) =>
    p.customerName.toLowerCase().includes(search.toLowerCase())
  )

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground">
            All payment records. Total collected: ₹{totalCollected.toLocaleString("en-IN")}
          </p>
        </div>
        <Button onClick={() => setScreen("payment-entry")}>
          <Plus className="mr-2 size-4" /> Record Payment
        </Button>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer name..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
              {filtered.map((p) => (
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
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
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
