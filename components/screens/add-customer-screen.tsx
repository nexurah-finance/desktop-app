"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/store"

export function AddCustomerScreen() {
  const { addCustomer, updateCustomer, setScreen, editingCustomerId, setEditingCustomerId, customers } = useApp()
  const isEditing = editingCustomerId !== null
  const existingCustomer = isEditing ? customers.find((c) => c.id === editingCustomerId) : null

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    idProof: "",
    notes: "",
  })

  useEffect(() => {
    if (existingCustomer) {
      setForm({
        name: existingCustomer.name,
        phone: existingCustomer.phone,
        address: existingCustomer.address,
        idProof: existingCustomer.idProof,
        notes: existingCustomer.notes,
      })
    }
  }, [existingCustomer])

  const handleSubmit = () => {
    if (!form.name || !form.phone) return
    if (isEditing && editingCustomerId) {
      updateCustomer(editingCustomerId, form)
      setEditingCustomerId(null)
    } else {
      addCustomer(form)
    }
    setScreen("customers")
  }

  const handleCancel = () => {
    setEditingCustomerId(null)
    setScreen("customers")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEditing ? "Edit Customer" : "Add Customer"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update customer information"
              : "Add a new customer to the system"}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl border border-border">
        <CardHeader>
          <CardTitle className="text-base">Customer Information</CardTitle>
          <CardDescription>Fill in the customer details below</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter full address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="idProof">ID Proof</Label>
            <Input
              id="idProof"
              placeholder="e.g., Aadhar - 1234 XXXX 5678"
              value={form.idProof}
              onChange={(e) => setForm({ ...form, idProof: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.phone}>
              {isEditing ? "Update Customer" : "Save Customer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
