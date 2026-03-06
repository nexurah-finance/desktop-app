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

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    idProof: "",
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

  const validate = () => {
    let isValid = true
    const newErrors = { name: "", phone: "", idProof: "" }

    // Name validation: No special characters
    if (!form.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    } else if (!/^[a-zA-Z\s]+$/.test(form.name)) {
      newErrors.name = "Name should not contain special characters"
      isValid = false
    }

    // Phone validation: 10 digits
    if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits"
      isValid = false
    }

    // Aadhaar validation: 12 digits (if provided)
    const rawIdProof = form.idProof.replace(/\s/g, "")
    if (rawIdProof && !/^\d{12}$/.test(rawIdProof)) {
      newErrors.idProof = "Aadhaar number must be exactly 12 digits"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = () => {
    if (!validate()) return

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
              <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter full name"
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                value={form.name}
                onChange={(e) => {
                  const val = e.target.value
                  // Basic sanitization: stop user from typing special characters
                  if (val === "" || /^[a-zA-Z\s]*$/.test(val)) {
                    setForm({ ...form, name: val })
                    if (errors.name) setErrors({ ...errors, name: "" })
                  }
                }}
              />
              {errors.name && <p className="text-[11px] font-medium text-destructive">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="00000 00000"
                maxLength={10}
                className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  if (val.length <= 10) {
                    setForm({ ...form, phone: val })
                    if (errors.phone) setErrors({ ...errors, phone: "" })
                  }
                }}
              />
              {errors.phone && <p className="text-[11px] font-medium text-destructive">{errors.phone}</p>}
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
            <Label htmlFor="idProof" className={errors.idProof ? "text-destructive" : ""}>ID Proof (Aadhaar)</Label>
            <Input
              id="idProof"
              placeholder="0000 0000 0000"
              maxLength={14}
              className={errors.idProof ? "border-destructive focus-visible:ring-destructive" : ""}
              value={form.idProof}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "")
                if (raw.length <= 12) {
                  // Format as XXXX XXXX XXXX
                  const formatted = raw.match(/.{1,4}/g)?.join(" ") || ""
                  setForm({ ...form, idProof: formatted })
                  if (errors.idProof) setErrors({ ...errors, idProof: "" })
                }
              }}
            />
            {errors.idProof && <p className="text-[11px] font-medium text-destructive">{errors.idProof}</p>}
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
