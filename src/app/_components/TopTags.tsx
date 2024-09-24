import { Chip } from '@nextui-org/react'
import Link from 'next/link'
import { api } from '~/trpc/server'

const TopTags = async () => {
  const tags = await api.tag.getTopTags()

  return (
    <div className="w-full p-2">
      <div className="flex flex-wrap justify-start gap-2">
        {tags.map((tag) => (
          <Link
            href={tag.url ?? `/search?q=${encodeURIComponent(tag.name)}`}
            key={tag.id}
          >
            <Chip variant="faded" color="danger" className="cursor-pointer">
              {tag.name}
            </Chip>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default TopTags
