import { useEffect, useState, type ReactNode } from "react"
import {
  api,
  type DashboardResponse,
  type User,
  type UserRole,
} from "./lib/api"
import MobileLogin from "./MobileLogin"
import { fallbackDashboard, type Screen } from "./mobile/data"
import {
  DetailScreen,
  EquipmentScreen,
  HomeScreen,
  ProfileScreen,
} from "./mobile/screens/core"
import { CalendarScreen } from "./mobile/screens/calendar"
import {
  CheckinScreen,
  CheckoutScreen,
  ScannerScreen,
} from "./mobile/screens/rental"
import { AnomalyScreen, TelemetryScreen } from "./mobile/screens/monitoring"
import { SupportScreen } from "./mobile/screens/support"
import { NotificationsScreen } from "./mobile/screens/notifications"
import NpmSecurityGuide from "./NpmSecurityGuide"

const screenIds: Screen[] = [
  "login",
  "home",
  "profile",
  "equipment",
  "detail",
  "calendar",
  "scanner",
  "checkout",
  "checkin",
  "telemetry",
  "anomaly",
  "support",
  "notifications",
  "security",
]

const unauthenticatedUser: User = {
  id: "",
  name: "",
  company: "",
  phone: "",
  role: "renter",
}

function getScreenFromHash(): Screen {
  const hash = window.location.hash.replace(/^#\/?/, "") as Screen
  return screenIds.includes(hash) ? hash : "login"
}

export default function MobileOpsApp({ onBackToWebsite }: {
  onBackToWebsite?: () => void
} = {}) {
  const [screen, setScreen] = useState<Screen>(getScreenFromHash)
  const [session, setSession] = useState<{
    message: string
    user: User
    session: {
      token: string
      role: UserRole
      expiresAt: string
    }
  } | null>(null)
  const [dashboard, setDashboard] =
    useState<DashboardResponse>(fallbackDashboard)

  useEffect(() => {
    const handleHashChange = () => setScreen(getScreenFromHash())

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  useEffect(() => {
    if (!session) {
      return
    }

    let isMounted = true

    api
      .getDashboard()
      .then((data) => {
        if (isMounted) {
          setDashboard(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setDashboard(fallbackDashboard)
        }
      })

    return () => {
      isMounted = false
    }
  }, [session])

  const navigate = (nextScreen: Screen) => {
    if (nextScreen === screen) {
      return
    }

    window.location.hash = nextScreen
    setScreen(nextScreen)
  }

  const handleLogin = (result: {
    message: string
    user: User
    session: {
      token: string
      role: UserRole
      expiresAt: string
    }
  }) => {
    setSession(result)
    navigate("home")
  }

  const handleSignOut = () => {
    setSession(null)
    setDashboard(fallbackDashboard)
    window.location.hash = "login"
    setScreen("login")
  }

  if (screen === "login") {
    return (
      <MobileLogin onBackToWebsite={onBackToWebsite} onLogin={handleLogin} />
    )
  }

  if (screen === "security") {
    if (session?.user.role !== "manager" && session?.user.role !== "fixer") {
      return (
        <HomeScreen
          dashboard={dashboard}
          onBackToWebsite={onBackToWebsite}
          onNavigate={navigate}
          onSignOut={handleSignOut}
          role={session?.user.role ?? "renter"}
          user={session?.user ?? unauthenticatedUser}
        />
      )
    }

    return <NpmSecurityGuide onBack={() => navigate("home")} />
  }

  const screens: Record<Exclude<Screen, "login">, ReactNode> = {
    home: (
      <HomeScreen
        dashboard={dashboard}
        onBackToWebsite={onBackToWebsite}
        onNavigate={navigate}
        onSignOut={handleSignOut}
        role={session?.user.role ?? "manager"}
        user={session?.user ?? unauthenticatedUser}
      />
    ),
    profile: session ? (
      <ProfileScreen user={session.user} onNavigate={navigate} />
    ) : (
      <MobileLogin onBackToWebsite={onBackToWebsite} onLogin={handleLogin} />
    ),
    equipment: <EquipmentScreen dashboard={dashboard} onNavigate={navigate} />,
    detail: <DetailScreen dashboard={dashboard} onNavigate={navigate} />,
    calendar: <CalendarScreen onNavigate={navigate} />,
    scanner: <ScannerScreen onNavigate={navigate} />,
    checkout: <CheckoutScreen onNavigate={navigate} />,
    checkin: <CheckinScreen onNavigate={navigate} />,
    telemetry: <TelemetryScreen onNavigate={navigate} />,
    anomaly: <AnomalyScreen dashboard={dashboard} onNavigate={navigate} />,
    support: <SupportScreen dashboard={dashboard} onNavigate={navigate} />,
    notifications: (
      <NotificationsScreen dashboard={dashboard} onNavigate={navigate} />
    ),
    security: null,
  }

  return screens[screen]
}
