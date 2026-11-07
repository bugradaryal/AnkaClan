export interface Community {
  name: string
  shortName: string
  description: string
  image: string
  discordUrl?: string
}

export const communities: Community[] = [
  {
    name: 'iRacing',
    shortName: 'IRACING',
    description: 'Pistlerde temiz yarışlarla, takım çalışması ve rekabet içinde daha iyiye ulaşıyoruz.',
    image: '/iracing.png',
    discordUrl: 'https://discord.gg/d8sczSrnPP',
  },
]
