export interface Activity {
  title: string
  description: string
  image: string
  icon: string
}

export const activities: Activity[] = [
  {
    title: 'Filo Savaşları',
    description: 'Koordineli ekipler kurarak War Thunder filo savaşlarında birlikte mücadele ediyoruz.',
    image: '/1.jpg',
    icon: 'shield-check',
  },
  {
    title: 'Discord Organizasyonu',
    description: 'Etkinliklerimizi, taktiklerimizi ve ekip içi iletişimimizi düzenli bir şekilde yönetiyoruz.',
    image: '/2.jpg',
    icon: 'users',
  },
  {
    title: 'Topluluk Etkinlikleri',
    description: 'Ortak oyun deneyimleri, turnuvalar ve sosyal etkinliklerle topluluğumuzu büyütüyoruz.',
    image: '/3.jpg',
    icon: 'trophy',
  },
]
