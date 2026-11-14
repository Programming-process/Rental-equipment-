import { afterEach, describe, expect, it, vi } from "vitest"
import { api } from "../src/lib/api"

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

// API клиент хүсэлтийг зөв зам, арга, толгой болон өгөгдөлтэй илгээж байгааг шалгана.
describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // API-ийн бүх функц зөв HTTP хүсэлт үүсгэж байгааг нэг бүрчлэн шалгана.
  it.each([
    ["health", () => api.health(), "/api/health", "GET", undefined],
    [
      "register",
      () =>
        api.register({
          name: "Test User",
          company: "Example Co",
          phone: "99128044",
          email: "test@example.com",
          password: "secure-password",
        }),
      "/api/auth/register/request-code",
      "POST",
      {
        name: "Test User",
        company: "Example Co",
        phone: "99128044",
        email: "test@example.com",
        password: "secure-password",
      },
    ],
    [
      "verify registration code",
      () =>
        api.verifyRegistrationCode({
          email: "test@example.com",
          code: "123456",
        }),
      "/api/auth/register/verify-code",
      "POST",
      { email: "test@example.com", code: "123456" },
    ],
    [
      "login",
      () =>
        api.login({
          role: "renter",
          email: "test@example.com",
          password: "secure-password",
        }),
      "/api/auth/login",
      "POST",
      {
        role: "renter",
        email: "test@example.com",
        password: "secure-password",
      },
    ],
    [
      "forgot password",
      () => api.forgotPassword({ email: "test@example.com" }),
      "/api/auth/forgot-password",
      "POST",
      { email: "test@example.com" },
    ],
    [
      "reset password",
      () =>
        api.resetPassword({
          email: "test@example.com",
          code: "123456",
          password: "new-password",
        }),
      "/api/auth/reset-password",
      "POST",
      {
        email: "test@example.com",
        code: "123456",
        password: "new-password",
      },
    ],
    ["dashboard", () => api.getDashboard(), "/api/dashboard", "GET", undefined],
    ["equipment", () => api.getEquipment(), "/api/equipment", "GET", undefined],
    [
      "equipment by id",
      () => api.getEquipmentById("DRL-UB-0247"),
      "/api/equipment/DRL-UB-0247",
      "GET",
      undefined,
    ],
    [
      "notifications",
      () => api.getNotifications(),
      "/api/notifications",
      "GET",
      undefined,
    ],
    ["alerts", () => api.getAlerts(), "/api/alerts", "GET", undefined],
    [
      "support request",
      () => api.sendSupportRequest({ message: "Help", team: "support" }),
      "/api/support",
      "POST",
      { message: "Help", team: "support" },
    ],
  ])(
    "sends the expected request for %s",
    async (_name, invoke, url, method, body) => {
      const fetchMock = vi.fn().mockResolvedValue(response({ ok: true }))
      vi.stubGlobal("fetch", fetchMock)

      await invoke()

      expect(fetchMock).toHaveBeenCalledOnce()
      const [requestUrl, requestInit] = fetchMock.mock.calls[0]
      expect(requestUrl).toBe(url)
      expect(requestInit?.method ?? "GET").toBe(method)
      expect(new Headers(requestInit?.headers).get("Content-Type")).toBe(
        "application/json",
      )
      expect(requestInit?.body).toBe(body ? JSON.stringify(body) : undefined)
    },
  )

  // Сервер алдаа буцаахад клиент хариуны мэдээллийг алдаа болгон дамжуулна.
  it("throws the response body for failed requests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ message: "Denied" }, 401)),
    )

    await expect(api.health()).rejects.toThrow('{"message":"Denied"}')
  })

  // Алдааны хариу хоосон үед ойлгомжтой ерөнхий алдааны мессеж хэрэглэнэ.
  it("uses a fallback error when a failed response has no body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
        new Response("", {
          status: 500,
          statusText: "Internal Server Error",
        }),
      ))

    await expect(api.health()).rejects.toThrow("Request failed")
  })
})
