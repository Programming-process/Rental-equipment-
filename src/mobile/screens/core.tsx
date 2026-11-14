import { useMemo, useState } from "react"
import type { DashboardResponse, UserRole } from "../../lib/api"
import { fallbackDashboard, type Screen } from "../data"
import {
  Card,
  Header,
  Icon,
  MobilePage,
  StatusPill,
  equipmentPhoto,
  icons,
} from "../ui"

export function HomeScreen({
  dashboard,
  onNavigate,
  onSignOut,
  onBackToWebsite,
  role,
}: {
  dashboard: DashboardResponse
  onNavigate: (screen: Screen) => void
  onSignOut: () => void
  onBackToWebsite?: () => void
  role: UserRole
}) {
  const summary = dashboard.summary
  const roleLabel =
    role === "manager" ? "Менежер" : role === "fixer" ? "Фиксер" : "Түрээслэгч"
  const roleGreeting =
    role === "manager"
      ? "Тайлангийн тойм"
      : role === "fixer"
        ? "Ажлын тасалбар"
        : "Түрээслэх бүртгэл"

  return (
    <MobilePage current="home" onNavigate={onNavigate}>
      <Header
        action={
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-[#dce4e8] bg-[#f8fafb] px-2 py-1 font-['Inter:Bold'] text-[9px] font-bold text-[#42515d]"
              onClick={() => onNavigate("home")}
              type="button"
            >
              Буцах
            </button>
            {onBackToWebsite && (
              <button
                className="rounded-full border border-[#dce4e8] bg-[#edf7ff] px-2 py-1 font-['Inter:Bold'] text-[9px] font-bold text-[#1677a8]"
                onClick={onBackToWebsite}
                type="button"
              >
                Website
              </button>
            )}
            <button
              className="rounded-full border border-[#dce4e8] bg-[#f3f7f8] px-2 py-1 font-['Inter:Bold'] text-[9px] font-bold text-[#42515d]"
              onClick={onSignOut}
              type="button"
            >
              Гарах
            </button>
            <button
              aria-label="Мэдэгдэл"
              className="relative flex size-9 items-center justify-center rounded-full bg-[#f2f5f7]"
              onClick={() => onNavigate("notifications")}
              type="button"
            >
              <Icon src={icons.bell} />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#df453e]" />
            </button>
          </div>
        }
        subtitle="2026.10.04 · Талбай 12"
        title={`Өглөөний мэнд, ${roleLabel}`}
      />
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            [String(summary.rentedToday), "Түрээстэй"],
            [String(summary.totalEquipment), "Нийт"],
            [String(summary.alerts), "Анхаарах"],
          ].map(([value, label], index) => (
            <Card
              className={`p-3 ${
                index === 2 ? "border-[#e98b86] bg-[#fff3f2]" : ""
              }`}
              key={label}
            >
              <p className="font-['Roboto_Mono:Bold'] text-[22px] font-bold">
                {value}
              </p>
              <p className="mt-1 text-[9px] text-[#6c7c87]">{label}</p>
            </Card>
          ))}
        </div>

        <button
          className="rounded-[10px] border border-[#e7847e] bg-[#fff3f2] p-3 text-left"
          onClick={() => onNavigate("anomaly")}
          type="button"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#d8463e]">
              <Icon className="size-5 brightness-0 invert" src={icons.alert} />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-['Inter:Bold'] text-[12px] font-bold">
                  {dashboard.alerts[0]?.title ?? "Бетон зуурагчийн температур"}
                </p>
                <span className="font-['Roboto_Mono:Bold'] text-[11px] font-bold text-[#d8463e]">
                  {dashboard.alerts[0]?.risk ?? "93.4%"}
                </span>
              </div>
              <p className="mt-1 text-[9px] text-[#8a5c59]">
                {dashboard.alerts[0]?.equipmentId ?? "MIX-4993"} ·{" "}
                {dashboard.alerts[0]?.description ?? "96.2°C · Талбай 12"}
              </p>
            </div>
          </div>
        </button>

        <Card>
          <div className="flex items-center justify-between border-b border-[#e4eaed] p-3">
            <h2 className="font-['Inter:Bold'] text-[12px] font-bold">
              Дараагийн ажлууд
            </h2>
            <span className="text-[9px] text-[#7c8a93]">3 ажил</span>
          </div>
          {[
            ["13:10", "Генератор check-out", "Өнөөдөр"],
            ["14:30", "Өрмийн машин буцаалт", "Хүлээгдэж"],
            ["16:00", "Багаж шалгах", "Дараа"],
          ].map(([time, title, state]) => (
            <div
              className="flex items-center gap-3 border-b border-[#edf1f3] p-3 last:border-0"
              key={time}
            >
              <span className="font-['Roboto_Mono:Bold'] text-[11px] font-bold">
                {time}
              </span>
              <p className="flex-1 text-[11px]">{title}</p>
              <span className="text-[8px] text-[#758690]">{state}</span>
            </div>
          ))}
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="flex h-[64px] items-center gap-3 rounded-[10px] bg-[#e2f1f7] p-3 text-left"
            onClick={() =>
              onNavigate(role === "fixer" ? "scanner" : "equipment")
            }
            type="button"
          >
            <Icon className="size-6" src={icons.qr} />
            <span className="font-['Inter:Bold'] text-[11px] font-bold">
              {role === "fixer" ? "QR уншуулах" : "Төхөөрөмжийн жагсаалт"}
            </span>
          </button>
          <button
            className="flex h-[64px] items-center gap-3 rounded-[10px] bg-white p-3 text-left"
            onClick={() =>
              onNavigate(role === "fixer" ? "support" : "notifications")
            }
            type="button"
          >
            <Icon className="size-6" src={icons.send} />
            <span className="font-['Inter:Bold'] text-[11px] font-bold">
              {role === "fixer" ? "Тусламж" : "Мэдэгдэл"}
            </span>
          </button>
        </div>

        <div className="rounded-[10px] border border-[#dce4e8] bg-white p-3">
          <p className="font-['Inter:Bold'] text-[10px] font-bold text-[#6c7c87]">
            {roleGreeting}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-['Inter:Bold'] text-[12px] font-bold text-[#14212a]">
              {role === "manager"
                ? "Бүртгэл, тайлан, даалгавар"
                : role === "fixer"
                  ? "Засвар, QR, telemetry"
                  : "Гэрээ, төлбөр, түрээсийн хяналт"}
            </span>
            <button
              className="rounded-full bg-[#1677a8] px-2.5 py-1 text-[9px] font-bold text-white"
              onClick={() =>
                onNavigate(role === "fixer" ? "detail" : "notifications")
              }
              type="button"
            >
              Үргэлжлүүлэх
            </button>
          </div>
        </div>
      </div>
    </MobilePage>
  )
}

export function EquipmentScreen({
  dashboard,
  onNavigate,
}: {
  dashboard: DashboardResponse
  onNavigate: (screen: Screen) => void
}) {
  const [activeFilter, setActiveFilter] =
    useState<"all" | "ready" | "rented" | "alert">("all")
  const equipment = dashboard.equipment ?? fallbackDashboard.equipment

  const filteredEquipment = useMemo(() => {
    if (activeFilter === "all") {
      return equipment
    }

    return equipment.filter((item) => {
      if (activeFilter === "ready") {
        return item.status === "Бэлэн"
      }
      if (activeFilter === "rented") {
        return item.status === "Түрээстэй"
      }
      return item.status === "Анхаарах" || item.status === "Засварт"
    })
  }, [activeFilter, equipment])

  return (
    <MobilePage current="equipment" onNavigate={onNavigate}>
      <Header
        onBack={() => onNavigate("home")}
        subtitle={`${dashboard.summary.totalEquipment} төхөөрөмж · 4 талбай`}
        title="Тоног төхөөрөмж"
      />
      <div className="flex gap-2 overflow-x-auto bg-white px-3 py-2">
        {[
          { id: "all", label: "Бүгд 128" },
          { id: "ready", label: "Бэлэн 30" },
          { id: "rented", label: "Түрээстэй 76" },
          { id: "alert", label: "Анхаарах 9" },
        ].map((filter) => (
          <button
            className={`rounded-full px-3 py-1.5 text-[9px] whitespace-nowrap ${
              activeFilter === filter.id
                ? "bg-[#14212a] text-white"
                : "bg-[#eef2f4] text-[#5d6e79]"
            }`}
            key={filter.id}
            onClick={() =>
              setActiveFilter(filter.id as "all" | "ready" | "rented" | "alert")
            }
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {filteredEquipment.map((item, index) => (
          <button
            className="flex w-full items-center gap-3 rounded-[10px] border border-[#dce4e8] bg-white p-3 text-left"
            key={item.meta}
            onClick={() => onNavigate("detail")}
            type="button"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#edf6f9]">
              <Icon className="size-5" src={icons.truck} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-['Inter:Bold'] text-[11px] font-bold">
                {item.name}
              </span>
              <span className="mt-1 block font-['Roboto_Mono:Regular'] text-[8px] text-[#7b8992]">
                {item.meta}
              </span>
            </span>
            <StatusPill
              tone={
                index === 0
                  ? "blue"
                  : index === 2
                    ? "orange"
                    : index === 3
                      ? "gray"
                      : "green"
              }
            >
              {item.status}
            </StatusPill>
          </button>
        ))}
      </div>
    </MobilePage>
  )
}

export function DetailScreen({
  dashboard,
  onNavigate,
}: {
  dashboard: DashboardResponse
  onNavigate: (screen: Screen) => void
}) {
  const primaryEquipment =
    dashboard.equipment[0] ?? fallbackDashboard.equipment[0]

  return (
    <MobilePage current="detail" onNavigate={onNavigate}>
      <Header
        onBack={() => onNavigate("equipment")}
        subtitle={primaryEquipment?.meta ?? "DRL-UB-0247"}
        title={primaryEquipment?.name ?? "Өрмийн машин D45"}
      />
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="relative h-[180px] overflow-hidden rounded-[10px] bg-[#c7d2d8]">
          <img
            alt={primaryEquipment?.name ?? "Өрмийн машин D45"}
            className="h-full w-full object-cover"
            src={equipmentPhoto}
          />
          <span className="absolute bottom-3 left-3">
            <StatusPill tone="blue">ТҮРЭЭСТЭЙ</StatusPill>
          </span>
          <button
            aria-label="QR уншуулах"
            className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-lg bg-white"
            onClick={() => onNavigate("scanner")}
            type="button"
          >
            <Icon className="size-6" src={icons.qr} />
          </button>
        </div>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-['Roboto_Mono:Bold'] text-[15px] font-bold">
                {primaryEquipment?.meta ?? "DRL-UB-0247"}
              </p>
              <p className="mt-1 text-[9px] text-[#74838d]">
                {primaryEquipment?.model ?? "Atlas Copco D45"}
              </p>
            </div>
            <StatusPill tone={primaryEquipment?.live ? "green" : "gray"}>
              {primaryEquipment?.live ? "MQTT LIVE" : "OFFLINE"}
            </StatusPill>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#e4eaed] pt-3">
            {[
              ["Байршил", primaryEquipment?.location ?? "Нарны зам · Блок B"],
              ["Хариуцагч", primaryEquipment?.assignee ?? "Б. Бат"],
              ["Түрээслэгч", primaryEquipment?.tenant ?? "Хөх Тэнгэр ХХК"],
              ["Дуусах", primaryEquipment?.due ?? "10-р сарын 18"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[8px] text-[#82909a]">{label}</p>
                <p className="mt-1 text-[10px] font-medium">{value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-['Inter:Bold'] text-[11px] font-bold">
              Live telemetry
            </h2>
            <span className="text-[8px] text-[#20a06b]">12:48:20</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              [primaryEquipment?.telemetry.vibration ?? "4.82", "mm/s"],
              [primaryEquipment?.telemetry.temperature ?? "78.6", "°C"],
              [primaryEquipment?.telemetry.rpm ?? "1,482", "RPM"],
            ].map(([value, unit]) => (
              <div className="rounded-lg bg-[#f3f7f8] p-2" key={unit}>
                <p className="font-['Roboto_Mono:Bold'] text-[14px] font-bold text-[#1677a8]">
                  {value}
                </p>
                <p className="mt-1 text-[8px] text-[#71808a]">{unit}</p>
              </div>
            ))}
          </div>
          <button
            className="mt-3 w-full rounded-lg bg-[#edf6f9] py-2 font-['Inter:Bold'] text-[9px] font-bold text-[#1677a8]"
            onClick={() => onNavigate("telemetry")}
            type="button"
          >
            Live telemetry дэлгэрэнгүй
          </button>
        </Card>
        <button
          className="mt-auto h-[48px] rounded-[9px] bg-[#1677a8] font-['Inter:Bold'] text-[12px] font-bold text-white"
          onClick={() => onNavigate("calendar")}
          type="button"
        >
          Захиалгын хугацаа сонгох
        </button>
      </div>
    </MobilePage>
  )
}
