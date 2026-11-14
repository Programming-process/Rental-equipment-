import { useEffect, useState, type ReactNode } from "react"
import { api, type DashboardResponse, type UserRole } from "./lib/api"
import MobileLogin from "./MobileLogin"
import { fallbackDashboard, type Screen } from "./mobile/data"
import {
  DetailScreen,
  EquipmentScreen,
  HomeScreen,
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

const screenIds: Screen[] = [
  "login",
  "home",
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
]

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
    user: {
      id: string
      role: UserRole
      phone: string
      name: string
      company: string
    }
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
    user: {
      id: string
      role: UserRole
      phone: string
      name: string
      company: string
    }
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
    return <MobileLogin onLogin={handleLogin} />
  }

  const screens: Record<Exclude<Screen, "login">, ReactNode> = {
    home: (
      <HomeScreen
        dashboard={dashboard}
        onBackToWebsite={onBackToWebsite}
        onNavigate={navigate}
        onSignOut={handleSignOut}
        role={session?.user.role ?? "manager"}
      />
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
  }

  return screens[screen]
}
