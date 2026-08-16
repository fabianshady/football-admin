import { getSeasons } from '@/app/actions/seasons'
import SeasonManager from '@/components/SeasonManager'
import { AnimatedPage } from '@/components/AnimatedContainer'

export default async function SeasonsPage() {
  const seasons = await getSeasons()

  return (
    <AnimatedPage>
      <div className="mb-8">
        <h1 className="page-title">Temporadas</h1>
        <p className="page-subtitle">
          Administra las temporadas del club · solo una puede estar activa a la vez
        </p>
      </div>

      <SeasonManager seasons={seasons} />
    </AnimatedPage>
  )
}
