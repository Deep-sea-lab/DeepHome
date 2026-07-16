'use client'

import type { ReactNode } from 'react'

type CardKey = string

interface HomeDraggableLayerProps {
	cardKey: CardKey
	x: number
	y: number
	width?: number
	height?: number
	children: ReactNode
}

/**
 * 首页卡片包装组件（仅作占位，不再支持编辑/拖拽功能）。
 * 所有需要调整布局的入口都已迁移到管理后台。
 */
export function HomeDraggableLayer({ children }: HomeDraggableLayerProps) {
	return <>{children}</>
}
