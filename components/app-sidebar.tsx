"use client"

import {
  LayoutDashboard,
  Users,
  Landmark,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useApp, type Screen } from "@/lib/store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const navItems: { label: string; icon: typeof LayoutDashboard; screen: Screen }[] = [
  { label: "Dashboard", icon: LayoutDashboard, screen: "dashboard" },
  { label: "Customers", icon: Users, screen: "customers" },
  { label: "Loans", icon: Landmark, screen: "loans" },
  { label: "Collections", icon: Receipt, screen: "collections" },
  { label: "Reports", icon: BarChart3, screen: "reports" },
  // { label: "Notifications", icon: Bell, screen: "notifications" },
  { label: "Settings", icon: Settings, screen: "settings" },
]

function AppSidebarContent() {
  const { screen, setScreen, logout, notifications, settings, user } = useApp()
  const { open } = useSidebar()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton size="lg" className="pointer-events-none px-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
            <Landmark className="size-4" />
          </div>
          {open && (
            <div className="flex flex-col leading-tight overflow-hidden transition-all duration-200">
              <span className="text-sm font-bold tracking-tight truncate">
                {user?.companyName || settings.businessName}
              </span>
              <span className="text-[10px] opacity-70 uppercase tracking-wider font-medium">
                Finance Manager
              </span>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.screen}>
                  <SidebarMenuButton
                    isActive={
                      screen === item.screen || 
                      (item.screen === "customers" && ["add-customer", "edit-customer", "customer-profile"].includes(screen)) ||
                      (item.screen === "loans" && screen === "add-loan") ||
                      (item.screen === "collections" && screen === "payment-entry")
                    }
                    onClick={() => setScreen(item.screen)}
                    tooltip={item.label}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.screen === "notifications" && unreadCount > 0 && (
                    <SidebarMenuBadge>
                      <Badge variant="destructive" className="h-5 min-w-5 px-1 text-[10px]">
                        {unreadCount}
                      </Badge>
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarMenuButton tooltip="Logout">
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out? You will need to sign in again to access the application.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      logout()
                    }}
                    className={buttonVariants({ variant: "destructive" })}
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebarContent />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
