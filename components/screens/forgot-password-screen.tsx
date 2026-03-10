"use client"

import { useState } from "react"
import { Landmark, ArrowLeft, Send, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/lib/store"
import { api } from "@/lib/api"

export function ForgotPasswordScreen() {
  const { setScreen, setResetEmail, resetEmail } = useApp()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"email" | "otp">("email")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email")
      return
    }

    setLoading(true)
    setError(null)
    try {
      await api.forgotPassword(email)
      setResetEmail(email)
      setStep("otp")
    } catch (err: any) {
      setError(err.message || "Failed to send reset code")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)
    try {
      await api.resetPassword({
        email: resetEmail,
        otp,
        newPassword
      })
      setError("Success: Password reset successfully!")
      setTimeout(() => setScreen("login"), 2000)
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-primary/5 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Landmark className="size-6" />
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
               <CardTitle className="text-base uppercase tracking-wider font-semibold text-muted-foreground/80">
                 {step === "email" ? "Forgot Password" : "Reset Password"}
               </CardTitle>
            </div>
            <CardDescription className="text-xs">
              {step === "email" 
                ? "Enter your email to receive a reset code" 
                : "Enter the code we sent to " + resetEmail}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-4">
            {error && (
              <div className={`text-sm font-medium ${error.startsWith('Success') ? 'text-green-600 bg-green-50' : 'text-destructive bg-destructive/10'} p-2 rounded-md`}>
                {error}
              </div>
            )}
            
            {step === "email" ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-9 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleSendOtp} disabled={loading} className="w-full h-10 gap-2">
                  {loading ? "Sending..." : "Send Reset Code"}
                  {!loading && <Send className="size-4" />}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="reset-otp" className="text-xs font-semibold">Reset Code (OTP)</Label>
                  <Input
                    id="reset-otp"
                    placeholder="123456"
                    maxLength={6}
                    className="h-10 text-center text-lg tracking-widest font-mono"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="new-password" className="text-xs font-semibold">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="h-9 text-sm pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  <Label htmlFor="confirm-new-password" className="text-xs font-semibold">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="Re-enter password"
                    className="h-9 text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleReset} disabled={loading} className="w-full mt-1 h-10">
                  {loading ? "Resetting..." : "Update Password"}
                </Button>
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal text-xs text-muted-foreground" 
                  onClick={() => setStep("email")}
                >
                  Change email
                </Button>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Remember your password?{" "}
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
