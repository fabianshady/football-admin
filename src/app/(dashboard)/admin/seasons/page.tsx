import { getSeasons } from '@/app/actions/seasons'
import SeasonManager from '@/components/SeasonManager'
import { AnimatedPage } from '@/components/AnimatedContainer'

export default async function SeasonsPage() {
  const seasons = await getSeasons()

  return (
    <AnimatedPage className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Temporadas 📅
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Administra las temporadas del club · solo una puede estar activa a la vez
        </p>
      </div>

      <SeasonManager seasons={seasons} />
    </AnimatedPage>
  )
}
