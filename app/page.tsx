"use client"

import { AppProvider, useApp } from "@/lib/store"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { LoginScreen } from "@/components/screens/login-screen"
import { DashboardScreen } from "@/components/screens/dashboard-screen"
import { CustomersScreen } from "@/components/screens/customers-screen"
import { AddCustomerScreen } from "@/components/screens/add-customer-screen"
import { LoansScreen, AddLoanScreen } from "@/components/screens/loans-screen"
import { CustomerProfileScreen } from "@/components/screens/customer-profile-screen"
import { CollectionsScreen } from "@/components/screens/collections-screen"
import { PaymentEntryScreen } from "@/components/screens/payment-entry-screen"
import { ReportsScreen } from "@/components/screens/reports-screen"
// import { NotificationsScreen } from "@/components/screens/notifications-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { ScrollArea } from "@/components/ui/scroll-area"

function AppContent() {
  const { screen, isLoggedIn } = useApp()

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":
        return <DashboardScreen />
      case "customers":
        return <CustomersScreen />
      case "add-customer":
      case "edit-customer":
        return <AddCustomerScreen />
      case "loans":
        return <LoansScreen />
      case "add-loan":
        return <AddLoanScreen />
      case "customer-profile":
        return <CustomerProfileScreen />
      case "collections":
        return <CollectionsScreen />
      case "payment-entry":
        return <PaymentEntryScreen />
      case "reports":
        return <ReportsScreen />
      // case "notifications":
      //   return <NotificationsScreen />
      case "settings":
        return <SettingsScreen />
      default:
        return <DashboardScreen />
    }
  }

  return (
    <AppSidebar>
      <TopNavbar />
      <ScrollArea className="flex-1">
        <div className="min-h-[calc(100svh-3.5rem)]">
          {renderScreen()}
        </div>
      </ScrollArea>
    </AppSidebar>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
