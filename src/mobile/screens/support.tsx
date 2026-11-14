import { useState } from "react"
import { api, type DashboardResponse } from "../../lib/api"
import { fallbackDashboard, type Screen } from "../data"
import { Card, Header, Icon, MobilePage, StatusPill, icons } from "../ui"

export function SupportScreen({
  dashboard,
  onNavigate,
}: {
  dashboard: DashboardResponse
  onNavigate: (screen: Screen) => void
}) {
  const supportTeam = dashboard.supportTeam ?? fallbackDashboard.supportTeam
  const [isRequestSent, setIsRequestSent] = useState(false)
  const [requestError, setRequestError] = useState("")

  const handleSupportRequest = async () => {
    setRequestError("")
    try {
      await api.sendSupportRequest({
        message: "Яаралтай засвар, түгшүүртэй төхөөрөмжийн хяналт шаардлагатай",
        team: "tech-support",
      })
      setIsRequestSent(true)
    } catch (error) {
      setIsRequestSent(false)
      setRequestError(
        error instanceof Error
          ? error.message
          : "Тусламжийн хүсэлт илгээхэд алдаа гарлаа.",
      )
    }
  }

  return (
    <MobilePage current="support" onNavigate={onNavigate}>
      <Header
        onBack={() => onNavigate("anomaly")}
        subtitle="INCIDENT #A-8842"
        title="Тусламжийн хүсэлт"
      />
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="rounded-[10px] bg-[#101c25] p-4 text-white">
          <p className="text-[9px] text-[#91a0aa]">Яаралтай тусламж</p>
          <h2 className="mt-1 font-['Inter:Bold'] text-[15px] font-bold">
            Техникч, менежерт хүсэлт илгээх
          </h2>
          <div className="mt-3 flex gap-2">
            <StatusPill tone="blue">#4298</StatusPill>
            <StatusPill tone="gray">ӨНДӨР</StatusPill>
            <StatusPill tone="green">MQTT ONLINE</StatusPill>
          </div>
        </div>
        <button
          className="flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-[#d8463e] font-['Inter:Bold'] text-[11px] font-bold text-white"
          onClick={handleSupportRequest}
          type="button"
        >
          <Icon className="size-5 brightness-0 invert" src={icons.send} />
          {isRequestSent
            ? "Тусламж илгээгдлээ"
            : "Техникч, менежерт тусламж илгээх"}
        </button>
        {requestError && (
          <p
            className="rounded-lg bg-[#fff1f0] p-3 text-[10px] text-[#c53c36]"
            role="alert"
          >
            {requestError}
          </p>
        )}
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-['Inter:Bold'] text-[11px] font-bold">
              Хариу өгөх баг
            </h2>
            <span className="text-[8px] text-[#7b8992]">2 хүн</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {supportTeam.map((member, index) => (
              <div className="rounded-lg bg-[#f3f7f8] p-3" key={member.name}>
                <span
                  className={`mb-2 flex size-8 items-center justify-center rounded-full ${
                    index ? "bg-[#dff3e9]" : "bg-[#e2f1f7]"
                  }`}
                >
                  <Icon src={index ? icons.phone : icons.shield} />
                </span>
                <p className="text-[10px] font-bold">{member.name}</p>
                <p className="mt-1 text-[8px] text-[#74838d]">{member.role}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-3">
          <h2 className="font-['Inter:Bold'] text-[11px] font-bold">
            Хүсэлтийн явц
          </h2>
          <div className="mt-3 space-y-3">
            {[
              ["12:43", "AI anomaly илрүүлсэн"],
              ["12:44", "Push / SMS илгээгдсэн"],
              ["12:46", "Менежер хүлээн авсан"],
              ["12:48", "Техникч замд гарсан"],
            ].map(([time, event], index) => (
              <div className="flex gap-3" key={time}>
                <div className="flex flex-col items-center">
                  <span
                    className={`size-2 rounded-full ${
                      index === 3 ? "bg-[#1677a8]" : "bg-[#25a16d]"
                    }`}
                  />
                  {index < 3 && <span className="h-7 w-px bg-[#cbd6dc]" />}
                </div>
                <span className="w-10 font-['Roboto_Mono:Regular'] text-[8px] text-[#74838d]">
                  {time}
                </span>
                <span className="text-[9px]">{event}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="mt-auto p-3">
          <div className="flex items-center justify-between text-[9px]">
            <span>Илгээсэн байршил</span>
            <span className="font-['Roboto_Mono:Regular']">
              47.9184, 106.9177
            </span>
          </div>
        </Card>
      </div>
    </MobilePage>
  )
}
