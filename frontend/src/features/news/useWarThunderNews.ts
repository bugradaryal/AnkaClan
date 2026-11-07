import { useEffect, useState } from 'react'

export interface WarThunderNews {
  title: string
  excerpt: string
  date: string
  url: string
  image?: string
}

const CACHE_KEY = 'ankaclan_wt_news'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const NEWS_URL = 'https://warthunder.com/en/news'
const NEWS_PROXY_URL = 'https://r.jina.ai/http://warthunder.com/en/news'

export function readNewsCache(): { news: WarThunderNews[]; fetchedAt: number } | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached) as { news?: WarThunderNews[]; fetchedAt?: number }
    const news = parsed.news?.filter((item) =>
      item.url.includes('/en/news/') && !item.url.includes('/en/news/page/'),
    )
    if (!parsed.fetchedAt || !news?.length) return null
    return { news, fetchedAt: parsed.fetchedAt }
  } catch {
    return null
  }
}

function writeCache(news: WarThunderNews[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ news, fetchedAt: Date.now() }))
  } catch {
    // The news section can still work if storage is unavailable.
  }
}

export async function fetchWarThunderNews(force = false): Promise<WarThunderNews[]> {
  const cached = readNewsCache()
  if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS && cached.news.length > 0) {
    return cached.news
  }

  let html: string
  let markdown = false

  try {
    const response = await fetch(NEWS_URL, {
      headers: { Accept: 'text/html' },
    })
    if (!response.ok) throw new Error(`Direct request failed: ${response.status}`)
    html = await response.text()
  } catch {
    const response = await fetch(NEWS_PROXY_URL, {
      headers: { Accept: 'text/plain' },
    })
    if (!response.ok) throw new Error(`War Thunder news request failed: ${response.status}`)
    html = await response.text()
    markdown = true
  }

  if (markdown) {
    const news: WarThunderNews[] = []
    const seenUrls = new Set<string>()
    const blocks = html.split(/!\[[^\]]*\]\(([^)\s]+)\)\s*\n*/g)

    for (let index = 1; index < blocks.length && news.length < 10; index += 2) {
      const image = blocks[index]
      const block = blocks[index + 1] || ''
      const commentMatch = block.match(/https:\/\/warthunder\.com\/en\/news\/([^\)\s]+)#comments/)
      if (!commentMatch) continue

      const url = `https://warthunder.com/en/news/${commentMatch[1].split('#')[0]}`
      if (url.includes('/page/') || seenUrls.has(url)) continue
      seenUrls.add(url)

      const dateMatch = block.match(/\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i)
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('*'))
      const title = lines
        .find((line) => !line.startsWith('[') && !line.match(/^\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i))
        ?.replace(/[*_]/g, '')
        || ''
      if (!title) continue

      const excerpt = lines.find((line) => line !== title && !line.startsWith('[')) || ''
      news.push({ title, excerpt, date: dateMatch?.[0] || '', url, image })
    }

    if (news.length === 0) throw new Error('War Thunder news could not be parsed')
    writeCache(news)
    return news
  }

  const document = new DOMParser().parseFromString(html, 'text/html')
  const articles = new Map<string, WarThunderNews>()

  document.querySelectorAll<HTMLAnchorElement>('a[href*="/en/news/"]').forEach((anchor) => {
    if (articles.size >= 10) return

    const href = anchor.getAttribute('href')
    if (!href || href.includes('#comments') || href.includes('/news/page/')) return

    const card = anchor.closest('article') || anchor.parentElement?.parentElement || anchor.parentElement
    if (!card) return

    const heading = card.querySelector('h1, h2, h3, h4')
    const title = heading?.textContent?.trim() || anchor.textContent?.trim()
    if (!title) return

    const paragraphs = Array.from(card.querySelectorAll('p'))
      .map((paragraph) => paragraph.textContent?.trim() || '')
      .filter(Boolean)

    const image = card.querySelector<HTMLImageElement>('img')?.getAttribute('src') || undefined
    const cardText = card.textContent || ''
    const dateMatch = cardText.match(/\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i)

    const url = new URL(href, NEWS_URL).href
    articles.set(url, {
      title,
      excerpt: paragraphs[0] || '',
      date: dateMatch?.[0] || '',
      url,
      image,
    })
  })

  const news = Array.from(articles.values()).slice(0, 10)
  if (news.length === 0) throw new Error('War Thunder news could not be parsed')

  writeCache(news)
  return news
}

export function useWarThunderNews() {
  const cached = readNewsCache()
  const [news, setNews] = useState<WarThunderNews[]>(cached?.news ?? [])
  const [loading, setLoading] = useState(!cached)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(false)

  const load = async (force = false) => {
    const savedNews = readNewsCache()
    if (savedNews) setNews(savedNews.news)

    setLoading(!savedNews)
    setRefreshing(Boolean(savedNews) || force)
    setError(false)
    try {
      setNews(await fetchWarThunderNews(force))
    } catch {
      if (!savedNews) setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return { news, loading, refreshing, error, reload: () => load(true) }
}
