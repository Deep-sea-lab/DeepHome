'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { motion } from 'motion/react'

dayjs.extend(weekOfYear)
import { useEffect, useMemo, useState } from 'react'
import { INIT_DELAY } from '@/consts'
import ShortLineSVG from '@/svgs/short-line.svg'
import { useBlogIndex, type BlogIndexItem } from '@/hooks/use-blog-index'
import { useCategories } from '@/hooks/use-categories'
import { useReadArticles } from '@/hooks/use-read-articles'
import JuejinSVG from '@/svgs/juejin.svg'
import { cn } from '@/lib/utils'
import { BlogCoverHoverPreview, useBlogCoverHover } from './components/blog-cover-hover'

type DisplayMode = 'day' | 'week' | 'month' | 'year' | 'category'

export default function BlogPage() {
	const { items, loading } = useBlogIndex()
	const { categories: categoriesFromServer } = useCategories()
	const { isRead } = useReadArticles()

	const [displayMode, setDisplayMode] = useState<DisplayMode>('year')
	const [categoryList, setCategoryList] = useState<string[]>([])

	const { cancelCoverPreview, onCoverLinkMouseEnter, hoverCoverPreview, mousePosition } = useBlogCoverHover(false)

	useEffect(() => {
		setCategoryList(categoriesFromServer || [])
	}, [categoriesFromServer])

	const displayItems = items

	const { groupedItems, groupKeys, getGroupLabel } = useMemo(() => {
		const sorted = [...displayItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

		const grouped = sorted.reduce(
			(acc, item) => {
				let key: string
				let label: string
				const date = dayjs(item.date)

				switch (displayMode) {
					case 'category':
						key = item.category || '未分类'
						label = key
						break
					case 'day':
						key = date.format('YYYY-MM-DD')
						label = date.format('YYYY年MM月DD日')
						break
					case 'week':
						const week = date.week()
						key = `${date.format('YYYY')}-W${week.toString().padStart(2, '0')}`
						label = `${date.format('YYYY')}年第${week}周`
						break
					case 'month':
						key = date.format('YYYY-MM')
						label = date.format('YYYY年MM月')
						break
					case 'year':
					default:
						key = date.format('YYYY')
						label = date.format('YYYY年')
						break
				}

				if (!acc[key]) {
					acc[key] = { items: [], label }
				}
				acc[key].items.push(item)
				return acc
			},
			{} as Record<string, { items: BlogIndexItem[]; label: string }>
		)

		const keys = Object.keys(grouped).sort((a, b) => {
			if (displayMode === 'category') {
				const categoryOrder = new Map(categoryList.map((c, index) => [c, index]))
				const aOrder = categoryOrder.has(a) ? categoryOrder.get(a)! : Number.MAX_SAFE_INTEGER
				const bOrder = categoryOrder.has(b) ? categoryOrder.get(b)! : Number.MAX_SAFE_INTEGER
				if (aOrder !== bOrder) return aOrder - bOrder
				return a.localeCompare(b)
			}
			if (displayMode === 'week') {
				const [yearA, weekA] = a.split('-W').map(Number)
				const [yearB, weekB] = b.split('-W').map(Number)
				if (yearA !== yearB) return yearB - yearA
				return weekB - weekA
			}
			return b.localeCompare(a)
		})

		return {
			groupedItems: grouped,
			groupKeys: keys,
			getGroupLabel: (key: string) => grouped[key]?.label || key
		}
	}, [displayItems, displayMode, categoryList])

	return (
		<div className='flex flex-col items-center justify-center gap-6 px-6 pt-24 max-sm:pt-24' onMouseLeave={cancelCoverPreview}>
			{items.length > 0 && (
				<motion.div
					initial={{ opacity: 0, scale: 0.6 }}
					animate={{ opacity: 1, scale: 1 }}
					className='card btn-rounded relative mx-auto flex items-center gap-1 p-1 max-sm:hidden'>
					{[
						{ value: 'day', label: '日' },
						{ value: 'week', label: '周' },
						{ value: 'month', label: '月' },
						{ value: 'year', label: '年' }
					].map(option => (
						<motion.button
							key={option.value}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setDisplayMode(option.value as DisplayMode)}
							className={cn(
								'btn-rounded px-3 py-1.5 text-xs font-medium transition-all',
								displayMode === option.value ? 'bg-brand text-white shadow-sm' : 'text-secondary hover:text-brand hover:bg-white/60'
							)}>
							{option.label}
						</motion.button>
					))}
				</motion.div>
			)}

			{groupKeys.map(groupKey => {
				const group = groupedItems[groupKey]
				if (!group) return null

				return (
					<motion.div
						onMouseLeave={cancelCoverPreview}
						key={groupKey}
						initial={{ opacity: 0, scale: 0.95 }}
						whileInView={{ opacity: 1, scale: 1 }}
						transition={{ delay: INIT_DELAY / 2 }}
						className='card relative w-full max-w-[840px] space-y-6'>
						<div className='mb-3 flex items-center justify-between gap-3 text-base'>
							<div className='flex items-center gap-3'>
								<div className='font-medium'>{getGroupLabel(groupKey)}</div>
								<div className='h-2 w-2 rounded-full bg-[#D9D9D9]'></div>
								<div className='text-secondary text-sm'>{group.items.length} 篇文章</div>
							</div>
						</div>
						<div>
							{group.items.map(it => {
								const hasRead = isRead(it.slug)
								return (
									<Link
										onMouseEnter={() => onCoverLinkMouseEnter(it.cover)}
										onMouseLeave={cancelCoverPreview}
										href={`/blog/${it.slug}`}
										key={it.slug}
										className='group flex min-h-10 cursor-pointer items-center gap-3 py-3 transition-all'>
										<span className='text-secondary w-[44px] shrink-0 text-sm font-medium'>{dayjs(it.date).format('MM-DD')}</span>

										<div className='relative flex h-2 w-2 items-center justify-center'>
											<div className='bg-secondary group-hover:bg-brand h-[5px] w-[5px] rounded-full transition-all group-hover:h-4'></div>
											<ShortLineSVG className='absolute bottom-4' />
										</div>
										<div className='flex-1 truncate text-sm font-medium transition-all group-hover:translate-x-2 group-hover:text-brand'>
											{it.title || it.slug}
											{hasRead && <span className='text-secondary ml-2 text-xs'>[已阅读]</span>}
										</div>
										<div className='flex flex-wrap items-center gap-2 max-sm:hidden'>
											{(it.tags || []).map(t => (
												<span key={t} className='text-secondary text-sm'>
													#{t}
												</span>
											))}
										</div>
									</Link>
								)
							})}
						</div>
					</motion.div>
				)
			})}
			{items.length > 0 && (
				<div className='text-center'>
					<a
						href='https://juejin.cn/user/24214318016242382/posts'
						target='_blank'
						rel='noreferrer'
						className='card text-secondary static inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs'>
						<JuejinSVG className='h-4 w-4' />
						更多
					</a>
				</div>
			)}
			<div className='pt-12'>
				{!loading && items.length === 0 && <div className='text-secondary py-6 text-center text-sm'>暂无文章</div>}
				{loading && <div className='text-secondary py-6 text-center text-sm'>加载中...</div>}
			</div>

			<BlogCoverHoverPreview preview={hoverCoverPreview} position={mousePosition} />
		</div>
	)
}
