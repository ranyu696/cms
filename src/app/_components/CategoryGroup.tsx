// components/CategoryGroup.tsx
import { Button } from '@nextui-org/react'
import Link from 'next/link'
import { CategoryType } from '~/types'

const getTypeUrl = (type: CategoryType): string => {
  switch (type) {
    case CategoryType.Video:
      return 'videos'
    case CategoryType.Novel:
      return 'novels'
    case CategoryType.Picture:
      return 'pictures'
    case CategoryType.Comic:
      return 'comics'
    default:
      return type
  }
}

const getTypeTitle = (type: CategoryType) => {
  switch (type) {
    case CategoryType.Video:
      return '视频'
    case CategoryType.Novel:
      return '小说'
    case CategoryType.Picture:
      return '图片'
    case CategoryType.Comic:
      return '漫画'
    default:
      return type
  }
}

export const CategoryGroup = ({
    type,
    categories,
  }: {
    type: CategoryType
    categories: { id: number; name: string }[]
  }) => {
    return (
      <div className="mb-2">
        <h2 className="mb-2 text-sm font-bold">{getTypeTitle(type)}</h2>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${getTypeUrl(type)}/category/${category.id}`}
            >
              <Button
                size="sm"
                color="danger"
                variant="shadow"
                className="w-full"
              >
                {category.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    )
  }