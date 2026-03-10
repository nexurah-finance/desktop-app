"use client"

import { useState } from "react"
import { Landmark, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/lib/store"
import { api } from "@/lib/api"

export function SignupScreen() {
  const { setScreen, setSignupData } = useApp()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOtp = async () => {
    if (!name || !email || !password || !confirmPassword || !companyName) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)
    try {
      await api.sendOtp(email)
      setSignupData({ name, email, password, companyName })
      setScreen("verify-otp")
    } catch (err: any) {
      setError(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-primary/5 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex flex-col items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Landmark className="size-5" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Nexurah</h1>
          </div>
        </div>
        <Card className="border border-border shadow-xl">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2 mb-1">
               <Button variant="ghost" size="icon" className="size-7" onClick={() => setScreen("login")}>
                  <ArrowLeft className="size-4" />
               </Button>
               <CardTitle className="text-base uppercase tracking-wider font-semibold text-muted-foreground/80">Sign Up</CardTitle>
            </div>
            <CardDescription className="text-xs">Join Nexurah Finance Management</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-4">
            {error && (
              <div className={`text-sm font-medium ${error.startsWith('Success') ? 'text-green-600 bg-green-50' : 'text-destructive bg-destructive/10'} p-2 rounded-md`}>
                {error}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <Label htmlFor="name" className="text-xs">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="h-9 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="companyName" className="text-xs">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Nexurah Finance"
                className="h-9 text-sm"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="h-9 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className="h-9 text-sm pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 size-9"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="confirm-password" className="text-xs">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm password"
                className="h-9 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleSendOtp} disabled={loading} className="w-full mt-1 h-10">
              {loading ? "Sending OTP..." : "Continue"}
            </Button>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" className="p-0 h-auto font-normal text-xs" onClick={() => setScreen("login")}>
                  Sign In
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
