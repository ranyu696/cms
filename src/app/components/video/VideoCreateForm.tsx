import {
  Button,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react'
import { type Video } from '@prisma/client'
import { Link, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'

interface VideoCreateFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type VideoFormData = Omit<Video, 'id' | 'createdAt' | 'updatedAt' | 'views'>

export const VideoCreateForm: React.FC<VideoCreateFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: null,
    coverUrl: '',
    playUrl: '',
    categoryId: 0,
    isActive: true,
    playerType: 'default',
    externalId: null,
  })
  const [imageUploadType, setImageUploadType] = useState<'local' | 'remote'>(
    'remote',
  )
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const { data: categories } = api.category.getByType.useQuery({
    type: 'Video',
  })
  const createVideoMutation = api.video.create.useMutation()

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const data = (await response.json()) as Video
      setFormData((prev) => ({ ...prev, coverUrl: data.coverUrl }))
      setPreviewImage(data.coverUrl)
      toast.success('封面图片上传成功')
    } catch (error) {
      console.error('图片上传失败:', error)
      toast.error('封面图片上传失败，请重试')
    }
  }

  const handleRemoteImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, coverUrl: url }))
    setPreviewImage(url)
  }

  const handleSubmit = async () => {
    try {
      await createVideoMutation.mutateAsync(formData)
      toast.success('视频创建成功')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('保存视频失败:', error)
      toast.error('保存视频失败，请重试')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        <ModalHeader>创建新视频</ModalHeader>
        <ModalBody>
          <Input
            label="标题"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Textarea
            label="描述"
            value={formData.description ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value || null })
            }
          />
          <Input
            label="播放链接"
            value={formData.playUrl}
            onChange={(e) =>
              setFormData({ ...formData, playUrl: e.target.value })
            }
            required
          />
          <div className="mb-4 flex justify-between">
            <Button
              color={imageUploadType === 'local' ? 'primary' : 'default'}
              onClick={() => setImageUploadType('local')}
              startContent={<Upload size={16} />}
            >
              上传本地图片
            </Button>
            <Button
              color={imageUploadType === 'remote' ? 'primary' : 'default'}
              onClick={() => setImageUploadType('remote')}
              startContent={<Link size={16} />}
            >
              使用远程链接
            </Button>
          </div>
          {imageUploadType === 'local' ? (
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleImageUpload(file)
              }}
            />
          ) : (
            <Input
              label="远程图片链接"
              value={formData.coverUrl}
              onChange={(e) => handleRemoteImageChange(e.target.value)}
              placeholder="请输入图片URL"
            />
          )}
          {previewImage && (
            <div className="mt-4">
              <Image
                src={previewImage}
                alt="封面预览"
                width={200}
                height={112}
              />
            </div>
          )}
          <Select
            label="分类"
            selectedKeys={[formData.categoryId.toString()]}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string
              setFormData((prev) => ({
                ...prev,
                categoryId: parseInt(selectedKey),
              }))
            }}
            required
          >
            {categories ? (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" key="loading">
                加载中...
              </SelectItem>
            )}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={() => void handleSubmit()}>
            创建
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
