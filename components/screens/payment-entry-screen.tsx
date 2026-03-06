"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Receipt } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/lib/store"

export function PaymentEntryScreen() {
  const { customers, loans, payments, addPayment, updatePayment, setScreen, editingPaymentId, setEditingPaymentId } = useApp()
  const [form, setForm] = useState({
    customerId: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    notes: "",
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (editingPaymentId) {
      const p = payments.find((pay) => pay.id === editingPaymentId)
      if (p) {
        setForm({
          customerId: p.customerId,
          date: p.date,
          amount: p.amount.toString(),
          notes: p.notes,
        })
      }
    }
  }, [editingPaymentId, payments])

  const customerLoan = form.customerId
    ? loans.find((l) => l.customerId === form.customerId && l.status === "active")
    : null

  const handleSubmit = () => {
    if (!form.customerId || !form.amount) return
    const loan = loans.find((l) => l.customerId === form.customerId && l.status === "active")
    if (!loan) return
    
    if (editingPaymentId) {
      updatePayment(editingPaymentId, {
        customerId: form.customerId,
        loanId: loan.id,
        date: form.date,
        amount: parseFloat(form.amount),
        notes: form.notes,
      })
    } else {
      addPayment({
        customerId: form.customerId,
        loanId: loan.id,
        date: form.date,
        amount: parseFloat(form.amount),
        notes: form.notes,
      })
    }
    setSubmitted(true)
    setEditingPaymentId(null)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-12">
        <div className="flex size-16 items-center justify-center rounded-full bg-chart-2/10">
          <Receipt className="size-8 text-chart-2" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Payment Recorded</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ₹{parseFloat(form.amount).toLocaleString("en-IN")} has been recorded successfully.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setScreen("collections")}>
            View Collections
          </Button>
          <Button
            onClick={() => {
              setForm({ customerId: "", date: new Date().toISOString().split("T")[0], amount: "", notes: "" })
              setSubmitted(false)
            }}
          >
            Record Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { setScreen("collections"); setEditingPaymentId(null); }}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {editingPaymentId ? "Edit Payment" : "Record Payment"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {editingPaymentId ? "Update existing payment details" : "Enter a new payment collection"}
          </p>
        </div>
      </div>

      <Card className="max-w-xl border border-border">
        <CardHeader>
          <CardTitle className="text-base">Payment Details</CardTitle>
          <CardDescription>Record a monthly interest payment</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label>
              Customer <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.customerId}
              onValueChange={(v) => setForm({ ...form, customerId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers
                  .filter((c) => loans.some((l) => l.customerId === c.id && l.status === "active"))
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {customerLoan && (
            <div className="rounded-lg bg-secondary p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monthly Interest Due</span>
                <span className="font-mono font-semibold text-foreground">
                  ₹{(customerLoan.amount * (customerLoan.interestRate / 100)).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="payDate">Payment Date</Label>
              <Input
                id="payDate"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="payAmount">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="payAmount"
                type="number"
                placeholder="e.g., 1500"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="payNotes">Notes</Label>
            <Textarea
              id="payNotes"
              placeholder="Payment notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setScreen("collections"); setEditingPaymentId(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!form.customerId || !form.amount}>
              {editingPaymentId ? "Update Payment" : "Save Payment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
