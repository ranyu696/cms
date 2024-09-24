import { Button, Image } from '@nextui-org/react'
import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import VideoCard from '~/app/_components/Card/VideoCard'
import { api } from '~/trpc/server'

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const videoId = parseInt(params.id)
  const video = await api.video.getById(videoId)
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'basic',
      key: 'siteName',
    })) as string) ?? '小新视频'

  if (!video) {
    return {
      title: `视频未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的视频。',
    }
  }

  const title = `${video.title} - ${siteName}`
  const description =
    video.description ?? `观看 ${video.title} 和更多精彩视频内容。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.other',
      videos: [video.playUrl],
      images: [video.coverUrl],
    },
  }
}
export default async function VideoDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const videoId = parseInt(params.id)
  const [video, relatedVideos, featuredVideos] = await Promise.all([
    api.video.getById(videoId),
    api.video.getRelatedVideos({ videoId, limit: 8 }),
    api.video.getFeaturedVideos({ limit: 8 }),
  ])

  if (!video) {
    notFound() // 这会触发 Next.js 的 404 页面
  }
  return (
    <div className="m-2 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">{video.title}</h1>
      <Image
        src={video.coverUrl ?? '/placeholder-image.jpg'}
        alt={video.title}
        className="mb-4 w-full max-w-2xl"
      />
      <p className="mb-4">{video.description}</p>
      <Link href={`/videos/${videoId}/play`}>
        <Button color="primary">播放视频</Button>
      </Link>
      <section>
        <div>
          <h2 className="mt-4 text-xl font-bold">相关推荐</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {relatedVideos.map((relatedVideo) => (
              <Link key={relatedVideo.id} href={`/videos/${relatedVideo.id}`}>
                <VideoCard key={relatedVideo.id} video={relatedVideo} />
              </Link>
            ))}
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-bold">精选推荐</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {featuredVideos.map((featuredVideo) => (
            <Link key={featuredVideo.id} href={`/videos/${featuredVideo.id}`}>
              <VideoCard key={featuredVideo.id} video={featuredVideo} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
