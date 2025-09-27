'use client'

interface MessageTypeIconProps {
  type: 'text' | 'image' | 'video' | 'template' | 'flex' | 'carousel' | 'audio'
  size?: 'sm' | 'md' | 'lg'
}

const typeConfig = {
  text: { icon: '📝', label: 'テキスト' },
  image: { icon: '🖼️', label: '画像' },
  video: { icon: '🎬', label: '動画' },
  template: { icon: '📋', label: 'テンプレート' },
  flex: { icon: '🎨', label: 'フレックス' },
  carousel: { icon: '🎠', label: 'カルーセル' },
  audio: { icon: '🎵', label: '音声' }
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl'
}

export function MessageTypeIcon({
  type,
  size = 'md'
}: MessageTypeIconProps) {
  const config = typeConfig[type] || typeConfig.text

  return (
    <span
      className={sizeClasses[size]}
      title={config.label}
    >
      {config.icon}
    </span>
  )
}