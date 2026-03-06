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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function CustomerProfileScreen() {
  const { customers, loans, payments, selectedCustomerId, setScreen, closeLoan } = useApp()
  const [isClosing, setIsClosing] = useState(false)
  const [closureForm, setClosureForm] = useState({
    paymentAmount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "Full Settlement",
  })

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
    const currentLoan = activeLoan || [...customerLoans].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
    if (!currentLoan) return []
    
    const now = new Date()
    const entries = []
    const currentMonthlyInterest = currentLoan.amount * (currentLoan.interestRate / 100)

    const limitDate = currentLoan.status === 'closed' && currentLoan.closedDate 
      ? new Date(currentLoan.closedDate + 'T00:00:00')
      : new Date(now.getFullYear(), now.getMonth() + 5, 1)

    for (let i = 1; i <= 100; i++) {
      const dueDate = new Date(currentLoan.startDate + 'T00:00:00')
      dueDate.setMonth(dueDate.getMonth() + i)
      
      const monthPayments = customerPayments.filter((p) => {
        if (p.loanId !== currentLoan.id) return false
        const pDate = new Date(p.date + 'T00:00:00')
        return (
          pDate.getMonth() === dueDate.getMonth() &&
          pDate.getFullYear() === dueDate.getFullYear()
        )
      })

      const paidAmount = monthPayments.reduce((sum, p) => sum + p.amount, 0)
      const isClosure = monthPayments.some(p => p.type === 'closure')
      const isPaid = paidAmount >= currentMonthlyInterest || isClosure

      if (dueDate > limitDate && !isPaid) break

      entries.push({
        date: dueDate,
        amount: isPaid ? paidAmount : currentMonthlyInterest,
        status: isPaid ? "paid" : (dueDate <= now ? "overdue" : "pending"),
        type: isClosure ? 'closure' : 'interest'
      })
      
      if (isClosure) break
    }

    return entries
  }

  const timeline = generateTimeline()
  const displayLoan = activeLoan || [...customerLoans].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
  const displayMonthlyInterest = displayLoan ? displayLoan.amount * (displayLoan.interestRate / 100) : 0

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
        <div className="flex items-center gap-2">
          {activeLoan && activeLoan.status === "active" && (
            <Dialog open={isClosing} onOpenChange={(open) => {
              if (open) {
                setClosureForm({
                  paymentAmount: activeLoan.amount + displayMonthlyInterest,
                  paymentDate: new Date().toISOString().split("T")[0],
                  notes: "Full Settlement",
                })
              }
              setIsClosing(open)
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                  Close Loan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Loan Settlement</DialogTitle>
                  <DialogDescription>
                    Finalize the loan by recording the principal and final interest.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Principal Amount</span>
                      <span className="font-mono font-semibold">₹{activeLoan.amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Interest Due</span>
                      <span className="font-mono font-semibold">₹{displayMonthlyInterest.toLocaleString("en-IN")}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-primary">
                      <span>Total Settlement</span>
                      <span className="font-mono">₹{(activeLoan.amount + displayMonthlyInterest).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="closeAmount">Final Payment Amount</Label>
                    <Input
                      id="closeAmount"
                      type="number"
                      value={closureForm.paymentAmount}
                      onChange={(e) => setClosureForm({ ...closureForm, paymentAmount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="closeDate">Payment Date</Label>
                    <Input
                      id="closeDate"
                      type="date"
                      value={closureForm.paymentDate}
                      onChange={(e) => setClosureForm({ ...closureForm, paymentDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="closeNotes">Notes</Label>
                    <Textarea
                      id="closeNotes"
                      value={closureForm.notes}
                      onChange={(e) => setClosureForm({ ...closureForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsClosing(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={async () => {
                    await closeLoan(activeLoan.id, closureForm)
                    setIsClosing(true)
                    // We don't need to manually set screen, store update handles it
                    setIsClosing(false)
                  }}>Confirm Closure</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button 
            onClick={() => setScreen("payment-entry")}
            disabled={displayLoan?.status === "closed"}
          >
            <Plus className="mr-2 size-4" /> Add Payment
          </Button>
        </div>
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Loan Summary</CardTitle>
            {displayLoan && (
              <Badge variant={displayLoan.status === "closed" ? "secondary" : "default"} className={displayLoan.status === "active" ? "bg-chart-2 text-white" : ""}>
                {displayLoan.status.toUpperCase()}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {displayLoan ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Loan Amount</span>
                      <span className="font-mono font-bold text-foreground">
                        ₹{displayLoan.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Interest Rate</span>
                      <span className="font-mono font-semibold text-foreground">{displayLoan.interestRate}%</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Monthly Interest</span>
                      <span className="text-lg font-bold text-primary font-mono">
                        ₹{displayMonthlyInterest.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Started{" "}
                    {new Date(displayLoan.startDate + 'T00:00:00').toLocaleDateString("en-IN", {
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
                {displayLoan.status === "closed" && displayLoan.closedDate && (
                  <div className="flex items-center gap-2 text-sm text-chart-2 font-medium">
                    <Check className="size-4" />
                    <span>Closed on {new Date(displayLoan.closedDate + 'T00:00:00').toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
                {displayLoan.notes && (
                  <p className="text-xs text-muted-foreground italic">{displayLoan.notes}</p>
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
                        <div className="flex items-center gap-1.5">
                          <p className="font-mono text-xs text-muted-foreground">
                            ₹{entry.amount.toLocaleString("en-IN")}
                          </p>
                          {entry.type === "closure" && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase border-chart-2 bg-chart-2/5 text-chart-2">Closure</Badge>
                          )}
                        </div>
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
                          ? (entry.type === 'closure' ? "Loan Closed" : "Paid")
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
