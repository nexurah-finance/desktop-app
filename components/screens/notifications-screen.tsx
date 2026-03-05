"use client"

import { Bell, AlertTriangle, Clock, Info, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/store"

export function NotificationsScreen() {
  const { notifications, markNotificationRead } = useApp()

  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  const getIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return <AlertTriangle className="size-4 text-destructive" />
      case "reminder":
        return <Clock className="size-4 text-chart-4" />
      default:
        return <Info className="size-4 text-primary" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case "overdue":
        return "border-destructive/20 bg-destructive/5"
      case "reminder":
        return "border-chart-4/20 bg-chart-4/5"
      default:
        return "border-primary/20 bg-primary/5"
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          {unread.length > 0
            ? `You have ${unread.length} unread notification${unread.length > 1 ? "s" : ""}`
            : "All caught up!"}
        </p>
      </div>

      {unread.length > 0 && (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Unread</CardTitle>
              <Badge variant="destructive" className="text-xs">
                {unread.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {unread.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 rounded-lg border p-4 ${getBgColor(n.type)}`}
              >
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{n.customerName}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => markNotificationRead(n.id)}
                >
                  <Check className="mr-1 size-3" /> Mark read
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {read.length > 0 && (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Read</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {read.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4 opacity-60"
              >
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{n.customerName}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
