import type { DashboardResponse } from "../../lib/api"
import { fallbackDashboard, type Screen } from "../data"
import { Card, Header, Icon, MobilePage, StatusPill, icons } from "../ui"

function MiniChart({ danger = false }: { danger?: boolean }) {
  return (
    <div className="relative h-[110px] overflow-hidden rounded-lg border border-[#e2e8eb] bg-white">
      <div className="absolute inset-x-3 top-1/2 h-px bg-[#dbe3e7]" />
      <div
        className={`absolute right-4 bottom-5 left-4 h-[64px] rounded-[50%] border-b-2 ${
          danger ? "border-[#d8463e]" : "border-[#1677a8]"
        } -rotate-6`}
      />
      <div className="absolute right-4 bottom-6 left-4 h-[48px] rotate-3 rounded-[50%] border-b-2 border-[#e39732]" />
      {danger && (
        <div className="absolute top-3 bottom-3 left-[58%] w-px bg-[#d8463e]" />
      )}
    </div>
  )
}

export function TelemetryScreen({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void
}) {
  return (
    <MobilePage current="telemetry" onNavigate={onNavigate}>
      <Header
        onBack={() => onNavigate("detail")}
        subtitle="LIVE · DRL-UB-0247 · 1 Hz"
        title="Live telemetry"
      />
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            ["96.2", "°C"],
            ["8.41", "mm/s"],
            ["1,824", "RPM"],
            ["184", "bar"],
          ].map(([value, unit], index) => (
            <Card className="p-2 text-center" key={unit}>
              <p
                className={`font-['Roboto_Mono:Bold'] text-[13px] font-bold ${
                  index === 0 ? "text-[#d8463e]" : "text-[#1677a8]"
                }`}
              >
                {value}
              </p>
              <p className="mt-1 text-[7px] text-[#788791]">{unit}</p>
            </Card>
          ))}
        </div>
        <Card className="p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-['Inter:Bold'] text-[11px] font-bold">
              Сүүлийн 60 секунд
            </h2>
            <span className="text-[8px] text-[#7d8b94]">LIVE</span>
          </div>
          <MiniChart />
        </Card>
        <Card className="p-3">
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg bg-[#e2f1f7] p-2 text-[9px] text-[#1677a8]">
              1D-CNN · F1 0.941
            </button>
            <button className="flex-1 rounded-lg bg-[#f1f4f6] p-2 text-[9px]">
              LSTM · F1 0.926
            </button>
          </div>
          <p className="mt-3 text-[9px]">Confidence threshold</p>
          <input
            className="mt-2 w-full accent-[#1677a8]"
            defaultValue="82"
            max="100"
            min="0"
            type="range"
          />
        </Card>
        <Card className="p-3">
          <p className="text-[9px]">Sliding-window төлөвлөгөө</p>
          <div className="mt-2 grid grid-cols-12 gap-1">
            {Array.from({ length: 24 }, (_, index) => (
              <span
                className={`h-3 rounded-sm ${
                  index > 13 ? "bg-[#d84d44]" : "bg-[#e1f0ea]"
                }`}
                key={index}
              />
            ))}
          </div>
        </Card>
        <button
          className="rounded-lg border border-[#e18883] bg-[#fff1f0] p-3 text-left text-[10px] font-bold text-[#d8463e]"
          onClick={() => onNavigate("anomaly")}
          type="button"
        >
          ANOMALY · шинэ эрсдэл илэрлээ
        </button>
      </div>
    </MobilePage>
  )
}

export function AnomalyScreen({
  dashboard,
  onNavigate,
}: {
  dashboard: DashboardResponse
  onNavigate: (screen: Screen) => void
}) {
  const alert = dashboard.alerts[0] ?? fallbackDashboard.alerts[0]

  return (
    <MobilePage current="anomaly" onNavigate={onNavigate}>
      <Header
        onBack={() => onNavigate("home")}
        subtitle={`${alert?.equipmentId ?? "MIX-4993"} · Бетон зуурагч`}
        title="Anomaly alert"
      />
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="rounded-[10px] border border-[#e87973] bg-[#fff0ef] p-3">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#d8463e]">
              <Icon className="size-5 brightness-0 invert" src={icons.alert} />
            </span>
            <div className="flex-1">
              <p className="font-['Inter:Bold'] text-[13px] font-bold text-[#d8463e]">
                ӨНДӨР ЭРСДЭЛ
              </p>
              <p className="mt-1 text-[9px]">
                {alert?.title ?? "Бетон зуурагч “B4”"}
              </p>
            </div>
            <span className="font-['Roboto_Mono:Bold'] text-[16px] font-bold text-[#d8463e]">
              {alert?.risk ?? "93.4%"}
            </span>
          </div>
        </div>
        <Card className="p-3">
          {[
            ["Байршил", alert?.location ?? "ББ · Талбай 12"],
            ["Илэрсэн цаг", "Өнөөдөр · 12:43:18"],
            ["MQTT топик", alert?.equipmentId ?? "eq_429_788"],
          ].map(([label, value]) => (
            <div
              className="flex items-center justify-between border-b border-[#edf1f3] py-2 last:border-0"
              key={label}
            >
              <span className="text-[9px] text-[#75848e]">{label}</span>
              <span className="font-['Roboto_Mono:Regular'] text-[9px]">
                {value}
              </span>
            </div>
          ))}
        </Card>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["96.2", "°C"],
            ["8.41", "mm/s"],
            ["1,824", "RPM"],
          ].map(([value, unit], index) => (
            <Card className="p-3 text-center" key={unit}>
              <p
                className={`font-['Roboto_Mono:Bold'] text-[14px] font-bold ${
                  index === 0 ? "text-[#d8463e]" : "text-[#1677a8]"
                }`}
              >
                {value}
              </p>
              <p className="text-[8px] text-[#7b8992]">{unit}</p>
            </Card>
          ))}
        </div>
        <Card className="p-3">
          <h2 className="mb-3 font-['Inter:Bold'] text-[11px] font-bold">
            5 минутын өмнөх / дараах snapshot
          </h2>
          <MiniChart danger />
        </Card>
        <Card className="flex items-center justify-between p-3">
          <div>
            <p className="text-[9px] text-[#75848e]">Push/SMS мэдээлэл</p>
            <p className="mt-1 font-['Roboto_Mono:Bold'] text-[18px] font-bold text-[#238a62]">
              7.4 сек
            </p>
          </div>
          <StatusPill tone="green">SLA OK</StatusPill>
        </Card>
        <button
          className="mt-auto h-[48px] rounded-[9px] bg-[#d8463e] font-['Inter:Bold'] text-[12px] font-bold text-white"
          onClick={() => onNavigate("support")}
          type="button"
        >
          Хариу арга хэмжээ авах
        </button>
      </div>
    </MobilePage>
  )
}
