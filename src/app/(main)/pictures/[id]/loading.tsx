// app/picture/[id]/loading.tsx
import { CircularProgress } from '@nextui-org/react'

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <CircularProgress size="lg" color="primary" aria-label="Loading..." />
    </div>
  )
}
