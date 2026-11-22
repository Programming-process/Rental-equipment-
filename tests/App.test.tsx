import { existsSync } from "node:fs"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import App from "../src/App"
import { api } from "../src/lib/api"
import { rentalCatalog } from "../src/rentalCatalog"

afterEach(() => {
  cleanup()
  window.localStorage.removeItem("rent-theme")
  delete document.documentElement.dataset.theme
})

// Үндсэн веб хуудсаас бусад хэсэг рүү шилжих, буцаж ирэх урсгалыг шалгана.
describe("App routes", () => {
  it("uses a unique equipment illustration for every catalog item", () => {
    const artwork = rentalCatalog.map((item) => item.image)

    expect(artwork).toHaveLength(rentalCatalog.length)
    expect(new Set(artwork).size).toBe(rentalCatalog.length)
  })

  it("points every catalog photo at a file that exists in public/", () => {
    const photos = rentalCatalog
      .map((item) => item.image)
      .filter((image) => image.endsWith(".jpg"))

    expect(photos.length).toBeGreaterThan(0)
    for (const photo of photos) {
      const relative = photo.replace(/^.*?assets\//, "public/assets/")
      expect(existsSync(relative), relative).toBe(true)
    }
  })

  it("toggles and persists night mode across the website and login", async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, "", "/")
    window.localStorage.removeItem("rent-theme")
    render(<App />)

    await user.click(
      screen.getByRole("button", { name: "Шөнийн горимд шилжих" }),
    )
    expect(document.documentElement.dataset.theme).toBe("dark")
    expect(window.localStorage.getItem("rent-theme")).toBe("dark")

    await user.click(screen.getByRole("button", { name: "Нэвтрэх" }))
    expect(document.querySelector(".login-form")).toHaveClass("bg-white")
    expect(document.querySelector(".app-theme")).toHaveClass("dark-mode")

    await user.click(
      screen.getByRole("button", { name: "Өдрийн горимд шилжих" }),
    )
    expect(document.documentElement.dataset.theme).toBe("light")
    expect(window.localStorage.getItem("rent-theme")).toBe("light")
  })

  it("lists the rental catalog with search and category filters", async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, "", "/")
    render(<App />)

    expect(
      screen.queryByRole("heading", { name: "Тоног төхөөрөмжийн бүх төрөл" }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Бүгдийг харах" }))
    expect(
      screen.getByRole("heading", { name: "Тоног төхөөрөмжийн бүх төрөл" }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Жишиг: ₮/).length).toBeGreaterThan(0)
    expect(screen.getByText(/нэвтрэхгүйгээр харах боломжтой/)).toBeInTheDocument()
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()

    await user.selectOptions(
      screen.getByLabelText("Төрлөөр шүүх"),
      "Хүнд даацын машин механизм",
    )
    expect(screen.getByText("Экскаватор")).toBeInTheDocument()
    expect(screen.queryByText("Цахилгаан өрмийн машин")).not.toBeInTheDocument()

    await user.type(screen.getByLabelText("Тоног төхөөрөмж хайх"), "мини")
    expect(screen.getByText("Мини экскаватор")).toBeInTheDocument()
    expect(screen.queryByText("Экскаватор")).not.toBeInTheDocument()
  })

  // Нийтийн нүүр болон каталогт аюулгүй байдлын дотоод хуудсыг харуулахгүй.
  it("renders a public landing page without exposing the security guide", async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, "", "/")
    render(<App />)

    expect(
      screen.getByRole("heading", { name: /Ажлын талбарын хүн/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "npm security" }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Тоног төхөөрөмж" }))
    expect(
      screen.queryByRole("button", { name: "npm security" }),
    ).not.toBeInTheDocument()
  })

  // Веб порталаас нэвтэрч, нүүр хуудас руу буцаж байгааг шалгана.
  it("opens the website portal and returns to the landing page", async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, "", "/")
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
        totalEquipment: 1,
        rentedToday: 1,
        alerts: 0,
        syncSecondsAgo: "now",
        siteName: "Example",
      },
      equipment: [],
      alerts: [],
      notifications: [],
      supportTeam: [],
    })
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Нэвтрэх" }))
    expect(
      screen.getByRole("heading", { name: "Түрээслэгчийн нэвтрэх" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^Менежер Тайлан/ }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Ажилтан нэвтрэх" }))
    expect(
      screen.getByRole("button", { name: /^Менежер Тайлан/ }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /^Менежер Тайлан/ }))
    await user.type(screen.getByLabelText("Имэйл хаяг"), "manager@example.com")
    await user.type(screen.getByLabelText("Нууц үг"), "secure-password")
    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Өдрийн мэнд, Менежер/ }),
      ).toBeInTheDocument(),
    )
    await user.click(screen.getByRole("button", { name: "npm security" }))
    expect(
      screen.getByRole("heading", {
        name: /Secure every step of your npm supply chain/,
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Back to dashboard" }))
    expect(
      screen.getByRole("heading", { name: /Өдрийн мэнд, Менежер/ }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole("button", { name: "Вэбсайтын нүүр хуудас" }),
    )
    expect(
      screen.getByRole("heading", { name: /Ажлын талбарын хүн/ }),
    ).toBeInTheDocument()
  })
})
