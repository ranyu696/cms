import { Card, CardFooter, Image } from '@nextui-org/react'
import React from 'react'

interface VideoCardProps {
  video: {
    id: number
    title: string
    coverUrl: string | null
    description: string | null
  }
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <Card isPressable radius="sm" className="max-w-[300px]">
      <Image
        isZoomed
        isBlurred
        src={video.coverUrl ?? '/placeholder-video.jpg'}
        alt={video.title}
        radius="md"
        width={400}
        className="aspect-video size-full"
      />
      <CardFooter className="p-[-0.25rem]">
        <h4 className="line-clamp-2 text-small font-bold">{video.title}</h4>
      </CardFooter>
    </Card>
  )
}

export default VideoCard
