'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { useMemo } from 'react'
import { useAuthStore } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface NavItem {
	href: string
	label: string
	description?: string
	icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
	{
		href: '/admin',
		label: '总览',
		description: '管理入口',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<rect x='3' y='3' width='7' height='9' rx='1' />
				<rect x='14' y='3' width='7' height='5' rx='1' />
				<rect x='14' y='12' width='7' height='9' rx='1' />
				<rect x='3' y='16' width='7' height='5' rx='1' />
			</svg>
		)
	},
	{
		href: '/admin/config',
		label: '网站配置',
		description: '站点信息、主题色、首页布局',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<circle cx='12' cy='12' r='3' />
				<path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
			</svg>
		)
	},
	{
		href: '/admin/blogs',
		label: '博客管理',
		description: '管理文章分类、批量删除',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20' />
				<path d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' />
			</svg>
		)
	},
	{
		href: '/admin/blogs/write',
		label: '写文章',
		description: '发布新文章或编辑现有文章',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<path d='M12 20h9' />
				<path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' />
			</svg>
		)
	},
	{
		href: '/admin/snippets',
		label: '句子管理',
		description: '编辑首页随机句子',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
			</svg>
		)
	},
	{
		href: '/admin/shares',
		label: '推荐分享',
		description: '管理推荐资源分享',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<circle cx='18' cy='5' r='3' />
				<circle cx='6' cy='12' r='3' />
				<circle cx='18' cy='19' r='3' />
				<line x1='8.59' y1='13.51' x2='15.42' y2='17.49' />
				<line x1='15.41' y1='6.51' x2='8.59' y2='10.49' />
			</svg>
		)
	},
	{
		href: '/admin/projects',
		label: '项目管理',
		description: '编辑个人项目展示',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<polyline points='16 18 22 12 16 6' />
				<polyline points='8 6 2 12 8 18' />
			</svg>
		)
	},
	{
		href: '/admin/pictures',
		label: '图片管理',
		description: '上传、删除图片',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
				<circle cx='8.5' cy='8.5' r='1.5' />
				<polyline points='21 15 16 10 5 21' />
			</svg>
		)
	},
	{
		href: '/admin/bloggers',
		label: '优秀博客',
		description: '管理优秀博客列表',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
				<circle cx='9' cy='7' r='4' />
				<path d='M23 21v-2a4 4 0 0 0-3-3.87' />
				<path d='M16 3.13a4 4 0 0 1 0 7.75' />
			</svg>
		)
	},
	{
		href: '/admin/about',
		label: '关于页面',
		description: '编辑关于网站页面',
		icon: (
			<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='h-5 w-5'>
				<circle cx='12' cy='12' r='10' />
				<line x1='12' y1='16' x2='12' y2='12' />
				<line x1='12' y1='8' x2='12.01' y2='8' />
			</svg>
		)
	}
]

export function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const { clearAuth } = useAuthStore()

	const activeHref = useMemo(() => {
		// 精确匹配优先；子路径回退到父级
		const exact = NAV_ITEMS.find(item => item.href === pathname)
		if (exact) return exact.href
		// 找出最长前缀匹配的 nav item
		const matched = NAV_ITEMS.filter(item => item.href !== '/admin' && pathname?.startsWith(item.href)).sort((a, b) => b.href.length - a.href.length)
		if (matched.length > 0) return matched[0].href
		// 写文章子页面高亮"写文章"
		if (pathname?.startsWith('/admin/blogs/write')) return '/admin/blogs/write'
		return '/admin'
	}, [pathname])

	const handleLogout = () => {
		clearAuth()
		toast.info('已退出管理状态')
	}

	return (
		<div className='mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pt-20 pb-16 max-sm:px-4 max-sm:pt-20'>
			<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-semibold'>管理后台</h1>
					<p className='text-secondary mt-1 text-sm'>所有对仓库内容的修改都在这里进行</p>
				</div>
				<motion.button
					whileHover={{ scale: 1.03 }}
					whileTap={{ scale: 0.97 }}
					onClick={handleLogout}
					className='admin-btn backdrop-blur-sm'>
					退出管理
				</motion.button>
			</motion.div>

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]'>
				<aside className='admin-card h-fit p-4 max-sm:p-3'>
					<nav className='flex flex-col gap-1'>
						{NAV_ITEMS.map(item => {
							const isActive = item.href === activeHref
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
										isActive
											? 'bg-brand/10 text-brand font-medium'
											: 'text-secondary hover:bg-white/60 hover:text-primary'
									)}>
									<span
										className={cn(
											'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
											isActive ? 'bg-brand/15 text-brand' : 'bg-white/60 text-secondary group-hover:text-primary'
										)}>
										{item.icon}
									</span>
									<span className='flex-1'>{item.label}</span>
								</Link>
							)
						})}
					</nav>
				</aside>

				<section className='min-w-0'>{children}</section>
			</div>
		</div>
	)
}
