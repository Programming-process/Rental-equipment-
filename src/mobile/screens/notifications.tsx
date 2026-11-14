import { useState } from "react"
import type { DashboardResponse } from "../../lib/api"
import { fallbackDashboard, type Screen } from "../data"
import { Card, Header, Icon, MobilePage, StatusPill, icons } from "../ui"

export function NotificationsScreen({
  dashboard,
  onNavigate,
}: {
  dashboard: DashboardResponse
  onNavigate: (screen: Screen) => void
}) {
  const [activeTab, setActiveTab] = useState<"alerts" | "history">("alerts")
  const notifications =
    dashboard.notifications ?? fallbackDashboard.notifications

  return (
    <MobilePage current="notifications" onNavigate={onNavigate}>
      <Header
        onBack={() => onNavigate("home")}
        subtitle={`${notifications.length} мэдэгдэл · 2 шинэ`}
        title="Мэдэгдэл ба түүх"
      />
      <div className="grid grid-cols-2 bg-white p-2">
        <button
          className={`rounded-lg py-2 text-[9px] ${
            activeTab === "alerts"
              ? "bg-[#e2f1f7] text-[#1677a8]"
              : "text-[#74838d]"
          }`}
          onClick={() => setActiveTab("alerts")}
          type="button"
        >
          Мэдэгдэл · 7
        </button>
        <button
          className={`py-2 text-[9px] ${
            activeTab === "history"
              ? "bg-[#eef2f4] text-[#14212a]"
              : "text-[#74838d]"
          }`}
          onClick={() => setActiveTab("history")}
          type="button"
        >
          Түрээсийн түүх
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {activeTab === "history" ? (
          <Card>
            {[
              ["Өрмийн машин D45", "Захиалга батлагдсан", "blue"],
              ["Check-out амжилттай", "Өнөөдөр · 09:28", "green"],
              ["Менежер баталсан", "Өнөөдөр · 11:41", "green"],
              ["Check-in хугацаа ойртлоо", "Өнөөдөр · 12:46", "orange"],
            ].map(([title, meta, tone], index) => (
              <button
                className="flex w-full items-start gap-3 border-b border-[#edf1f3] p-3 text-left last:border-0"
                key={title}
                onClick={() =>
                  index === 0
                    ? onNavigate("detail")
                    : index === 3
                      ? onNavigate("checkin")
                      : undefined
                }
                type="button"
              >
                <span
                  className={`mt-1 size-2 shrink-0 rounded-full ${
                    tone === "green"
                      ? "bg-[#25a16d]"
                      : tone === "orange"
                        ? "bg-[#e2a13b]"
                        : "bg-[#1677a8]"
                  }`}
                />
                <span className="flex-1">
                  <span className="block text-[10px] font-bold">{title}</span>
                  <span className="mt-1 block text-[8px] text-[#798791]">
                    {meta}
                  </span>
                </span>
                <Icon className="mt-1 size-3" src={icons.chevron} />
              </button>
            ))}
          </Card>
        ) : (
          <>
            <div>
              <p className="mb-2 text-[9px] font-bold text-[#6d7d87]">
                Өнөөдөр
              </p>
              {notifications.slice(0, 2).map((item) => (
                <button
                  className="mb-2 flex w-full gap-3 rounded-[10px] border border-[#e98781] bg-[#fff1f0] p-3 text-left last:mb-0"
                  key={item.id}
                  onClick={() =>
                    onNavigate(item.type === "alert" ? "anomaly" : "detail")
                  }
                  type="button"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#d8463e]">
                    <Icon
                      className="size-5 brightness-0 invert"
                      src={
                        item.type === "calendar" ? icons.calendar : icons.alert
                      }
                    />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[10px] font-bold">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-[8px] text-[#8a5b58]">
                      {item.meta}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-[9px] font-bold text-[#6d7d87]">
                Түрээсийн үйл явц
              </p>
              <Card>
                {[
                  ["Өрмийн машин D45", "Захиалга батлагдсан", "blue"],
                  ["Check-out амжилттай", "Өнөөдөр · 09:28", "green"],
                  ["Менежер баталсан", "Өнөөдөр · 11:41", "green"],
                  ["Check-in хугацаа ойртлоо", "Өнөөдөр · 12:46", "orange"],
                ].map(([title, meta, tone], index) => (
                  <button
                    className="flex w-full items-start gap-3 border-b border-[#edf1f3] p-3 text-left last:border-0"
                    key={title}
                    onClick={() =>
                      index === 0
                        ? onNavigate("detail")
                        : index === 3
                          ? onNavigate("checkin")
                          : undefined
                    }
                    type="button"
                  >
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full ${
                        tone === "green"
                          ? "bg-[#25a16d]"
                          : tone === "orange"
                            ? "bg-[#e2a13b]"
                            : "bg-[#1677a8]"
                      }`}
                    />
                    <span className="flex-1">
                      <span className="block text-[10px] font-bold">
                        {title}
                      </span>
                      <span className="mt-1 block text-[8px] text-[#798791]">
                        {meta}
                      </span>
                    </span>
                    <Icon className="mt-1 size-3" src={icons.chevron} />
                  </button>
                ))}
              </Card>
            </div>

            <div>
              <p className="mb-2 text-[9px] font-bold text-[#6d7d87]">
                Системийн төлөв
              </p>
              <Card>
                {[
                  ["Гар багаж / багц", "Бэлэн"],
                  ["Дизель насос 25к", "Анхаарах"],
                ].map(([title, status], index) => (
                  <div
                    className="flex items-center gap-3 border-b border-[#edf1f3] p-3 last:border-0"
                    key={title}
                  >
                    <Icon className="size-4" src={icons.truck} />
                    <span className="flex-1 text-[10px]">{title}</span>
                    <StatusPill tone={index ? "orange" : "green"}>
                      {status}
                    </StatusPill>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}
      </div>
    </MobilePage>
  )
}
