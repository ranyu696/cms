import { type Prisma, type Video } from '@prisma/client'
import { unlink } from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const videoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, '标题不能为空'),
        description: z.string().nullable(),
        coverUrl: z.string(),
        playUrl: z.string().url('播放URL格式不正确'),
        categoryId: z.number().positive('分类ID必须是正数'),
        isActive: z.boolean().default(true),
        playerType: z.string().default('dplayer'),
        externalId: z.string().optional().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.video.create({ data: input })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().positive(),
        title: z.string().min(1, '标题不能为空'),
        description: z.string().nullable(),
        coverUrl: z.string(),
        playUrl: z.string().url('播放URL格式不正确'),
        categoryId: z.number().positive('分类ID必须是正数'),
        isActive: z.boolean().optional(),
        playerType: z.string().optional(),
        externalId: z.string().optional().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.video.update({ where: { id }, data })
    }),

  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        perPage: z.number().int().positive().default(10),
        categoryId: z.number().positive().optional(),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        sortBy: z.enum(['createdAt', 'views', 'title']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, categoryId, search, isActive, sortBy, sortOrder } =
        input
      const skip = (page - 1) * perPage

      const where: Prisma.VideoWhereInput = {
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(isActive !== undefined && { isActive }),
      }

      const orderBy: Prisma.VideoOrderByWithRelationInput = {
        [sortBy ?? 'createdAt']: sortOrder ?? 'desc',
      }

      const [videos, totalCount] = await Promise.all([
        ctx.db.video.findMany({
          where,
          include: { category: true },
          skip,
          take: perPage,
          orderBy,
        }),
        ctx.db.video.count({ where }),
      ])

      return { videos, totalCount, totalPages: Math.ceil(totalCount / perPage) }
    }),

  toggleActive: protectedProcedure
    .input(
      z.object({
        id: z.number().positive(),
        isActive: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.video.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })
    }),

  getById: publicProcedure
    .input(z.number().positive())
    .query(({ ctx, input }) => {
      return ctx.db.video.findUnique({
        where: { id: input },
        include: { category: true },
      })
    }),

  getRelatedVideos: publicProcedure
    .input(
      z.object({
        videoId: z.number().positive(),
        limit: z.number().int().positive().default(4),
      }),
    )
    .query(async ({ ctx, input }) => {
      const video = await ctx.db.video.findUnique({
        where: { id: input.videoId },
        include: { category: true },
      })

      if (!video) throw new Error('找不到视频')

      const relatedVideos = await ctx.db.$queryRaw<Video[]>`
        SELECT * FROM "Video"
        WHERE "categoryId" = ${video.categoryId}
          AND "id" != ${video.id}
          AND "isActive" = true
        ORDER BY RANDOM()
        LIMIT ${input.limit}
      `

      return relatedVideos
    }),

  getFeaturedVideos: publicProcedure
    .input(z.object({ limit: z.number().int().positive().default(4) }))
    .query(async ({ ctx, input }) => {
      const featuredVideos = await ctx.db.$queryRaw<Video[]>`
        SELECT * FROM "Video"
        WHERE "isActive" = true
        ORDER BY "views" DESC, RANDOM()
        LIMIT ${input.limit}
      `

      return featuredVideos
    }),

  incrementViews: publicProcedure
    .input(z.number().positive())
    .mutation(({ ctx, input }) => {
      return ctx.db.video.update({
        where: { id: input },
        data: {
          views: { increment: 1 },
        },
      })
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number().positive()),
        categoryId: z.number().positive(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.video.updateMany({
        where: { id: { in: input.ids } },
        data: { categoryId: input.categoryId },
      })
    }),

  delete: protectedProcedure
    .input(z.number().positive())
    .mutation(async ({ ctx, input }) => {
      const video = await ctx.db.video.findUnique({
        where: { id: input },
        select: { coverUrl: true },
      })

      if (video?.coverUrl) {
        const filePath = path.join(process.cwd(), 'public', video.coverUrl)
        try {
          await unlink(filePath)
        } catch (error) {
          console.error(`删除封面文件失败: ${filePath}`, error)
        }
      }

      return ctx.db.video.delete({ where: { id: input } })
    }),

  deleteMany: protectedProcedure
    .input(z.array(z.number().positive()))
    .mutation(async ({ ctx, input }) => {
      const videos = await ctx.db.video.findMany({
        where: { id: { in: input } },
        select: { id: true, coverUrl: true },
      })

      for (const video of videos) {
        if (video.coverUrl) {
          const filePath = path.join(process.cwd(), 'public', video.coverUrl)
          try {
            await unlink(filePath)
          } catch (error) {
            console.error(`删除封面文件失败: ${filePath}`, error)
          }
        }
      }

      return ctx.db.video.deleteMany({ where: { id: { in: input } } })
    }),
})
