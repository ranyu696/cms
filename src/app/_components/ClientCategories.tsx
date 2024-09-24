'use client'

// components/ClientCategories.tsx
import { usePathname } from 'next/navigation'
import { CategoryGroup } from './CategoryGroup'
import { CategoryType } from '~/types'

type ClientCategoriesProps = {
  videoCategories: { id: number; name: string }[]
  novelCategories: { id: number; name: string }[]
  pictureCategories: { id: number; name: string }[]
  comicCategories: { id: number; name: string }[]
}

export const ClientCategories = ({
  videoCategories,
  novelCategories,
  pictureCategories,
  comicCategories
}: ClientCategoriesProps) => {
  const pathname = usePathname()

  let type: CategoryType | null = null
  let categories: { id: number; name: string }[] = []

  if (pathname === '/' || pathname.startsWith('/videos')) {
    type = CategoryType.Video
    categories = videoCategories
  } else if (pathname.startsWith('/novels')) {
    type = CategoryType.Novel
    categories = novelCategories
  } else if (pathname.startsWith('/pictures')) {
    type = CategoryType.Picture
    categories = pictureCategories
  } else if (pathname.startsWith('/comics')) {
    type = CategoryType.Comic
    categories = comicCategories
  }

  if (!type) return null

  return (
    <div className="mx-auto w-full pt-2">
      <CategoryGroup type={type} categories={categories} />
    </div>
  )
}