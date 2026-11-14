import { useState } from "react"
import type { Screen } from "../data"
import { Card, Header, MobilePage, StatusPill } from "../ui"

export function CalendarScreen({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void
}) {
  const [selectedDay, setSelectedDay] = useState("09")

  return (
    <MobilePage current="calendar" onNavigate={onNavigate}>
      <Header
        onBack={() => onNavigate("detail")}
        subtitle="DRL-UB-0247 · Өрмийн машин"
        title="Захиалгын хуанли"
      />
      <div className="flex flex-1 flex-col gap-3 p-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <button className="rounded bg-[#f0f4f6] px-2 py-1" type="button">
              ‹
            </button>
            <p className="font-['Inter:Bold'] text-[12px] font-bold">
              2026 оны 10-р сар
            </p>
            <button className="rounded bg-[#f0f4f6] px-2 py-1" type="button">
              ›
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1">
            {["05", "06", "07", "08", "09", "10", "11"].map((day, index) => {
              const isSelected = selectedDay === day

              return (
                <button
                  className={`rounded-lg py-3 text-center ${
                    isSelected
                      ? "bg-[#1677a8] text-white"
                      : index > 1 && index < 4
                        ? "bg-[#fff1dc] text-[#b46b0f]"
                        : "bg-[#f4f7f8]"
                  }`}
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  type="button"
                >
                  <span className="block text-[7px]">
                    {["ДАВ", "МЯГ", "ЛХА", "ПҮР", "БАА", "БЯМ", "НЯМ"][index]}
                  </span>
                  <span className="mt-1 block font-['Roboto_Mono:Bold'] text-[12px] font-bold">
                    {day}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-['Inter:Bold'] text-[11px] font-bold">
              Сонгосон хугацаа
            </h2>
            <StatusPill tone="green">3 өдөр</StatusPill>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-[#f3f7f8] p-3">
            <div>
              <p className="text-[8px] text-[#7c8992]">ЭХЛЭХ</p>
              <p className="font-['Roboto_Mono:Bold'] text-[13px] font-bold">
                10.{selectedDay} · 08:00
              </p>
            </div>
            <span className="text-[#1677a8]">→</span>
            <div className="text-right">
              <p className="text-[8px] text-[#7c8992]">ДУУСАХ</p>
              <p className="font-['Roboto_Mono:Bold'] text-[13px] font-bold">
                10.{String(Number(selectedDay) + 1).padStart(2, "0")} · 18:00
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <h2 className="font-['Inter:Bold'] text-[11px] font-bold">
            Захиалгын мэдээлэл
          </h2>
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-[#dce4e8] p-3 text-[10px]">
              Монкон ХХК · Нарны зам, Блок B
            </div>
            <div className="rounded-lg border border-[#dce4e8] p-3 text-[10px] text-[#71808a]">
              Ажлын тайлбар, тэмдэглэл...
            </div>
          </div>
        </Card>
        <button
          className="mt-auto h-[48px] rounded-[9px] bg-[#1677a8] font-['Inter:Bold'] text-[12px] font-bold text-white"
          onClick={() => onNavigate("checkout")}
          type="button"
        >
          Захиалга баталгаажуулах
        </button>
      </div>
    </MobilePage>
  )
}
