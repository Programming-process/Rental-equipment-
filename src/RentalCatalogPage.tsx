import { useEffect, useMemo, useState } from "react"
import {
  rentalCatalog,
  rentalCategories,
  rentalCategoryIcons,
  USD_TO_MNT_AS_OF,
  USD_TO_MNT_RATE,
} from "./rentalCatalog"

type RentalCatalogPageProps = {
  initialCategory: string
  isDarkMode: boolean
  onBackToWebsite: () => void
  onLogin: () => void
  onToggleTheme: () => void
}

const formatTugrik = (usd: number) =>
  `₮${new Intl.NumberFormat("mn-MN", {
    maximumFractionDigits: 0,
  }).format(Math.round((usd * USD_TO_MNT_RATE) / 1000) * 1000)}`

export default function RentalCatalogPage({
  initialCategory,
  isDarkMode,
  onBackToWebsite,
  onLogin,
  onToggleTheme,
}: RentalCatalogPageProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState(initialCategory)
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    setCategory(initialCategory)
    setPage(1)
  }, [initialCategory])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return rentalCatalog.filter((item) => {
      const matchesCategory = category === "Бүгд" || item.category === category
      const matchesSearch =
        !query ||
        `${item.name} ${item.englishName} ${item.category}`
          .toLocaleLowerCase()
          .includes(query)
      return matchesCategory && matchesSearch
    })
  }, [category, search])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const visibleItems = filteredItems.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div
      className={`app-theme min-h-screen bg-[#f3f1ec] text-[#101820] ${isDarkMode ? "dark-mode" : ""}`}
    >
      <header className="mx-auto max-w-7xl px-4 pt-5">
        <div className="flex items-center justify-between rounded-full bg-[#0a0d12] px-5 py-3 text-white shadow-[0_18px_40px_rgba(10,13,18,0.18)]">
          <button
            aria-label="Вэбсайтын нүүр хуудас"
            className="text-2xl font-black tracking-[-0.08em]"
            onClick={onBackToWebsite}
            type="button"
          >
            Rent
          </button>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold transition hover:bg-white/10"
              onClick={onBackToWebsite}
              type="button"
            >
              Нүүр хуудас
            </button>
            <button
              className="rounded-full bg-[#f5b91d] px-4 py-2 text-xs font-bold text-[#101820] transition hover:brightness-105"
              onClick={onLogin}
              type="button"
            >
              Нэвтрэх
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6">
        <section className="rounded-[28px] border border-[#dfe3db] bg-white p-5 shadow-[0_12px_28px_rgba(21,30,35,0.04)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Түрээсийн каталог
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-[-0.06em] text-[#101820] md:text-3xl">
                Тоног төхөөрөмжийн бүх төрөл
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Бүх ангилал, жишиг үнийг нэвтрэхгүйгээр харах боломжтой.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:min-w-[460px]">
              <label className="sr-only" htmlFor="catalog-search">
                Тоног төхөөрөмж хайх
              </label>
              <input
                className="h-11 rounded-xl border border-[#d6dfe4] px-3 text-sm outline-none focus:border-[#1677a8]"
                id="catalog-search"
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Нэрээр хайх..."
                type="search"
                value={search}
              />
              <label className="sr-only" htmlFor="catalog-category">
                Төрлөөр шүүх
              </label>
              <select
                className="h-11 rounded-xl border border-[#d6dfe4] bg-white px-3 text-sm outline-none focus:border-[#1677a8]"
                id="catalog-category"
                onChange={(event) => {
                  setCategory(event.target.value)
                  setPage(1)
                }}
                value={category}
              >
                <option value="Бүгд">Бүх төрөл</option>
                {rentalCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-5 rounded-xl bg-[#fff8e6] px-4 py-3 text-xs leading-5 text-[#6b5721]">
            Өдөр тутмын үнийн дүн нь олон улсын USD жишигт үндэслэсэн
            ойролцоо тооцоо бөгөөд Монгол дахь бодит үнэ биш. Ханш: 1 USD ≈
            ₮3,599 ({USD_TO_MNT_AS_OF}); бодит үнэ, бэлэн байдлыг түрээсийн
            хүсэлтээр баталгаажуулна.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => {
              const [lowUsd, highUsd] = item.dailyUsdRange
              return (
                <article
                  className="group flex min-h-72 flex-col overflow-hidden rounded-2xl border border-[#e6e8e2] bg-[#f8f9f6] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(16,24,32,0.12)]"
                  key={item.id}
                >
                  <div className="relative h-36 overflow-hidden bg-[#dbe7ec]">
                    <img
                      alt={`${item.name} тоног төхөөрөмжийн зураг`}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      src={item.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d12]/75 via-transparent to-[#0a0d12]/10" />
                    <p className="absolute right-3 bottom-3 left-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                      <span className="flex size-7 items-center justify-center rounded-lg border border-white/25 bg-white/15 text-base backdrop-blur-sm">
                        {rentalCategoryIcons[item.category]}
                      </span>
                      {item.category}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="text-lg font-bold text-[#101820]">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.englishName}
                    </p>
                    <p className="mt-4 text-sm font-bold text-[#101820]">
                      Жишиг: {formatTugrik(lowUsd)}–{formatTugrik(highUsd)}/өдөр
                    </p>
                    <button
                      className="mt-auto pt-5 text-left text-sm font-bold text-[#1677a8] transition hover:text-[#0f5d84]"
                      onClick={onLogin}
                      type="button"
                    >
                      Түрээсийн хүсэлт гаргах →
                    </button>
                  </div>
                </article>
              )
            })}
            {visibleItems.length === 0 && (
              <p className="py-8 text-sm text-slate-500">
                Таны хайлтад тохирох төрөл олдсонгүй.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e8e2] pt-4">
            <p aria-live="polite" className="text-sm text-slate-500">
              Нийт {filteredItems.length} төрөл ·{" "}
              {filteredItems.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredItems.length)} харуулж байна
            </p>
            <div className="flex items-center gap-2">
              <button
                aria-label="Өмнөх каталогийн хуудас"
                className="rounded-lg border border-[#d6dfe4] px-3 py-2 text-sm disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                type="button"
              >
                Өмнөх
              </button>
              <span className="text-sm text-slate-600">
                {page} / {pageCount}
              </span>
              <button
                aria-label="Дараагийн каталогийн хуудас"
                className="rounded-lg border border-[#d6dfe4] px-3 py-2 text-sm disabled:opacity-40"
                disabled={page === pageCount}
                onClick={() => setPage((current) => current + 1)}
                type="button"
              >
                Дараах
              </button>
            </div>
          </div>
        </section>
      </main>
      <button
        aria-label={isDarkMode ? "Өдрийн горимд шилжих" : "Шөнийн горимд шилжих"}
        className="fixed right-4 bottom-4 z-50 flex size-12 items-center justify-center rounded-full border border-white/15 bg-[#111923] text-xl text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:scale-105"
        onClick={onToggleTheme}
        title={isDarkMode ? "Өдрийн горим" : "Шөнийн горим"}
        type="button"
      >
        <span aria-hidden="true">{isDarkMode ? "☀" : "☾"}</span>
      </button>
    </div>
  )
}
