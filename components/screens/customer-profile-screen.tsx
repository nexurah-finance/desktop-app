"use client"

import {
  ArrowLeft,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  CalendarDays,
  IndianRupee,
  Check,
  Clock,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/lib/store"

export function CustomerProfileScreen() {
  const { customers, loans, payments, selectedCustomerId, setScreen } = useApp()

  const customer = customers.find((c) => c.id === selectedCustomerId)
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button variant="outline" onClick={() => setScreen("customers")}>
          Back to Customers
        </Button>
      </div>
    )
  }

  const customerLoans = loans.filter((l) => l.customerId === customer.id)
  const customerPayments = payments.filter((p) => p.customerId === customer.id)
  const activeLoan = customerLoans.find((l) => l.status === "active")
  const monthlyInterest = activeLoan
    ? activeLoan.amount * (activeLoan.interestRate / 100)
    : 0
  const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0)

  // Generate timeline entries
  const generateTimeline = () => {
    if (!activeLoan) return []
    const start = new Date(activeLoan.startDate)
    const now = new Date()
    const entries = []

    for (let i = 1; i <= 12; i++) {
      const dueDate = new Date(start)
      dueDate.setMonth(dueDate.getMonth() + i)
      if (dueDate > new Date(now.getFullYear(), now.getMonth() + 2, 0)) break

      const dateStr = dueDate.toISOString().split("T")[0]
      const monthPayments = customerPayments.filter((p) => {
        const pDate = new Date(p.date)
        return (
          pDate.getMonth() === dueDate.getMonth() &&
          pDate.getFullYear() === dueDate.getFullYear()
        )
      })
      const paidAmount = monthPayments.reduce((sum, p) => sum + p.amount, 0)
      const isPaid = paidAmount >= monthlyInterest
      const isPending = dueDate <= now && !isPaid

      entries.push({
        date: dueDate,
        dateStr,
        amount: isPaid ? paidAmount : monthlyInterest,
        status: isPaid ? "paid" : isPending ? "overdue" : "pending",
      })
    }

    return entries
  }

  const timeline = generateTimeline()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setScreen("customers")}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">Customer profile and loan details</p>
        </div>
        <Button onClick={() => setScreen("payment-entry")}>
          <Plus className="mr-2 size-4" /> Add Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Info */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Customer Info</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-lg font-bold text-primary">
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  Since{" "}
                  {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{customer.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="size-4 text-muted-foreground" />
                <span>{customer.idProof}</span>
              </div>
              {customer.notes && (
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{customer.notes}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loan Summary */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Loan Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {activeLoan ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Loan Amount</span>
                      <span className="font-mono font-bold text-foreground">
                        ₹{activeLoan.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Interest Rate</span>
                      <span className="font-mono font-semibold text-foreground">{activeLoan.interestRate}%</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Monthly Interest</span>
                      <span className="text-lg font-bold text-primary font-mono">
                        ₹{monthlyInterest.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Started{" "}
                    {new Date(activeLoan.startDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Total Paid: ₹{totalPaid.toLocaleString("en-IN")}
                  </span>
                </div>
                {activeLoan.notes && (
                  <p className="text-xs text-muted-foreground italic">{activeLoan.notes}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">No active loans</p>
                <Button variant="outline" size="sm" onClick={() => setScreen("add-loan")}>
                  Create Loan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Timeline */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Payment Timeline</CardTitle>
            <CardDescription>Monthly interest payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length > 0 ? (
              <div className="relative flex flex-col gap-0">
                {timeline.map((entry, i) => (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[11px] top-6 h-full w-0.5 bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div
                      className={`relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full ${
                        entry.status === "paid"
                          ? "bg-chart-2/20"
                          : entry.status === "overdue"
                          ? "bg-destructive/20"
                          : "bg-muted"
                      }`}
                    >
                      {entry.status === "paid" ? (
                        <Check className="size-3 text-chart-2" />
                      ) : entry.status === "overdue" ? (
                        <Clock className="size-3 text-destructive" />
                      ) : (
                        <Clock className="size-3 text-muted-foreground" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-foreground">
                          {entry.date.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          ₹{entry.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          entry.status === "paid"
                            ? "border-chart-2/30 bg-chart-2/10 text-chart-2"
                            : entry.status === "overdue"
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {entry.status === "paid"
                          ? "Paid"
                          : entry.status === "overdue"
                          ? "Overdue"
                          : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No payment timeline available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
