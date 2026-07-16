'use client'

import { motion } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
	className?: string
	children?: React.ReactNode
	/** 是否为静态定位（不绝对定位） */
	staticLayout?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className, children, staticLayout, ...props }, ref) {
	return (
		<motion.div
			ref={ref}
			{...props}
			className={cn('card', staticLayout && 'static', className)}>
			{children}
		</motion.div>
	)
})
