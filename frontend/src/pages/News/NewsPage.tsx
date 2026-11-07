import { motion } from 'framer-motion'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import { Button } from '../../components/ui/Button'
import { useWarThunderNews } from '../../features/news/useWarThunderNews'
import { useState } from 'react'

export default function NewsPage() {
  const { news, loading, refreshing, error, reload } = useWarThunderNews()
  const [visibleCount, setVisibleCount] = useState(4)
  const visibleNews = news.slice(0, visibleCount)

  return (
    <div className="min-h-screen bg-gradient-to-b from-wine-900 via-ink via-[40%] to-ink">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-amber-300">WAR THUNDER</p>
            <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Haberler</h1>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading || refreshing}
            className="shrink-0 border border-wine-400 px-4 py-2 text-sm font-bold text-bone transition-colors hover:bg-wine-700 disabled:cursor-wait disabled:opacity-50"
          >
            {loading || refreshing ? 'Yükleniyor...' : 'Yenile'}
          </button>
        </div>

        {loading && news.length === 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-xl border border-white/[0.08] bg-white/[0.04]" />
            ))}
          </div>
        )}

        {error && news.length === 0 && (
          <div className="mt-8 rounded-xl border border-white/[0.08] bg-ink p-6 text-white/70">
            Haberler şu anda yüklenemedi.
          </div>
        )}

        {news.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {visibleNews.map((item) => (
              <motion.a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="group overflow-hidden rounded-xl border border-white/[0.08] bg-ink"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                )}
                <div className="p-5">
                  {item.date && (
                    <span className="text-xs font-bold tracking-wide text-amber-300">{item.date}</span>
                  )}
                  <h3 className="mt-2 font-display text-xl font-bold text-white">{item.title}</h3>
                  {item.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70">{item.excerpt}</p>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {visibleCount < news.length && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 4)}
              className="border border-wine-400 px-6 py-3 font-display text-lg font-bold transition-colors hover:bg-wine-700"
            >
              Daha Fazla Göster
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button href="https://warthunder.com/en/news">War Thunder Haberleri</Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
