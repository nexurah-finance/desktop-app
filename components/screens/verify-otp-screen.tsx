"use client"

import { useState } from "react"
import { Landmark, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/lib/store"
import { api } from "@/lib/api"

export function VerifyOtpScreen() {
  const { setScreen, signupData, setIsLoggedIn, setUser, loadDataForUser } = useApp()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.signup({
        ...signupData,
        otp
      })
      setUser(response.user)
      await loadDataForUser(response.user)
      setIsLoggedIn(true)
      setScreen("dashboard")
    } catch (err: any) {
      setError(err.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)
    try {
      await api.sendOtp(signupData.email)
      setError("Success: OTP resent!")
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-primary/5 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Landmark className="size-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Nexurah</h1>
            <p className="text-sm text-muted-foreground">Verify your email</p>
          </div>
        </div>
        <Card className="border border-border shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
               <Button variant="ghost" size="icon" className="size-8" onClick={() => setScreen("signup")}>
                  <ArrowLeft className="size-4" />
               </Button>
               <CardTitle className="text-lg">Enter OTP</CardTitle>
            </div>
            <CardDescription>
              We sent a 6-digit code to <span className="text-foreground font-medium">{signupData?.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <div className={`text-sm font-medium ${error.startsWith('Success') ? 'text-green-600 bg-green-50' : 'text-destructive bg-destructive/10'} p-2 rounded-md`}>
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
            </div>
            <Button onClick={handleVerify} disabled={loading} className="w-full mt-2 gap-2">
               {loading ? "Verifying..." : "Verify OTP"}
               {!loading && <Send className="size-4" />}
            </Button>
            <div className="text-center mt-2">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive any code?{" "}
                <Button 
                  variant="link" 
                  disabled={resending}
                  className="p-0 h-auto font-normal" 
                  onClick={handleResend}
                >
                  {resending ? "Resending..." : "Resend code"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
