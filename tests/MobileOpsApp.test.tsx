import {
  cleanup,
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import MobileOpsApp from "../src/MobileOpsApp"
import {
  api,
  type AlertItem,
  type DashboardResponse,
  type UserRole,
} from "../src/lib/api"

const renderAtHash = (route: string) => {
  window.history.replaceState(null, "", `/#${route}`)
  return render(<MobileOpsApp />)
}

const equipmentCatalog: DashboardResponse["equipment"] = [
  {
    id: "DRL-UB-0247",
    name: "Өрмийн машин D45",
    model: "Atlas Copco D45",
    status: "Түрээстэй",
    meta: "DRL-UB-0247",
    location: "Нарны зам · Блок B",
    assignee: "Б. Бат",
    tenant: "Хөх Тэнгэр ХХК",
    due: "10-р сарын 18",
    telemetry: { vibration: "4.82", temperature: "78.6", rpm: "1,482" },
    live: true,
  },
  {
    id: "GEN-0162",
    name: "Генератор 150 кВА",
    model: "Cummins 150 kVA",
    status: "Бэлэн",
    meta: "GEN-0162",
    location: "Зүүн талбай · Хашаа 2",
    assignee: "С. Уран",
    tenant: "Монкон ХХК",
    due: "10-р сарын 14",
    telemetry: { vibration: "2.58", temperature: "64.2", rpm: "840" },
    live: true,
  },
  {
    id: "MIX-4993",
    name: "Бетон зуурагч 8м³",
    model: "MIX-8 PRO",
    status: "Анхаарах",
    meta: "MIX-4993",
    location: "Талбай 12 · Блок C",
    assignee: "Н. Баяр",
    tenant: "Улаанбаатар бетон",
    due: "10-р сарын 16",
    telemetry: { vibration: "8.41", temperature: "96.2", rpm: "1,824" },
    live: true,
  },
  {
    id: "EXC-0914",
    name: "Бага оврын экскаватор",
    model: "CAT 308E",
    status: "Засварт",
    meta: "EXC-0914",
    location: "Баруун талбай · Хашаа 1",
    assignee: "Г. Дэлгэр",
    tenant: "Говь зам ХХК",
    due: "10-р сарын 09",
    telemetry: { vibration: "3.75", temperature: "72.4", rpm: "1,180" },
    live: false,
  },
  {
    id: "TLS-1318",
    name: "Гар багаж / багц",
    model: "Tool kit 12",
    status: "Бэлэн",
    meta: "TLS-1318",
    location: "Номын сан · Хадгалах",
    assignee: "Б. Бөх",
    tenant: "Улаанбаатар логистик",
    due: "10-р сарын 20",
    telemetry: { vibration: "0.86", temperature: "32.1", rpm: "0" },
    live: false,
  },
]

const authenticatedDashboard: DashboardResponse = {
  summary: {
    totalEquipment: 47,
    rentedToday: 6,
    alerts: 4,
    syncSecondsAgo: "8 сек өмнө",
    siteName: "Улаанбаатар төв",
  },
  equipment: equipmentCatalog,
  alerts: [
    {
      id: "A-8842",
      title: "Бетон зуурагчийн температур",
      equipmentId: "MIX-4993",
      risk: "93.4%",
      location: "Талбай 12",
      severity: "high",
      description: "Температур 96.2°C · автомат мониторинг идэвхтэй",
    },
  ],
  notifications: [
    {
      id: "n-1",
      title: "Хөдөлгүүрийн эрсдэл 18 мин",
      meta: "MIX-4993 · Талбай 12",
      type: "alert",
      createdAt: "Өнөөдөр · 12:43",
    },
    {
      id: "n-2",
      title: "Хугацаа 2 цагийн дараа дуусна",
      meta: "Өрмийн машин D45",
      type: "calendar",
      createdAt: "Өнөөдөр · 12:50",
    },
  ],
  supportTeam: [
    { name: "Д. Эрдэнэ", role: "Техникч · 7 мин" },
    { name: "С. Номин", role: "Менежер · ONLINE" },
  ],
}

const renderAuthenticatedRoute = async (
  route: string,
  dashboard: DashboardResponse = authenticatedDashboard,
  role: UserRole = "manager",
  onBackToWebsite?: () => void,
) => {
  const user = userEvent.setup()
  const roleLabel = role === "renter" ? "Түрээслэгч" : "Менежер"
  vi.spyOn(api, "login").mockResolvedValue({
    message: "Welcome",
    user: {
      id: `${role}-99128044`,
      role,
      phone: "99128044",
      name: roleLabel,
      company: "Example Co",
    },
    session: {
      token: "session-token",
      role,
      expiresAt: "2026-11-14T10:00:00.000Z",
    },
  })
  vi.spyOn(api, "getDashboard").mockResolvedValue(dashboard)
  window.history.replaceState(null, "", "/#login")
  render(<MobileOpsApp onBackToWebsite={onBackToWebsite} />)

  if (role === "renter") {
    await user.click(
      screen.getByRole("button", { name: /Түрээслэгч Гэрээ, төлбөр/ }),
    )
  }
  await user.click(
    screen.getByRole("button", { name: `${roleLabel}ээр нэвтрэх` }),
  )
  await screen.findByRole("heading", { name: `Өглөөний мэнд, ${roleLabel}` })
  await screen.findByText(String(dashboard.summary.totalEquipment))
  if (route !== "home") {
    window.history.replaceState(null, "", `/#${route}`)
    fireEvent(window, new HashChangeEvent("hashchange"))
  }

  return user
}

const renderAuthenticatedEquipment = () => renderAuthenticatedRoute("equipment")

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

// Аппын дэлгэцүүд, хэрэглэгчийн урсгал болон үйлдлийн үр дүнг шалгана.
describe("MobileOpsApp screens", () => {
  // Hash зам бүр тохирох дэлгэцээ харуулж байгааг шалгана.
  it.each([
    ["home", "Өглөөний мэнд, Менежер"],
    ["equipment", "Тоног төхөөрөмж"],
    ["detail", "Өрмийн машин D45"],
    ["calendar", "Захиалгын хуанли"],
    ["scanner", "QR код уншуулах"],
    ["checkout", "Check-out · Олголт"],
    ["checkin", "Check-in · Буцаалт"],
    ["telemetry", "Live telemetry"],
    ["anomaly", "Anomaly alert"],
    ["support", "Тусламжийн хүсэлт"],
    ["notifications", "Мэдэгдэл ба түүх"],
  ])("renders the %s screen", (route, heading) => {
    renderAtHash(route)
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument()
  })

  // Танигдаагүй замд  дэлгэц рүү нэвтрэх замруу аюулгүй шилжүүлнэ.
  it("falls back to login for an unknown route", () => {
    renderAtHash("unknown-screen")
    expect(
      screen.getByRole("heading", { name: "Хэрэглэгчийн төрөл" }),
    ).toBeInTheDocument()
  })

  // Цэсний товч дарахад дэлгэц болон URL-ийн зам хамт өөрчлөгдөнө.
  it("updates the route when a navigation button is clicked", async () => {
    const user = userEvent.setup()
    renderAtHash("home")

    await user.click(screen.getByRole("button", { name: "Төхөөрөмж" }))

    expect(
      screen.getByRole("heading", { name: "Тоног төхөөрөмж" }),
    ).toBeInTheDocument()
    expect(window.location.hash).toBe("#equipment")
  })

  // Идэвхтэй цэсийг дахин сонгоход одоогийн дэлгэц хэвээр үлдэнэ.
  it("keeps the current route when the active navigation item is selected", async () => {
    const user = userEvent.setup()
    renderAtHash("home")

    await user.click(screen.getByRole("button", { name: "Нүүр" }))

    expect(window.location.hash).toBe("#home")
    expect(
      screen.getByRole("heading", { name: "Өглөөний мэнд, Менежер" }),
    ).toBeInTheDocument()
  })

  // Анхааруулгаас тусламж руу шилжих, буцах болон системээс гарахыг шалгана.
  it("handles home alerts, support escalation, and signing out", async () => {
    const user = userEvent.setup()
    renderAtHash("home")

    await user.click(screen.getByRole("button", { name: "Буцах" }))
    await user.click(
      screen.getByRole("button", { name: /Бетон зуурагчийн температур/ }),
    )
    expect(
      screen.getByRole("heading", { name: "Anomaly alert" }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Хариу арга хэмжээ авах" }),
    )
    expect(
      screen.getByRole("heading", { name: "Тусламжийн хүсэлт" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Anomaly alert" }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Өглөөний мэнд, Менежер" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Гарах" }))
    expect(
      screen.getByRole("heading", { name: "Хэрэглэгчийн төрөл" }),
    ).toBeInTheDocument()
  })

  // Фиксерийн товчлол, мэдэгдлийн холбоос болон dashboard-ийн алдааны үеийн ажиллагааг шалгана.
  it("supports fixer shortcuts, notification navigation, and failed dashboard loading", async () => {
    const user = userEvent.setup()
    vi.spyOn(api, "login").mockResolvedValue({
      message: "Welcome",
      user: {
        id: "fixer-99128044",
        role: "fixer",
        phone: "99128044",
        name: "Fixer",
        company: "Example Co",
      },
      session: {
        token: "session-token",
        role: "fixer",
        expiresAt: "2026-11-13T10:00:00.000Z",
      },
    })
    vi.spyOn(api, "getDashboard").mockRejectedValue(new Error("offline"))
    renderAtHash("login")

    await user.click(screen.getByRole("button", { name: /Фиксер Төхөөрөмж/ }))
    await user.click(screen.getByRole("button", { name: "Фиксерээр нэвтрэх" }))
    expect(
      await screen.findByRole("heading", { name: "Өглөөний мэнд, Фиксер" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "QR уншуулах" }))
    expect(
      screen.getByRole("heading", { name: "QR код уншуулах" }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Өглөөний мэнд, Фиксер" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Тусламж" }))
    expect(
      screen.getByRole("heading", { name: "Тусламжийн хүсэлт" }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Нүүр" }))
    await user.click(screen.getByRole("button", { name: "Үргэлжлүүлэх" }))
    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Тоног төхөөрөмж" }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    await user.click(screen.getAllByRole("button", { name: "Мэдэгдэл" })[0])
    expect(
      screen.getByRole("heading", { name: "Мэдэгдэл ба түүх" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Түрээсийн түүх" }))
    await user.click(
      screen.getByRole("button", {
        name: /Өрмийн машин D45 Захиалга батлагдсан/,
      }),
    )
    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()
  })

  // Эрхийн төрөл бүрийн мэндчилгээ болон товчлол ялгаатай харагдаж байгааг шалгана.
  it.each([
    ["manager", "Менежер", "Төхөөрөмжийн жагсаалт", "Мэдэгдэл"],
    ["fixer", "Фиксер", "QR уншуулах", "Тусламж"],
    ["renter", "Түрээслэгч", "Төхөөрөмжийн жагсаалт", "Мэдэгдэл"],
  ] as const)(
    "shows the %s home greeting and role-specific shortcuts",
    async (role, roleLabel, primaryAction, secondaryAction) => {
      const user = userEvent.setup()
      vi.spyOn(api, "login").mockResolvedValue({
        message: "Welcome",
        user: {
          id: `${role}-99128044`,
          role,
          phone: "99128044",
          name: roleLabel,
          company: "Example Co",
        },
        session: {
          token: "session-token",
          role,
          expiresAt: "2026-11-13T10:00:00.000Z",
        },
      })
      vi.spyOn(api, "getDashboard").mockRejectedValue(new Error("offline"))
      renderAtHash("login")

      await user.click(
        screen.getByRole("button", { name: new RegExp(`^${roleLabel} `) }),
      )
      await user.click(
        screen.getByRole("button", { name: `${roleLabel}ээр нэвтрэх` }),
      )

      expect(
        await screen.findByRole("heading", {
          name: `Өглөөний мэнд, ${roleLabel}`,
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: primaryAction }),
      ).toBeInTheDocument()
      expect(
        screen.getAllByRole("button", { name: secondaryAction }).length,
      ).toBeGreaterThan(0)
    },
  )

  // Серверээс ирсэн dashboard өгөгдөл нөөц өгөгдлийг орлож байгааг шалгана.
  it("renders successfully loaded dashboard data instead of fallback data", async () => {
    const user = userEvent.setup()
    vi.spyOn(api, "login").mockResolvedValue({
      message: "Welcome",
      user: {
        id: "manager-99128044",
        role: "manager",
        phone: "99128044",
        name: "Manager",
        company: "Example Co",
      },
      session: {
        token: "session-token",
        role: "manager",
        expiresAt: "2026-11-13T10:00:00.000Z",
      },
    })
    vi.spyOn(api, "getDashboard").mockResolvedValue({
      summary: {
        totalEquipment: 47,
        rentedToday: 0,
        alerts: 1,
        syncSecondsAgo: "just now",
        siteName: "Test site",
      },
      equipment: [],
      alerts: [
        {
          id: "test-alert",
          title: "Test temperature alert",
          equipmentId: "TEST-001",
          risk: "99%",
          location: "Test site",
          severity: "high",
          description: "Test alert details",
        },
      ],
      notifications: [],
      supportTeam: [],
    })
    renderAtHash("login")

    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))

    expect(
      await screen.findByRole("button", { name: /Test temperature alert/ }),
    ).toBeInTheDocument()
    expect(screen.getByText("47")).toBeInTheDocument()
    expect(screen.queryByText("93.4%")).not.toBeInTheDocument()
  })

  // QR, төхөөрөмжийн дэлгэрэнгүй, telemetry болон захиалгын урсгалыг шалгана.
  it("follows scanner, detail, telemetry, calendar, checkout, and check-in actions", async () => {
    const user = userEvent.setup()
    renderAtHash("scanner")

    await user.click(screen.getByRole("button", { name: "ID оруулах" }))
    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole("button", { name: "Live telemetry дэлгэрэнгүй" }),
    )
    expect(
      screen.getByRole("heading", { name: "Live telemetry" }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole("button", { name: "ANOMALY · шинэ эрсдэл илэрлээ" }),
    )
    expect(
      screen.getByRole("heading", { name: "Anomaly alert" }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole("button", { name: "Хариу арга хэмжээ авах" }),
    )
    expect(
      screen.getByRole("heading", { name: "Тусламжийн хүсэлт" }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Өглөөний мэнд, Менежер" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Төхөөрөмж" }))
    await user.click(screen.getByRole("button", { name: "Түрээстэй 76" }))
    expect(screen.getByText("Өрмийн машин D45")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Анхаарах 9" }))
    expect(screen.getByText("Бетон зуурагч 8м³")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Бүгд 128" }))
    await user.click(
      screen.getByRole("button", { name: /Өрмийн машин D45 DRL-UB-0247/ }),
    )
    await user.click(
      screen.getByRole("button", { name: "Захиалгын хугацаа сонгох" }),
    )
    expect(
      screen.getByRole("heading", { name: "Захиалгын хуанли" }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole("button", { name: "Захиалга баталгаажуулах" }),
    )
    await user.click(
      screen.getByRole("button", { name: "Check-out баталгаажуулах" }),
    )
    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()
  })

  // URL-ийн hash өөрчлөлт болон мэдэгдлээс очих дэлгэц зөв ажиллахыг шалгана.
  it("follows hash changes and routes notifications to their destination", async () => {
    const user = userEvent.setup()
    renderAtHash("home")

    window.history.replaceState(null, "", "/#notifications")
    fireEvent(window, new HashChangeEvent("hashchange"))
    expect(
      screen.getByRole("heading", { name: "Мэдэгдэл ба түүх" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Мэдэгдэл · 7" }))
    await user.click(
      screen.getByRole("button", { name: /Хөдөлгүүрийн эрсдэл/ }),
    )
    expect(
      screen.getByRole("heading", { name: "Anomaly alert" }),
    ).toBeInTheDocument()
  })

  // Захиалга, олголт, буцаалт болон telemetry дэлгэцүүдээс буцах урсгалыг шалгана.
  it("returns from the calendar, checkout, check-in, and telemetry screens", async () => {
    const user = userEvent.setup()
    renderAtHash("calendar")

    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole("button", { name: "Live telemetry дэлгэрэнгүй" }),
    )
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Захиалгын хугацаа сонгох" }),
    )
    await user.click(
      screen.getByRole("button", { name: "Захиалга баталгаажуулах" }),
    )
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Захиалгын хуанли" }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole("button", { name: "Захиалга баталгаажуулах" }),
    )
    await user.click(
      screen.getByRole("button", { name: "Check-out баталгаажуулах" }),
    )
    await user.click(screen.getByRole("button", { name: "QR уншуулах" }))
    expect(
      screen.getByRole("heading", { name: "QR код уншуулах" }),
    ).toBeInTheDocument()
  })

  // Зураг сонголт, буцаалтын үйлдэл, түүхийн дэлгэц хоорондын шилжилтийг шалгана.
  it("covers photo selection, check-in actions, and notification history navigation", async () => {
    const user = userEvent.setup()
    renderAtHash("scanner")

    await user.click(screen.getByRole("button", { name: "Зураг сонгох" }))
    expect(
      screen.getByRole("heading", { name: "Check-out · Олголт" }),
    ).toBeInTheDocument()

    cleanup()
    renderAtHash("checkin")
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Тоног төхөөрөмж" }),
    ).toBeInTheDocument()

    cleanup()
    renderAtHash("checkin")
    await user.click(
      screen.getByRole("button", { name: "Буцаалт нээж, акт үүсгэх" }),
    )
    expect(
      screen.getByRole("heading", { name: "Тоног төхөөрөмж" }),
    ).toBeInTheDocument()

    cleanup()
    renderAtHash("notifications")
    await user.click(
      screen.getByRole("button", {
        name: /Өрмийн машин D45 Захиалга батлагдсан/,
      }),
    )
    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()

    cleanup()
    renderAtHash("notifications")
    await user.click(screen.getByRole("button", { name: "Буцах" }))
    expect(
      screen.getByRole("heading", { name: "Өглөөний мэнд, Менежер" }),
    ).toBeInTheDocument()
  })

  // Төхөөрөмжийн бэлэн байдлаар шүүж, дэлгэрэнгүй мэдээлэл рүү орно.
  it("filters equipment by availability and navigates to its details", async () => {
    const user = userEvent.setup()
    renderAtHash("equipment")

    await user.click(screen.getByRole("button", { name: "Бэлэн 30" }))
    expect(screen.getByText("Генератор 150 кВА")).toBeInTheDocument()
    expect(screen.queryByText("Өрмийн машин D45")).not.toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Генератор 150 кВА GEN-0162 Бэлэн" }),
    )
    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()
  })

  // Хуанлид өдөр сонгоод олголтын дараагийн алхамд шилжинэ.
  it("updates the calendar selection and continues to checkout", async () => {
    const user = userEvent.setup()
    renderAtHash("calendar")

    await user.click(screen.getByRole("button", { name: /БЯМ\s*10/ }))
    expect(screen.getByText("10.10 · 08:00")).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Захиалга баталгаажуулах" }),
    )
    expect(
      screen.getByRole("heading", { name: "Check-out · Олголт" }),
    ).toBeInTheDocument()
  })

  // Өөр өдөр сонгоход түрээсийн эхлэх болон дуусах огноо шинэчлэгдэнэ.
  it.each([
    ["05", "10.05 · 08:00", "10.06 · 18:00"],
    ["11", "10.11 · 08:00", "10.12 · 18:00"],
  ])(
    "updates the selected rental start and end date for day %s",
    async (day, startDate, endDate) => {
      const user = userEvent.setup()
      renderAtHash("calendar")

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`(?:ДАВ|БЯМ|НЯМ)\\s*${day}`),
        }),
      )

      expect(screen.getByText(startDate)).toBeInTheDocument()
      expect(screen.getByText(endDate)).toBeInTheDocument()
    },
  )

  // Check-in хугацааны мэдэгдлээс буцаалтын шалгах хуудас нээгдэнэ.
  it("opens the return checklist from notification history", async () => {
    const user = userEvent.setup()
    renderAtHash("notifications")

    await user.click(screen.getByRole("button", { name: "Түрээсийн түүх" }))
    await user.click(
      screen.getByRole("button", { name: /Check-in хугацаа ойртлоо/ }),
    )

    expect(
      screen.getByRole("heading", { name: "Check-in · Буцаалт" }),
    ).toBeInTheDocument()
  })

  // Мэдээллийн шинжтэй түүхийг нээхэд хэрэглэгч түүхийн дэлгэцэд үлдэнэ.
  it.each(["Check-out амжилттай", "Менежер баталсан"])(
    "keeps the history screen open for informational entry %s",
    async (entry) => {
      const user = userEvent.setup()
      renderAtHash("notifications")

      await user.click(screen.getByRole("button", { name: "Түрээсийн түүх" }))
      await user.click(screen.getByRole("button", { name: new RegExp(entry) }))

      expect(
        screen.getByRole("heading", { name: "Мэдэгдэл ба түүх" }),
      ).toBeInTheDocument()
    },
  )

  // Тусламжийн хүсэлтийг зөв багт илгээж амжилтын төлөв харуулна.
  it("sends support requests and shows the success state", async () => {
    const user = userEvent.setup()
    const sendSupportRequest = vi
      .spyOn(api, "sendSupportRequest")
      .mockResolvedValue({
        ok: true,
        message: "Sent",
        team: "tech-support",
        ticketId: "A-8842",
        updatedAt: "2026-11-13T10:00:00.000Z",
      })
    renderAtHash("support")

    await user.click(
      screen.getByRole("button", { name: "Техникч, менежерт тусламж илгээх" }),
    )

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Тусламж илгээгдлээ" }),
      ).toBeInTheDocument(),
    )
    expect(sendSupportRequest).toHaveBeenCalledWith({
      message: "Яаралтай засвар, түгшүүртэй төхөөрөмжийн хяналт шаардлагатай",
      team: "tech-support",
    })
  })

  // Серверийн алдааны мессежийг хэрэглэгчид харуулж дахин оролдох боломж үлдээнэ.
  it("shows a clear message when sending a support request fails", async () => {
    const user = userEvent.setup()
    vi.spyOn(api, "sendSupportRequest").mockRejectedValue(
      new Error("Support service unavailable"),
    )
    renderAtHash("support")

    await user.click(
      screen.getByRole("button", { name: "Техникч, менежерт тусламж илгээх" }),
    )

    expect(
      await screen.findByText("Support service unavailable"),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Техникч, менежерт тусламж илгээх" }),
    ).toBeInTheDocument()
  })

  // Алдаа Error объект биш байсан ч тусламжийн ерөнхий мессеж харуулна.
  it("shows a generic support error when the request rejects with a non-Error value", async () => {
    const user = userEvent.setup()
    vi.spyOn(api, "sendSupportRequest").mockRejectedValue("network unavailable")
    renderAtHash("support")

    await user.click(
      screen.getByRole("button", { name: "Техникч, менежерт тусламж илгээх" }),
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Тусламжийн хүсэлт илгээхэд алдаа гарлаа.",
    )
  })

  // Дэлгэц бүрээс доод цэсний товч бүр рүү шилжих боломжтойг шалгана.
  it.each(
    [
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
    ].flatMap((source) =>
      [
        ["Нүүр", "home", "Өглөөний мэнд, Менежер"],
        ["Төхөөрөмж", "equipment", "Тоног төхөөрөмж"],
        ["QR", "scanner", "QR код уншуулах"],
        ["Мэдэгдэл", "notifications", "Мэдэгдэл ба түүх"],
      ].map(([label, destination, heading]) => ({
        source,
        label,
        destination,
        heading,
      })),
    ),
  )(
    "navigates from $source to $destination using the bottom menu",
    async ({ source, label, destination, heading }) => {
      const user = userEvent.setup()
      renderAtHash(source)

      await user.click(
        within(screen.getByRole("navigation")).getByRole("button", {
          name: label,
        }),
      )

      expect(window.location.hash).toBe(`#${destination}`)
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument()
    },
  )

  // Менежер болон түрээслэгчийн нүүр хуудсын гурван товчлол зөв дэлгэцэд хүргэнэ.
  it.each([
    ["manager", "Төхөөрөмжийн жагсаалт", "Тоног төхөөрөмж"],
    ["renter", "Төхөөрөмжийн жагсаалт", "Тоног төхөөрөмж"],
    ["manager", "Мэдэгдэл", "Мэдэгдэл ба түүх"],
    ["renter", "Мэдэгдэл", "Мэдэгдэл ба түүх"],
    ["manager", "Үргэлжлүүлэх", "Мэдэгдэл ба түүх"],
    ["renter", "Үргэлжлүүлэх", "Мэдэгдэл ба түүх"],
  ] as const)(
    "%s нүүрийн %s товчлолыг нээнэ",
    async (role, shortcut, expectedHeading) => {
      const user = await renderAuthenticatedRoute(
        "home",
        authenticatedDashboard,
        role,
      )

      const buttons = screen.getAllByRole("button", { name: shortcut })
      await user.click(shortcut === "Мэдэгдэл" ? buttons[1] : buttons[0])

      expect(
        screen.getByRole("heading", { name: expectedHeading }),
      ).toBeInTheDocument()
    },
  )

  // Website сонголт зөвхөн callback өгсөн үед харагдаж, callback-ийг ажиллуулна.
  it("calls the optional website callback from the home screen", async () => {
    const onBackToWebsite = vi.fn()
    const user = await renderAuthenticatedRoute(
      "home",
      authenticatedDashboard,
      "manager",
      onBackToWebsite,
    )

    await user.click(screen.getByRole("button", { name: "Website" }))

    expect(onBackToWebsite).toHaveBeenCalledOnce()
  })

  // Төхөөрөмжийн ангилал бүрд зөв тооны, зөв нэртэй бичлэг харагдана.
  it.each([
    [
      "Бүгд 128",
      [
        "Өрмийн машин D45",
        "Генератор 150 кВА",
        "Бетон зуурагч 8м³",
        "Бага оврын экскаватор",
        "Гар багаж / багц",
      ],
    ],
    ["Бэлэн 30", ["Генератор 150 кВА", "Гар багаж / багц"]],
    ["Түрээстэй 76", ["Өрмийн машин D45"]],
    ["Анхаарах 9", ["Бетон зуурагч 8м³", "Бага оврын экскаватор"]],
  ])(
    "shows the matching equipment for filter %s",
    async (filter, expectedItems) => {
      const user = await renderAuthenticatedEquipment()

      await user.click(screen.getByRole("button", { name: filter }))

      for (const item of expectedItems) {
        expect(screen.getByText(item)).toBeInTheDocument()
      }
      expect(
        screen
          .getAllByRole("button")
          .filter((button) =>
            expectedItems.some((item) => button.textContent?.includes(item)),
          ),
      ).toHaveLength(expectedItems.length)
    },
  )

  // Бүх төхөөрөмжийн мөр дэлгэрэнгүй мэдээллийн ижил урсгалд хүргэдэг.
  it.each([
    ["Өрмийн машин D45", "DRL-UB-0247", "Түрээстэй"],
    ["Генератор 150 кВА", "GEN-0162", "Бэлэн"],
    ["Бетон зуурагч 8м³", "MIX-4993", "Анхаарах"],
    ["Бага оврын экскаватор", "EXC-0914", "Засварт"],
    ["Гар багаж / багц", "TLS-1318", "Бэлэн"],
  ])("opens equipment details from the %s row", async (name, id, status) => {
    const user = await renderAuthenticatedEquipment()

    await user.click(
      screen.getByRole("button", { name: `${name} ${id} ${status}` }),
    )

    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()
    expect(window.location.hash).toBe("#detail")
  })

  // Хуанлийн долоо хоногийн бүх өдөр эхлэх, дуусах огноог зөв тооцно.
  it.each([
    ["05", "ДАВ", "06"],
    ["06", "МЯГ", "07"],
    ["07", "ЛХА", "08"],
    ["08", "ПҮР", "09"],
    ["09", "БАА", "10"],
    ["10", "БЯМ", "11"],
    ["11", "НЯМ", "12"],
  ])(
    "calculates the rental range for October %s",
    async (day, weekday, nextDay) => {
      const user = userEvent.setup()
      renderAtHash("calendar")

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`${weekday}\\s*${day}`),
        }),
      )

      expect(screen.getByText(`10.${day} · 08:00`)).toBeInTheDocument()
      expect(screen.getByText(`10.${nextDay} · 18:00`)).toBeInTheDocument()
    },
  )

  // Мэдэгдлийн төрөл бүр тохирох дэлгэрэнгүй дэлгэцэд хүргэдэг.
  it.each([
    ["Хөдөлгүүрийн эрсдэл 18 мин", "Anomaly alert", "anomaly"],
    ["Хугацаа 2 цагийн дараа дуусна", "Өрмийн машин D45", "detail"],
  ])(
    "opens the correct destination for notification %s",
    async (title, heading, route) => {
      const user = userEvent.setup()
      renderAtHash("notifications")

      await user.click(screen.getByRole("button", { name: new RegExp(title) }))

      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument()
      expect(window.location.hash).toBe(`#${route}`)
    },
  )

  // Олголтын зааврыг танилцуулсан эсэхийг хэрэглэгч сонгож, сонголтоо буцаана.
  it("allows toggling the checkout instruction confirmation", async () => {
    const user = userEvent.setup()
    renderAtHash("checkout")
    const confirmation = screen.getByRole("checkbox", {
      name: "Хүлээн авагчид нөхцөл, зааврыг танилцуулсан",
    })

    expect(confirmation).not.toBeChecked()
    await user.click(confirmation)
    expect(confirmation).toBeChecked()
    await user.click(confirmation)
    expect(confirmation).not.toBeChecked()
  })

  // Буцаалтын үнэлгээний боломжит гэмтлийн сонголтууд дэлгэцэд бүрэн харагдана.
  it.each(["Эвдрэлгүй", "Зураас", "Бусад"])(
    "shows the return condition option %s",
    (condition) => {
      renderAtHash("checkin")

      expect(
        screen.getByRole("button", { name: condition }),
      ).toBeInTheDocument()
    },
  )

  // Dashboard төхөөрөмжийн жагсаалт null үед төхөөрөмжийн нөөц жагсаалтыг харуулна.
  it("uses fallback equipment when the dashboard equipment list is null", async () => {
    const incompleteDashboard = {
      ...authenticatedDashboard,
      equipment: null,
    } as unknown as DashboardResponse
    await renderAuthenticatedRoute("equipment", incompleteDashboard)

    expect(screen.getByText("Өрмийн машин D45")).toBeInTheDocument()
    expect(screen.getByText("Генератор 150 кВА")).toBeInTheDocument()
    expect(screen.getByText("Бетон зуурагч 8м³")).toBeInTheDocument()
  })

  // Төхөөрөмжийн дэлгэрэнгүй мэдээлэл байхгүй үед эхний нөөц төхөөрөмжийг харуулна.
  it("uses fallback equipment details when the dashboard list is empty", async () => {
    const emptyDashboard = {
      ...authenticatedDashboard,
      equipment: [],
    }
    await renderAuthenticatedRoute("detail", emptyDashboard)

    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Atlas Copco D45")).toBeInTheDocument()
    expect(screen.getByText("MQTT LIVE")).toBeInTheDocument()
  })

  // Зарим дэлгэрэнгүй талбар дутсан үед UI утга бүрийн нөөц текстийг харуулна.
  it("uses field defaults when equipment details contain null values", async () => {
    const sparseEquipment = {
      ...equipmentCatalog[0],
      meta: null,
      name: null,
      model: null,
      location: null,
      assignee: null,
      tenant: null,
      due: null,
      telemetry: { vibration: null, temperature: null, rpm: null },
      live: false,
    }
    const sparseDashboard = {
      ...authenticatedDashboard,
      equipment: [sparseEquipment],
    } as unknown as DashboardResponse
    await renderAuthenticatedRoute("detail", sparseDashboard)

    expect(
      screen.getByRole("heading", { name: "Өрмийн машин D45" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Atlas Copco D45")).toBeInTheDocument()
    expect(screen.getByText("Нарны зам · Блок B")).toBeInTheDocument()
    expect(screen.getByText("Б. Бат")).toBeInTheDocument()
    expect(screen.getByText("Хөх Тэнгэр ХХК")).toBeInTheDocument()
    expect(screen.getByText("10-р сарын 18")).toBeInTheDocument()
    expect(screen.getByText("4.82")).toBeInTheDocument()
    expect(screen.getByText("78.6")).toBeInTheDocument()
    expect(screen.getByText("1,482")).toBeInTheDocument()
    expect(screen.getByText("OFFLINE")).toBeInTheDocument()
  })

  // Анхааруулга хоосон үед дэлгэцэд урьдчилан тохируулсан эрсдэлийн мэдээлэл байна.
  it("uses fallback alert details when the dashboard has no alerts", async () => {
    const noAlertsDashboard = { ...authenticatedDashboard, alerts: [] }
    await renderAuthenticatedRoute("anomaly", noAlertsDashboard)

    expect(screen.getByText("Бетон зуурагчийн температур")).toBeInTheDocument()
    expect(screen.getByText("93.4%")).toBeInTheDocument()
    expect(screen.getByText("Талбай 12")).toBeInTheDocument()
    expect(screen.getByText("MIX-4993")).toBeInTheDocument()
  })

  // Alert-ийн талбарууд null үед дэлгэцэд талбар бүрийн нөөц утгыг харуулна.
  it("uses fallback values for null alert fields", async () => {
    const sparseAlert = {
      ...authenticatedDashboard.alerts[0],
      title: null,
      equipmentId: null,
      risk: null,
      location: null,
    } as unknown as AlertItem
    const sparseAlertsDashboard = {
      ...authenticatedDashboard,
      alerts: [sparseAlert],
    }
    await renderAuthenticatedRoute("anomaly", sparseAlertsDashboard)

    expect(screen.getByText("Бетон зуурагч “B4”")).toBeInTheDocument()
    expect(screen.getByText("93.4%")).toBeInTheDocument()
    expect(screen.getByText("ББ · Талбай 12")).toBeInTheDocument()
    expect(screen.getByText("eq_429_788")).toBeInTheDocument()
  })

  // Хариу өгөх багийн мэдээлэл null үед нөөц багийг харуулна.
  it("uses fallback support contacts when the dashboard team is null", async () => {
    const noSupportTeam = {
      ...authenticatedDashboard,
      supportTeam: null,
    } as unknown as DashboardResponse
    await renderAuthenticatedRoute("support", noSupportTeam)

    expect(screen.getByText("Д. Эрдэнэ")).toBeInTheDocument()
    expect(screen.getByText("С. Номин")).toBeInTheDocument()
    expect(screen.getByText("Техникч · 7 мин")).toBeInTheDocument()
    expect(screen.getByText("Менежер · ONLINE")).toBeInTheDocument()
  })

  // Мэдэгдлийн жагсаалт null үед fallback мэдэгдлүүдийг үзүүлж холбоосыг ажиллуулна.
  it("uses fallback notifications when the dashboard notifications are null", async () => {
    const noNotifications = {
      ...authenticatedDashboard,
      notifications: null,
    } as unknown as DashboardResponse
    await renderAuthenticatedRoute("notifications", noNotifications)

    expect(screen.getByText("2 мэдэгдэл · 2 шинэ")).toBeInTheDocument()
    expect(screen.getByText("Хөдөлгүүрийн эрсдэл 18 мин")).toBeInTheDocument()
    expect(
      screen.getByText("Хугацаа 2 цагийн дараа дуусна"),
    ).toBeInTheDocument()
  })

  // Түүхийн холбоосгүй бичлэгүүдийг дарахад одоогийн дэлгэц ба URL өөрчлөгдөхгүй.
  it.each(["Check-out амжилттай", "Менежер баталсан"])(
    "%s түүхийн мөр холбоосгүй хэвээр байна",
    async (entry) => {
      const user = userEvent.setup()
      renderAtHash("notifications")
      await user.click(screen.getByRole("button", { name: "Түрээсийн түүх" }))

      await user.click(screen.getByRole("button", { name: new RegExp(entry) }))

      expect(window.location.hash).toBe("#notifications")
      expect(
        screen.getByRole("heading", { name: "Мэдэгдэл ба түүх" }),
      ).toBeInTheDocument()
    },
  )

  // Үндсэн мэдэгдлийн дэлгэцийн мэдээллийн түүхийн мөрүүд навигац хийхгүй.
  it.each(["Check-out амжилттай", "Менежер баталсан"])(
    "keeps the notifications tab open after clicking informational history %s",
    async (entry) => {
      const user = userEvent.setup()
      renderAtHash("notifications")

      await user.click(screen.getByRole("button", { name: new RegExp(entry) }))

      expect(window.location.hash).toBe("#notifications")
      expect(
        screen.getByRole("heading", { name: "Мэдэгдэл ба түүх" }),
      ).toBeInTheDocument()
    },
  )

  // Түрээсийн үйл явцын эхний болон сүүлийн бичлэг зөв дэлгэцэд шилжүүлнэ.
  it.each([
    ["Өрмийн машин D45 Захиалга батлагдсан", "detail"],
    ["Check-in хугацаа ойртлоо", "checkin"],
  ] as const)(
    "opens the appropriate screen from the rental timeline entry %s",
    async (entry, destination) => {
      const user = userEvent.setup()
      renderAtHash("notifications")

      await user.click(screen.getByRole("button", { name: new RegExp(entry) }))

      expect(window.location.hash).toBe(`#${destination}`)
    },
  )

  // Dashboard хүсэлт компонент хаагдсаны дараа амжилттай ирвэл state шинэчлэхгүй.
  it("ignores dashboard data that resolves after signing out", async () => {
    const user = userEvent.setup()
    let resolveDashboard: (dashboard: DashboardResponse) => void
    const pendingDashboard = new Promise<DashboardResponse>((resolve) => {
      resolveDashboard = resolve
    })
    vi.spyOn(api, "getDashboard").mockReturnValue(pendingDashboard)
    vi.spyOn(api, "login").mockResolvedValue({
      message: "Welcome",
      user: {
        id: "manager-99128044",
        role: "manager",
        phone: "99128044",
        name: "Manager",
        company: "Example Co",
      },
      session: {
        token: "session-token",
        role: "manager",
        expiresAt: "2026-11-14T10:00:00.000Z",
      },
    })
    renderAtHash("login")
    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))
    await waitFor(() => expect(api.getDashboard).toHaveBeenCalledOnce())
    await user.click(screen.getByRole("button", { name: "Гарах" }))

    await act(async () => {
      resolveDashboard(authenticatedDashboard)
      await pendingDashboard
    })

    expect(
      screen.getByRole("heading", { name: "Хэрэглэгчийн төрөл" }),
    ).toBeInTheDocument()
    expect(window.location.hash).toBe("#login")
  })

  // Dashboard хүсэлт хаагдсаны дараа алдаатай дууссан ч алдааны handler state өөрчлөхгүй.
  it("ignores dashboard errors that occur after signing out", async () => {
    const user = userEvent.setup()
    let rejectDashboard: (reason: Error) => void
    const pendingDashboard = new Promise<DashboardResponse>((_, reject) => {
      rejectDashboard = reject
    })
    vi.spyOn(api, "getDashboard").mockReturnValue(pendingDashboard)
    vi.spyOn(api, "login").mockResolvedValue({
      message: "Welcome",
      user: {
        id: "manager-99128044",
        role: "manager",
        phone: "99128044",
        name: "Manager",
        company: "Example Co",
      },
      session: {
        token: "session-token",
        role: "manager",
        expiresAt: "2026-11-14T10:00:00.000Z",
      },
    })
    renderAtHash("login")
    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))
    await waitFor(() => expect(api.getDashboard).toHaveBeenCalledOnce())
    await user.click(screen.getByRole("button", { name: "Гарах" }))

    await act(async () => {
      rejectDashboard(new Error("late network failure"))
      await pendingDashboard.catch(() => undefined)
    })

    expect(
      screen.getByRole("heading", { name: "Хэрэглэгчийн төрөл" }),
    ).toBeInTheDocument()
    expect(window.location.hash).toBe("#login")
  })
})
