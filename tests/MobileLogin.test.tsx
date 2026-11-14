import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { api } from "../src/lib/api"
import MobileLogin from "../src/MobileLogin"

const loginResult = {
  message: "Welcome",
  user: {
    id: "renter-99128044",
    role: "renter" as const,
    phone: "99128044",
    name: "Renter",
    company: "Example Co",
  },
  session: {
    token: "session-token",
    role: "renter" as const,
    expiresAt: "2026-11-13T10:00:00.000Z",
  },
}

afterEach(() => {
  cleanup()
})

// Нэвтрэх дэлгэцийн хэрэглэгчийн сонголт, хүсэлт, алдааны төлөвийг шалгана.
describe("MobileLogin", () => {
  // Эрхийн төрөл сонгох болон утасны дугаарыг зөвхөн тоогоор илгээхийг шалгана.
  it("selects a role, normalizes the phone number, and calls onLogin", async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    const login = vi.spyOn(api, "login").mockResolvedValue(loginResult)

    render(<MobileLogin onLogin={onLogin} />)
    await user.click(screen.getByRole("button", { name: /Түрээслэгч/ }))
    await user.clear(screen.getByRole("textbox", { name: "Утасны дугаар" }))
    await user.type(
      screen.getByRole("textbox", { name: "Утасны дугаар" }),
      "9912-8044",
    )
    await user.click(
      screen.getByRole("button", { name: "Түрээслэгчээр нэвтрэх" }),
    )

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(loginResult))
    expect(login).toHaveBeenCalledWith({
      role: "renter",
      phone: "99128044",
      code: "123456",
    })
  })

  // Нэвтрэлт амжилтгүй болоход серверийн алдааг харуулж, товчийг дахин идэвхжүүлнэ.
  it("shows login failures and re-enables submit", async () => {
    const user = userEvent.setup()
    vi.spyOn(api, "login").mockRejectedValue(new Error("Invalid credentials"))

    render(<MobileLogin />)
    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Менежерээр нэвтрэх" }),
    ).toBeEnabled()
  })

  // Стандарт бус алдааны утга ирэхэд хэрэглэгчид ерөнхий тайлбар харуулна.
  it("shows a generic message when login rejects with a non-Error value", async () => {
    const user = userEvent.setup()
    vi.spyOn(api, "login").mockRejectedValue("network unavailable")

    render(<MobileLogin />)
    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))

    expect(
      await screen.findByText("Нэвтрэх үед алдаа гарлаа."),
    ).toBeInTheDocument()
  })

  // Дахин оролдоод нэвтэрвэл өмнөх алдааны мессеж арилсныг шалгана.
  it("clears a previous error after a later login succeeds", async () => {
    const user = userEvent.setup()
    const login = vi
      .spyOn(api, "login")
      .mockRejectedValueOnce(new Error("Try again"))
      .mockResolvedValueOnce(loginResult)
    const onLogin = vi.fn()

    render(<MobileLogin onLogin={onLogin} />)
    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))
    expect(await screen.findByText("Try again")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(loginResult))
    expect(screen.queryByText("Try again")).not.toBeInTheDocument()
    expect(login).toHaveBeenCalledTimes(2)
  })

  // Хүсэлт явж байх үед давхар илгээхээс сэргийлж товчийг идэвхгүй болгоно.
  it("disables submit while login is in progress", async () => {
    const user = userEvent.setup()
    vi.spyOn(api, "login").mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(loginResult), 50)
        }),
    )

    render(<MobileLogin />)
    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))

    expect(
      screen.getByRole("button", { name: "Нэвтэрч байна..." }),
    ).toBeDisabled()
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Менежерээр нэвтрэх" }),
      ).toBeEnabled(),
    )
  })

  // Нэмэлт callback дамжуулаагүй үед компонент алдаагүй ажиллахыг шалгана.
  it("allows login without an optional onLogin callback", async () => {
    const user = userEvent.setup()
    const login = vi.spyOn(api, "login").mockResolvedValue(loginResult)

    render(<MobileLogin />)
    await user.click(screen.getByRole("button", { name: "Менежерээр нэвтрэх" }))

    await waitFor(() => expect(login).toHaveBeenCalledOnce())
    expect(
      screen.getByRole("button", { name: "Менежерээр нэвтрэх" }),
    ).toBeEnabled()
  })

  // Нэвтрэх кодыг нуух болон ил гаргах үйлдэл, утгын өөрчлөлтийг шалгана.
  it("toggles the login code visibility", () => {
    render(<MobileLogin />)
    const code = screen.getByLabelText("Нэвтрэх код")

    expect(code).toHaveAttribute("type", "password")
    fireEvent.change(code, { target: { value: "654321" } })
    expect(code).toHaveValue("654321")
    fireEvent.click(screen.getByRole("button", { name: "Код харуулах" }))
    expect(code).toHaveAttribute("type", "text")
    expect(screen.getByRole("button", { name: "Код нуух" })).toBeInTheDocument()
  })
})
