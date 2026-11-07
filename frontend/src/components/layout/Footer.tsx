import { site } from '../../config/site'

export function Footer() {
  return (
    <footer className="border-t border-wine-800/70 px-5 py-8 text-center text-sm text-mute">
      <p>
        {site.communityName} · İstatistik verileri{' '}
        <a
          href={site.statSharkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline transition hover:text-bone"
        >
          StatShark
        </a>{' '}
        üzerinden sağlanmaktadır.
      </p>

      <p className="mt-3 text-xs text-mute/70">
        © {new Date().getFullYear()} {site.communityName}. Tüm hakları saklıdır.
        War Thunder ve Gaijin Entertainment ile resmî bağlantısı yoktur.
      </p>
    </footer>
  )
}