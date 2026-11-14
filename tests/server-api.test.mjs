import assert from "node:assert/strict"
import { once } from "node:events"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { after, before, describe, it } from "node:test"

let server
let baseUrl
let serverOutput = ""

const getAvailablePort = async () => {
  const listener = createServer()
  listener.listen(0, "127.0.0.1")
  await once(listener, "listening")
  const { port } = listener.address()
  await new Promise((resolve, reject) =>
    listener.close((error) => (error ? reject(error) : resolve())),
  )
  return port
}

const waitForServer = async (url, timeoutMs = 10000) => {
  const started = Date.now()

  while (Date.now() - started < timeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`Backend exited before becoming ready:\n${serverOutput}`)
    }

    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // Сервер асахыг хүлээх зуур холболтын алдааг дахин оролдоно.
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error(`Timed out waiting for ${url}:\n${serverOutput}`)
}

const requestJson = async (route, options) => {
  const response = await fetch(`${baseUrl}${route}`, options)
  const data = await response.json()
  return { response, data }
}

const jsonRequest = (body) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

describe("Ops API", { concurrency: false }, () => {
  before(async () => {
    const port = await getAvailablePort()
    baseUrl = `http://127.0.0.1:${port}`
    server = spawn("node", ["server/index.mjs"], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    })
    server.stdout.setEncoding("utf8").on("data", (chunk) => {
      serverOutput += chunk
    })
    server.stderr.setEncoding("utf8").on("data", (chunk) => {
      serverOutput += chunk
    })

    await waitForServer(`${baseUrl}/api/health`)
  })

  after(async () => {
    if (!server || server.exitCode !== null) return
    server.kill("SIGTERM")
    await once(server, "exit")
  })

  it("returns the health response with a valid timestamp", async () => {
    const { response, data } = await requestJson("/api/health")

    assert.equal(response.status, 200)
    assert.equal(data.status, "ok")
    assert.equal(data.service, "ops-backend")
    assert.ok(Number.isFinite(Date.parse(data.time)))
  })

  // Дэмжигдсэн эрхүүд болон хуучин tenant нэрийн шинэчлэлтийг шалгана.
  for (const [role, expectedRole] of [
    ["employee", "employee"],
    ["manager", "manager"],
    ["fixer", "fixer"],
    ["renter", "renter"],
    ["tenant", "renter"],
  ]) {
    it(`logs in with ${role} role and returns a matching session`, async () => {
      const { response, data } = await requestJson(
        "/api/auth/login",
        jsonRequest({ role, phone: "99128044", code: "123456" }),
      )

      assert.equal(response.status, 200)
      assert.equal(data.user.role, expectedRole)
      assert.equal(data.session.role, expectedRole)
      assert.equal(data.user.phone, "99128044")
      assert.equal(data.user.id, `${expectedRole}-99128044`)
      assert.equal(data.message, "Амжилттай нэвтэрлээ")
    })
  }

  // Утасны дугаарын нийтлэг бичилтүүд цифрүүдийг зөв хэвшүүлж байгааг шалгана.
  for (const phone of [
    "99128044",
    "+976 9912 8044",
    "+976-9912-8044",
    "(976) 9912-8044",
    "976.9912.8044",
    " 9912 8044 ",
    "00976/9912/8044",
    "+(976) 9912-8044",
  ]) {
    it(`normalizes phone formatting: ${phone}`, async () => {
      const { response, data } = await requestJson(
        "/api/auth/login",
        jsonRequest({ role: "employee", phone, code: "123456" }),
      )

      const normalizedPhone = phone.replace(/\D/g, "")
      assert.equal(response.status, 200)
      assert.equal(data.user.phone, normalizedPhone)
      assert.equal(data.user.id, `employee-${normalizedPhone}`)
    })
  }

  // Буруу код эсвэл долоон цифр хүрэхгүй дугаараар нэвтрэхийг хориглоно.
  for (const [name, credentials] of [
    ["incorrect code", { role: "employee", phone: "99128044", code: "000000" }],
    ["empty code", { role: "employee", phone: "99128044", code: "" }],
    ["numeric code", { role: "employee", phone: "99128044", code: 123456 }],
    ["six-digit phone", { role: "employee", phone: "123456", code: "123456" }],
    ["empty phone", { role: "employee", phone: "", code: "123456" }],
    [
      "non-numeric phone",
      { role: "employee", phone: "abcdefgh", code: "123456" },
    ],
    ["null phone", { role: "employee", phone: null, code: "123456" }],
  ]) {
    it(`rejects login with ${name}`, async () => {
      const { response, data } = await requestJson(
        "/api/auth/login",
        jsonRequest(credentials),
      )

      assert.equal(response.status, 401)
      assert.deepEqual(data, { message: "Нэвтрэх мэдээлэл буруу байна." })
    })
  }

  // Хүсэлтийн талбарууд эсвэл бүхэлдээ бие орхигдсон үед үндсэн утга хэрэглэнэ.
  for (const [name, options] of [
    ["empty object", jsonRequest({})],
    ["missing body", { method: "POST" }],
  ]) {
    it(`uses login defaults for ${name}`, async () => {
      const { response, data } = await requestJson("/api/auth/login", options)

      assert.equal(response.status, 200)
      assert.equal(data.user.role, "employee")
      assert.equal(data.user.phone, "99128044")
      assert.equal(data.session.role, "employee")
    })
  }

  it("uses the default phone number when it is omitted", async () => {
    const { response, data } = await requestJson(
      "/api/auth/login",
      jsonRequest({ role: "employee", code: "123456" }),
    )

    assert.equal(response.status, 200)
    assert.equal(data.user.phone, "99128044")
  })

  it("returns a 36-character hexadecimal token and an expiry one hour ahead", async () => {
    const beforeLogin = Date.now()
    const { response, data } = await requestJson(
      "/api/auth/login",
      jsonRequest({ role: "manager", phone: "99128044", code: "123456" }),
    )
    const afterLogin = Date.now()
    const expiresAt = Date.parse(data.session.expiresAt)

    assert.equal(response.status, 200)
    assert.match(data.session.token, /^[a-f0-9]{36}$/)
    assert.ok(expiresAt >= beforeLogin + 60 * 60 * 1000)
    assert.ok(expiresAt <= afterLogin + 60 * 60 * 1000)
  })

  it("creates a fresh session token for each successful login", async () => {
    const credentials = jsonRequest({
      role: "manager",
      phone: "99128044",
      code: "123456",
    })
    const first = await requestJson("/api/auth/login", credentials)
    const second = await requestJson("/api/auth/login", credentials)

    assert.equal(first.response.status, 200)
    assert.equal(second.response.status, 200)
    assert.notEqual(first.data.session.token, second.data.session.token)
  })

  it("uses the renter-specific display name and company", async () => {
    const { data } = await requestJson(
      "/api/auth/login",
      jsonRequest({ role: "tenant", phone: "99128044", code: "123456" }),
    )

    assert.equal(data.user.name, "Хөх Тэнгэр ХХК")
    assert.equal(data.user.company, "Монкон ХХК")
  })

  it("uses the standard display name and company for non-renter roles", async () => {
    const { data } = await requestJson(
      "/api/auth/login",
      jsonRequest({ role: "manager", phone: "99128044", code: "123456" }),
    )

    assert.equal(data.user.name, "Тэмүүлэн")
    assert.equal(data.user.company, "Талбай 12")
  })

  it("returns the complete equipment list with unique identifiers", async () => {
    const { response, data } = await requestJson("/api/equipment")
    const ids = data.map((item) => item.id)

    assert.equal(response.status, 200)
    assert.equal(data.length, 5)
    assert.equal(new Set(ids).size, ids.length)
    for (const item of data) {
      assert.ok(item.id)
      assert.ok(item.name)
      assert.ok(item.model)
      assert.ok(item.status)
      assert.ok(item.location)
      assert.ok(item.telemetry)
      assert.equal(typeof item.live, "boolean")
    }
  })

  // Жагсаалтад буй төхөөрөмж бүрийн дэлгэрэнгүй API тухайн бичлэгийг яг буцаана.
  const equipmentIds = [
    "DRL-UB-0247",
    "GEN-0162",
    "MIX-4993",
    "EXC-0914",
    "TLS-1318",
  ]
  for (const id of equipmentIds) {
    it(`returns equipment details matching the list for ${id}`, async () => {
      const list = await requestJson("/api/equipment")
      const detail = await requestJson(`/api/equipment/${id}`)
      const listedItem = list.data.find((item) => item.id === id)

      assert.equal(detail.response.status, 200)
      assert.ok(listedItem)
      assert.deepEqual(detail.data, listedItem)
    })
  }

  // Хоосон болон үл мэдэгдэх ID-гаар төхөөрөмж хайхад 404 буцаана.
  for (const id of ["not-found", "UNKNOWN-0000"]) {
    it(`returns a localized 404 for unknown equipment ${id}`, async () => {
      const { response, data } = await requestJson(`/api/equipment/${id}`)

      assert.equal(response.status, 404)
      assert.deepEqual(data, { message: "Төхөөрөмж олдсонгүй" })
    })
  }

  it("returns dashboard collections consistent with their dedicated endpoints", async () => {
    const dashboard = await requestJson("/api/dashboard")
    const equipment = await requestJson("/api/equipment")
    const alerts = await requestJson("/api/alerts")
    const notifications = await requestJson("/api/notifications")

    assert.equal(dashboard.response.status, 200)
    assert.deepEqual(dashboard.data.equipment, equipment.data)
    assert.deepEqual(dashboard.data.alerts, alerts.data)
    assert.deepEqual(dashboard.data.notifications, notifications.data)
    assert.ok(dashboard.data.summary.totalEquipment >= equipment.data.length)
    assert.ok(dashboard.data.summary.alerts >= alerts.data.length)
    assert.ok(dashboard.data.supportTeam.length > 0)
  })

  it("returns dashboard summary fields with expected value types", async () => {
    const { data } = await requestJson("/api/dashboard")
    const { summary } = data

    assert.equal(typeof summary.totalEquipment, "number")
    assert.equal(typeof summary.rentedToday, "number")
    assert.equal(typeof summary.alerts, "number")
    assert.equal(typeof summary.syncSecondsAgo, "string")
    assert.equal(typeof summary.siteName, "string")
    assert.ok(summary.totalEquipment >= 0)
    assert.ok(summary.rentedToday >= 0)
    assert.ok(summary.alerts >= 0)
  })

  it("returns alerts with unique IDs and valid equipment references", async () => {
    const [alertsResult, equipmentResult] = await Promise.all([
      requestJson("/api/alerts"),
      requestJson("/api/equipment"),
    ])
    const ids = alertsResult.data.map((alert) => alert.id)
    const equipmentIds = new Set(equipmentResult.data.map((item) => item.id))

    assert.equal(alertsResult.response.status, 200)
    assert.equal(new Set(ids).size, ids.length)
    for (const alert of alertsResult.data) {
      assert.ok(alert.title)
      assert.ok(equipmentIds.has(alert.equipmentId))
      assert.ok(["high", "warning", "medium", "low"].includes(alert.severity))
      assert.ok(Number.parseFloat(alert.risk) >= 0)
      assert.ok(alert.description)
      assert.ok(alert.location)
    }
  })

  it("returns notifications with unique IDs and supported types", async () => {
    const { response, data } = await requestJson("/api/notifications")
    const ids = data.map((notification) => notification.id)

    assert.equal(response.status, 200)
    assert.equal(new Set(ids).size, ids.length)
    assert.equal(data.length, 4)
    for (const notification of data) {
      assert.ok(notification.title)
      assert.ok(notification.meta)
      assert.ok(notification.createdAt)
      assert.ok(
        ["alert", "calendar", "success", "warning"].includes(notification.type),
      )
    }
  })

  it("accepts a support request and returns its submitted fields", async () => {
    const requestBody = {
      message: "Төхөөрөмжийн тусламж хэрэгтэй",
      team: "tech-support",
    }
    const { response, data } = await requestJson(
      "/api/support",
      jsonRequest(requestBody),
    )

    assert.equal(response.status, 200)
    assert.equal(data.ok, true)
    assert.equal(data.message, requestBody.message)
    assert.equal(data.team, requestBody.team)
    assert.equal(data.ticketId, "A-8842")
    assert.ok(Number.isFinite(Date.parse(data.updatedAt)))
  })

  // Тусламжийн хүсэлтэд нэг талбар орхигдоход нөгөөг хадгалж, үндсэн утга хэрэглэнэ.
  for (const [name, body, expectedMessage, expectedTeam] of [
    ["empty object", {}, "Тусламжийн хүсэлт илгээгдлээ", "support"],
    [
      "missing message",
      { team: "maintenance" },
      "Тусламжийн хүсэлт илгээгдлээ",
      "maintenance",
    ],
    [
      "missing team",
      { message: "Need a technician" },
      "Need a technician",
      "support",
    ],
    ["empty message", { message: "", team: "support" }, "", "support"],
    ["empty team", { message: "Need help", team: "" }, "Need help", ""],
  ]) {
    it(`handles support defaults for ${name}`, async () => {
      const { response, data } = await requestJson(
        "/api/support",
        jsonRequest(body),
      )

      assert.equal(response.status, 200)
      assert.equal(data.ok, true)
      assert.equal(data.message, expectedMessage)
      assert.equal(data.team, expectedTeam)
      assert.equal(data.ticketId, "A-8842")
    })
  }

  it("rejects a primitive JSON body through the JSON parser", async () => {
    const response = await fetch(`${baseUrl}/api/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "null",
    })

    assert.equal(response.status, 400)
  })

  it("returns JSON content type for API responses", async () => {
    const response = await fetch(`${baseUrl}/api/health`)

    assert.match(response.headers.get("content-type"), /application\/json/)
  })

  it("does not expose the Express signature header", async () => {
    const response = await fetch(`${baseUrl}/api/health`)

    assert.equal(response.headers.get("x-powered-by"), null)
  })

  it("returns 404 for an unknown API route", async () => {
    const response = await fetch(`${baseUrl}/api/not-a-route`)

    assert.equal(response.status, 404)
  })
})
