import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import App from "../src/App"
import { api } from "../src/lib/api"

afterEach(() => {
  cleanup()
})

// Үндсэн веб хуудсаас бусад хэсэг рүү шилжих, буцаж ирэх урсгалыг шалгана.
describe("App routes", () => {
  // Нүүр хуудас, npm аюулгүй байдлын хуудас хооронд зөв шилжиж байгааг шалгана.
  it("renders the landing page and routes to the security guide and back", async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, "", "/")
    render(<App />)

    expect(
      screen.getByRole("heading", { name: /Ажлын талбарын хүн/ }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "npm security" }))
    expect(
      screen.getByRole("heading", {
        name: /Secure every step of your npm supply chain/,
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Back to dashboard" }))
    expect(
      screen.getByRole("heading", { name: /Ажлын талбарын хүн/ }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Вэбсайт" }))
    expect(
      screen.getByRole("heading", { name: /Ажлын талбарын хүн/ }),
    ).toBeInTheDocument()
  })

  // Утасны апп руу орж нэвтэрсний дараа веб хуудсанд буцаж байгааг шалгана.
  it("opens the mobile app and returns to the landing page", async () => {
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

    await user.click(screen.getByRole("button", { name: "Утас" }))
    expect(
      screen.getByRole("heading", { name: "Хэрэглэгчийн төрөл" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Өглөөний мэнд, Менежер" }),
      ).toBeInTheDocument(),
    )
    await user.click(screen.getByRole("button", { name: "Website" }))
    expect(
      screen.getByRole("heading", { name: /Ажлын талбарын хүн/ }),
    ).toBeInTheDocument()
  })
})
