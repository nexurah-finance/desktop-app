"use client"

import { useState } from "react"
import { Building2, Percent, Database, Moon, User, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useApp } from "@/lib/store"

export function SettingsScreen() {
  const { settings, updateSettings, user, changePassword, customers, loans, payments } = useApp()
  const [passForm, setPassForm] = useState({ old: "", new: "", confirm: "" })
  const [passLoading, setPassLoading] = useState(false)
  const [passStatus, setPassStatus] = useState<{ type: "success" | "error", msg: string } | null>(null)

  // Local state for company settings to avoid saving on every keystroke
  const [businessName, setBusinessName] = useState(settings.businessName)
  const [interestRate, setInterestRate] = useState(settings.defaultInterestRate)
  const [bizLoading, setBizLoading] = useState(false)
  const [bizStatus, setBizStatus] = useState<{ type: "success" | "error", msg: string } | null>(null)

  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      businessName: settings.businessName,
      customers,
      loans,
      payments,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Nexurah_Backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleBusinessUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setBizLoading(true)
    setBizStatus(null)
    try {
      await updateSettings({ businessName: businessName, defaultInterestRate: interestRate })
      setBizStatus({ type: "success", msg: "Business identity updated!" })
      setTimeout(() => setBizStatus(null), 3000)
    } catch (err) {
      setBizStatus({ type: "error", msg: "Failed to update business settings" })
    } finally {
      setBizLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passForm.new !== passForm.confirm) {
      setPassStatus({ type: "error", msg: "New passwords do not match" })
      return
    }

    setPassLoading(true)
    setPassStatus(null)
    try {
      await changePassword({ oldPassword: passForm.old, newPassword: passForm.new })
      setPassStatus({ type: "success", msg: "Password updated successfully!" })
      setPassForm({ old: "", new: "", confirm: "" })
      setTimeout(() => setPassStatus(null), 3000)
    } catch (err: any) {
      setPassStatus({ type: "error", msg: err.message || "Failed to update password" })
    } finally {
      setPassLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and business preferences</p>
      </div>

      <div className="grid max-w-4xl grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {/* User Profile */}
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="size-4 text-primary" />
                <CardTitle className="text-base">User Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {user?.name.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-lg text-foreground">{user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
                {/* <span className="inline-flex max-w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                  {user?.role || "employee"}
                </span> */}
              </div>
            </CardContent>
          </Card>

          {/* Company Settings */}
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <CardTitle className="text-base">Business Identity</CardTitle>
              </div>
              <CardDescription>This appears in the header and all reports</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBusinessUpdate} className="flex flex-col gap-5">
                {bizStatus && (
                  <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${
                    bizStatus.type === "success" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                  }`}>
                    {bizStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {bizStatus.msg}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="companyName">Business Name</Label>
                  <Input
                    id="companyName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Nexurah"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="defaultRate">Default Monthly Interest (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="defaultRate"
                      type="number"
                      step="0.5"
                      className="max-w-[120px]"
                      value={interestRate}
                      onChange={(e) =>
                        setInterestRate(parseFloat(e.target.value) || 0)
                      }
                    />
                    <Percent className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <Button type="submit" disabled={bizLoading} className="w-full">
                  {bizLoading ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                  Update Business Details
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* Security */}
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-primary" />
                <CardTitle className="text-base">Security & Password</CardTitle>
              </div>
              <CardDescription>Update your login credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                {passStatus && (
                  <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${
                    passStatus.type === "success" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                  }`}>
                    {passStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {passStatus.msg}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="oldPass">Current Password</Label>
                  <Input 
                    id="oldPass" 
                    type="password" 
                    required
                    value={passForm.old}
                    onChange={e => setPassForm({...passForm, old: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPass">New Password</Label>
                  <Input 
                    id="newPass" 
                    type="password" 
                    required
                    value={passForm.new}
                    onChange={e => setPassForm({...passForm, new: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPass">Confirm New Password</Label>
                  <Input 
                    id="confirmPass" 
                    type="password" 
                    required
                    value={passForm.confirm}
                    onChange={e => setPassForm({...passForm, confirm: e.target.value})}
                  />
                </div>
                <Button type="submit" disabled={passLoading} className="w-full">
                  {passLoading ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">System Preferences</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <Moon className="size-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark mode theme</p>
                    <p className="text-xs text-muted-foreground">Adjust display for low light</p>
                  </div>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(v) => {
                    updateSettings({ darkMode: v })
                    document.documentElement.classList.toggle("dark", v)
                  }}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <Database className="size-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Database Backup</p>
                    <p className="text-xs text-muted-foreground">Export business data locally</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportJSON}>
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-xs text-muted-foreground opacity-50">
          Nexurah Finance Manager Professional v1.2
        </p>
      </div>
    </div>
  )
}
