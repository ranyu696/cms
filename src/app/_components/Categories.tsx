// components/Categories.tsx
import { ClientCategories } from './ClientCategories'
import { api } from '~/trpc/server'
import { CategoryType } from '~/types'

export const Categories = async () => {
  const videoCategories = await api.category.getByType({ type: CategoryType.Video })
  const novelCategories = await api.category.getByType({ type: CategoryType.Novel })
  const pictureCategories = await api.category.getByType({ type: CategoryType.Picture })
  const comicCategories = await api.category.getByType({ type: CategoryType.Comic })

  return (
    <ClientCategories 
      videoCategories={videoCategories}
      novelCategories={novelCategories}
      pictureCategories={pictureCategories}
      comicCategories={comicCategories}
    />
  )
}