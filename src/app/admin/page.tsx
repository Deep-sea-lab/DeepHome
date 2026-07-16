'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

interface ModuleItem {
	href: string
	label: string
	description: string
	emoji: string
}

const MODULES: ModuleItem[] = [
	{ href: '/admin/config', label: '网站配置', description: '站点元信息、主题色、首页布局', emoji: '⚙️' },
	{ href: '/admin/blogs', label: '博客管理', description: '管理文章分类、批量删除', emoji: '📚' },
	{ href: '/admin/blogs/write', label: '写文章', description: '发布新文章或编辑现有文章', emoji: '✍️' },
	{ href: '/admin/snippets', label: '句子管理', description: '编辑首页随机句子', emoji: '💬' },
	{ href: '/admin/shares', label: '推荐分享', description: '管理推荐资源分享', emoji: '🔗' },
	{ href: '/admin/projects', label: '项目管理', description: '编辑个人项目展示', emoji: '🛠️' },
	{ href: '/admin/pictures', label: '图片管理', description: '上传、删除图片', emoji: '🖼️' },
	{ href: '/admin/bloggers', label: '优秀博客', description: '管理优秀博客列表', emoji: '👥' },
	{ href: '/admin/about', label: '关于页面', description: '编辑关于网站页面', emoji: '📄' }
]

export default function AdminDashboardPage() {
	return (
		<div className='space-y-6'>
			<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='card static p-6'>
				<h2 className='text-lg font-semibold'>欢迎</h2>
				<p className='text-secondary mt-2 text-sm leading-relaxed'>
					从这里可以管理网站的全部内容，包括文章、分享、项目、图片、博客等。
					每项修改都会以提交的方式推送到 GitHub 仓库，需要等待部署完成才会生效。
				</p>
			</motion.div>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
				{MODULES.map((m, idx) => (
					<motion.div
						key={m.href}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: idx * 0.04 }}>
						<Link
							href={m.href}
							className='card static flex h-full items-start gap-4 p-5 transition-all hover:scale-[1.01] hover:shadow-md'>
							<div className='bg-brand/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl'>{m.emoji}</div>
							<div className='min-w-0 flex-1'>
								<div className='text-base font-medium'>{m.label}</div>
								<p className='text-secondary mt-1 text-sm leading-relaxed'>{m.description}</p>
							</div>
						</Link>
					</motion.div>
				))}
			</div>

			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className='card static p-6 text-sm leading-relaxed'>
				<h3 className='mb-2 font-medium'>使用提示</h3>
				<ul className='text-secondary list-disc space-y-1 pl-5'>
					<li>所有修改都需要先在右上角点击"退出管理"以清除会话密钥</li>
					<li>每次保存都会生成一次 GitHub 提交，请等待部署完成后再刷新页面</li>
					<li>管理页面 URL 不要对外公开，避免被恶意访问</li>
				</ul>
			</motion.div>
		</div>
	)
}
