import { motion } from 'framer-motion'
import { AnimatedGrid } from '../../components/common/AnimatedGrid'
import { Emblem } from '../../components/common/Emblem'
import { Button } from '../../components/ui/Button'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import { achievements } from '../../features/achievements/achievements'
import { site } from '../../config/site'
import { achievementIcons } from '../../features/achievements/achievementIcons'
import { communities } from '../../features/communities/communities'
import { activities } from '../../features/achievements/activities'

const reveal = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay: 0.15 * i, ease: 'easeOut' as const },
})

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink via-ink via-[70%] to-wine-900">
      <section className="hero-bg relative flex min-h-screen items-center justify-center overflow-hidden px-5">
        <AnimatedGrid />
        <Navbar />
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div {...reveal(0)}><Emblem className="h-20 w-20" /></motion.div>
          <motion.h1 {...reveal(1)} className="mt-6 font-display text-6xl font-extrabold leading-none tracking-tight sm:text-8xl">
            {site.communityName} Ailesine Hoşgeldin
          </motion.h1>
          <motion.p
  {...reveal(2)}
  className="mx-auto mt-4 w-full max-w-4xl text-center text-lg text-bone/80 sm:text-xl"
>
  {site.slogan}
</motion.p>
          <motion.div {...reveal(3)} className="mt-10 flex flex-wrap justify-center gap-4">
            <Button to="/stats">İstatistikler</Button>
            <Button variant="outline" href={site.discordUrl}>DISCORD</Button>
          </motion.div>
          <motion.p {...reveal(4)} className="mt-4 text-sm text-bone/70 sm:text-base">
            Başvurular Discord üzerinden yapılmaktadır.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="font-display text-4xl font-bold">Hakkımızda</h2>
        <p className="mt-5 leading-relaxed text-mute">
        Anka klanı, War Thunder çatısı altında bir araya gelen, rekabeti, takım ruhunu ve topluluk kültürünü ön planda tutan çok oyunlu bir topluluktur.
        Amacımız yalnızca birlikte oyun oynamak değil; koordineli hareket ederek başarılar elde etmek, sıralamalarda üst sıralara tırmanmak ve Anka filosu adını uluslararası arenada temsil etmektir.
        Topluluğumuzun işleyişi, Discord sunucumuz üzerinden titizlikle yürütülür. Organizasyonlar, filo savaşları, duyurular ve ekip içi iletişim belirli bir düzen içerisinde sağlanır. Her üyemizin katkısını önemsiyor, başarının bireysel performanstan çok takım çalışmasıyla geldiğine inanıyoruz.
        Bizim için Anka klanı yalnızca bir oyun etiketi değil; ortak hedefleri olan, birlikte gelişen ve başarılarını birlikte kutlayan bir topluluktur.
        Sen de ANKA'nın bir parçası olmak ister misin?
        Discord sunucumuza katıl, topluluğumuzu tanı ve savaş alanında yerini al. Birlikte daha güçlüyüz. Birlikte ANKA'yız!
        </p>
      </section>

  <section className="mx-auto max-w-6xl px-5 pb-24">
    <h2 className="font-display text-4xl font-bold">Neler Yapıyoruz</h2>

    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {activities.map((activity, i) => {
        const Icon = achievementIcons[activity.icon as keyof typeof achievementIcons]

        return (
          <div
            key={i}
            className="group relative isolate min-h-[280px] overflow-hidden rounded-xl border border-white/[0.08] bg-ink"
          >
            <img
              src={activity.image}
              alt=""
              className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#100d12] via-[#100d12]/75 to-[#100d12]/20" />

            <div className="flex h-full min-h-[280px] flex-col justify-center p-6 pt-10">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-amber-400/40 bg-black/60 text-amber-300 shadow-lg shadow-black/30">
                <Icon size={22} strokeWidth={1.8} />
              </div>

              <h3 className="font-display text-2xl font-bold text-white">
                {activity.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {activity.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-display text-4xl font-bold">Diğer Oyun Topluluklarımız</h2>

        <div className="mt-8 grid gap-5">
          {communities.map((community) => (
            <motion.a
              key={community.name}
              href={community.discordUrl || site.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
              className="group relative isolate flex min-h-[220px] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-ink sm:min-h-[180px]"
            >
              <img
                src={community.image}
                alt=""
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#100d12] via-[#100d12]/85 to-[#100d12]/25" />

              <div className="flex h-full min-h-[220px] w-full flex-col justify-end p-6 sm:min-h-[180px] sm:max-w-2xl sm:justify-center sm:p-8">
                <span className="mb-3 font-display text-xs font-bold tracking-[0.28em] text-amber-300">
                  {community.shortName}
                </span>
                <h3 className="font-display text-3xl font-bold text-white sm:text-4xl">
                  {community.name}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  {community.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {achievements.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <h2 className="font-display text-4xl font-bold">Başarılarımız</h2>

          <div className="mt-8 grid gap-4">
            {achievements.map((achievement, index) => {
              return (
                <div
                  key={index}
                  className="group relative flex min-h-[150px] items-center overflow-hidden rounded-xl border border-[#a5682b]/35 bg-gradient-to-r from-[#11151b] via-[#15171f] to-[#18131b] px-6 py-7 shadow-[inset_0_0_0_1px_rgba(213,152,72,.05),inset_0_-18px_40px_rgba(94,48,24,.08)] sm:px-10"
                >
                  <span className="absolute left-0 top-4 h-[calc(100%-32px)] w-[3px] bg-gradient-to-b from-transparent via-[#bd7b3d] to-transparent opacity-70" />
                  <span className="absolute right-0 top-4 h-[calc(100%-32px)] w-[3px] bg-gradient-to-b from-transparent via-[#bd7b3d] to-transparent opacity-70" />
                  <span className="absolute left-3 top-3 h-3 w-3 rounded-full border border-[#b47739]/70 bg-[#6b4024] shadow-[0_0_8px_rgba(189,123,61,.22)]" />
                  <span className="absolute bottom-3 left-3 h-3 w-3 rounded-full border border-[#b47739]/70 bg-[#6b4024] shadow-[0_0_8px_rgba(189,123,61,.22)]" />
                  <span className="absolute right-3 top-3 h-3 w-3 rounded-full border border-[#b47739]/70 bg-[#6b4024] shadow-[0_0_8px_rgba(189,123,61,.22)]" />
                  <span className="absolute bottom-3 right-3 h-3 w-3 rounded-full border border-[#b47739]/70 bg-[#6b4024] shadow-[0_0_8px_rgba(189,123,61,.22)]" />

                  <div className="mr-5 flex h-[98px] w-[98px] shrink-0 flex-col items-center justify-center rounded-full border-[4px] border-[#c99a55] bg-[#11151b] shadow-[0_0_0_4px_#4a2a20,0_0_0_7px_rgba(176,106,51,.55),0_8px_24px_rgba(0,0,0,.45),inset_0_0_18px_rgba(201,154,85,.16)] transition-transform duration-500 group-hover:scale-[1.03] sm:mr-8 sm:h-[112px] sm:w-[112px]">
                    <span className="font-display text-2xl font-bold leading-none text-[#efb35d] sm:text-3xl">
                      {achievement.rank}
                    </span>
                    <span className="mt-2 text-[10px] font-bold tracking-[0.16em] text-white/80 sm:text-xs">
                      {achievement.season}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                      {achievement.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
