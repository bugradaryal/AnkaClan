import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import { MODES, PERIODS } from '../../data/modes'
import type { PeriodKey } from '../../data/types'
import { useSquad } from '../../data/useSquad'
import { PlayerPanel } from '../../features/squad/PlayerPanel'
import { PlayerTable } from '../../features/squad/PlayerTable'
import { TopPlayers } from '../../features/squad/TopPlayers'
import { toRows } from '../../features/squad/rows'
import { site } from '../../config/site'
import { CACHE_TTL_HOURS } from '../../data/loadSquad'
import { formatAgo, formatDate, formatDateTime, formatNumber } from '../../utils/format'

const CompareChart = lazy(() => import('../../features/charts/CompareChart'))
const MAX_COMPARE = 4
const STALE_AFTER_HOURS = 72 // the data is refreshed by hand, so only warn when it is clearly old

export default function StatsPage() {
  const { data: result, isPending, isError, refetch } = useSquad()
  const [mode, setMode] = useState<string>('air_realistic')
  const [period, setPeriod] = useState<PeriodKey>('total')
  const [selected, setSelected] = useState<string[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  const data = result?.data
  const rows = data ? toRows(data.players, mode, period) : []
  const openPlayer = data?.players.find((p) => p.id === openId) ?? null
  const compareRows = rows.filter((r) => selected.includes(r.id) && r.stats)

  const ageHours = data?.sourceUpdatedAt ? (Date.now() - Date.parse(data.sourceUpdatedAt)) / 3_600_000 : 0
  const stale = result?.origin === 'stale-cache' || ageHours > STALE_AFTER_HOURS

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((n) => n !== id) : cur.length < MAX_COMPARE ? [...cur, id] : cur))

  return (
    <div className="min-h-screen bg-gradient-to-b from-wine-900 via-ink via-[40%] to-ink">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {data?.squad.name ?? site.squadronName}
          <span className="text-wine-300"> Filo Üyeleri</span>
        </h1>

        {isPending && <p className="mt-10 text-mute">Filo Verisi Yükleniyor..</p>}

        {isError && (
          <div className="mt-10 border border-wine-600 p-6">
            <p className="font-semibold">Filo istatiksikleri şuanda yüklenemiyor.</p>
            <p className="mt-1 text-sm text-mute">
              Veriler yüklenemedi ve bu tarayıcıda henüz kayıtlı bir kopya bulunmuyor. Lütfen daha sonra tekrar deneyin.
            </p>
            <button type="button" onClick={() => void refetch()} className="mt-4 border border-wine-400 px-4 py-2 text-sm hover:bg-wine-700">
              Tekrar dene
            </button>
          </div>
        )}

        {data && (
          <>
            <p className="mt-1 text-sm text-mute/80">
              StatShark kadroyu{' '}
              {data.sourceUpdatedAt
                ? `${formatDateTime(data.sourceUpdatedAt)} tarihinde (${formatAgo(data.sourceUpdatedAt)} önce)`
                : 'bilinmeyen bir tarihte'} güncelledi.
              {' '}Bu cihazda son kontrol: {formatAgo(result!.checkedAt)} önce
              {result!.origin === 'cache'
                ? ` (kayıtlı kopya, ${CACHE_TTL_HOURS} saatte bir yenilenir)`
                : ''}.
            </p>


        {stale && (
          <p className="mt-4 border-l-2 border-wine-300 bg-wine-900/60 px-4 py-2 text-sm">
            {result?.origin === 'stale-cache'
              ? 'Veri dosyası şu anda yüklenemedi. Bu nedenle bu cihazda kayıtlı olan son kopya gösteriliyor.'
              : 'StatShark verileri birkaç gündür güncellenmemiş. Veriler manuel olarak aktarıldığından daha güncel istatistikler bulunabilir.'}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Kuruluş tarihi', value: formatDate(data.squad.createdAt), note: data.squad.region ?? 'Filo' },
            { label: 'Aktivite puanı', value: formatNumber(data.squad.activityPoints), note: 'StatShark verilerine göre' },
            {
              label: 'Üyeler',
              value: `${formatNumber(data.squad.memberCount)}${data.squad.memberLimit ? ` / ${data.squad.memberLimit}` : ''}`,
              note: 'Filo üye sayısı',
            },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-6 transition-colors hover:bg-white/[0.055]"
            >
              <p className="text-sm text-mute">{c.label}</p>

              <p className="mt-3 font-display text-3xl font-bold tracking-tight text-wine-300">{c.value}</p>

              <p className="mt-1 text-xs text-mute/70">{c.note}</p>
            </div>
          ))}
        </div>

        <div role="tablist" aria-label="Oyun modu" className="mt-10 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={mode === m.key}
              onClick={() => setMode(m.key)}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                mode === m.key
                  ? 'bg-wine-500/15 text-wine-300 ring-1 ring-wine-400/30'
                  : 'bg-white/[0.035] text-mute hover:bg-white/[0.07] hover:text-bone'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div role="tablist" aria-label="İstatistik dönemi" className="mt-3 flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              role="tab"
              aria-selected={period === p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                period === p.key
                  ? 'bg-wine-500/15 text-wine-300 ring-1 ring-wine-400/30'
                  : 'bg-white/[0.035] text-mute hover:bg-white/[0.07] hover:text-bone'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-10">
          <TopPlayers rows={rows} period={period} onOpen={setOpenId} />

          {compareRows.length >= 2 && (
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">
                  Karşılaştırma
                  <span className="ml-2 text-base font-normal text-mute">
                    ({MODES.find((m) => m.key === mode)?.label}, {PERIODS.find((p) => p.key === period)?.label})
                  </span>
                </h2>

                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="rounded-lg px-3 py-2 text-sm text-mute transition-colors hover:bg-white/[0.06] hover:text-bone"
                >
                  Seçimi temizle
                </button>
              </div>

              <Suspense fallback={<p className="text-sm text-mute">Grafik yükleniyor...</p>}>
                <CompareChart rows={compareRows} />
              </Suspense>
            </section>
          )}

          <PlayerTable rows={rows} selected={selected} maxSelected={MAX_COMPARE} onToggle={toggle} onOpen={setOpenId} />

          <p className="text-xs text-mute">
            Derecelendirme, seçilen oyun moduna ait StatShark puanıdır. Kills/spawn, ölüm verisi kaynakta bulunmadığından K/D değil, doğuş başına düşen öldürme sayısıdır. Kazanma oranı ve ortalama takım sıralaması yüzde olarak gösterilir. Toplam ve Aylık istatistikler birbirinden bağımsızdır. İlgili oyun modunda maçı bulunmayan oyuncular için "-" gösterilir. Veriler manuel olarak aktarıldığından güncelleme zamanını yukarıdan kontrol edebilirsiniz.
          </p>
        </div>
        </>
        )}

        <p className="mt-16 text-sm text-mute"><Link to="/" className="hover:text-bone">Ana sayfaya dön</Link></p>
        </main>


      {openPlayer && (
        <PlayerPanel key={openPlayer.id} player={openPlayer} initialMode={mode} initialPeriod={period} onClose={() => setOpenId(null)} />
      )}
      <Footer />
    </div>
  )
}
