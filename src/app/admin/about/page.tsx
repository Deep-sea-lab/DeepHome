'use client'

import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { pushAbout, type AboutData } from './services/push-about'
import { useAuthStore } from '@/hooks/use-auth'
import LikeButton from '@/components/like-button'
import GithubSVG from '@/svgs/github.svg'
import initialData from './list.json'
import { Card } from '@/app/admin/_components/card'

export default function Page() {
	const [data, setData] = useState<AboutData>(initialData as AboutData)
	const [originalData, setOriginalData] = useState<AboutData>(initialData as AboutData)
	const [isSaving, setIsSaving] = useState(false)
	const [isPreviewMode, setIsPreviewMode] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const { content, loading } = useMarkdownRender(data.content)

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			toast.success('密钥导入成功')
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			handleSave()
		}
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushAbout(data)

			setOriginalData(data)
			setIsPreviewMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setData(originalData)
		setIsPreviewMode(false)
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handleChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<Card className='static p-4' staticLayout>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<div>
						<h2 className='text-lg font-semibold'>关于页面管理</h2>
						<p className='text-secondary mt-1 text-sm'>编辑关于网站页面内容。</p>
					</div>
					<div className='flex items-center gap-2'>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='admin-btn disabled:opacity-60'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsPreviewMode(prev => !prev)}
							disabled={isSaving}
							className='admin-btn'>
							{isPreviewMode ? '继续编辑' : '预览'}
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleSaveClick}
							disabled={isSaving}
							className='brand-btn px-6 disabled:opacity-60'>
							{isSaving ? '保存中...' : buttonText}
						</motion.button>
					</div>
				</div>
			</Card>

			<Card className='static p-6' staticLayout>
				{isPreviewMode ? (
					<div className='space-y-6'>
						<div className='text-center'>
							<h1 className='mb-4 text-4xl font-bold'>{data.title || '标题预览'}</h1>
							<p className='text-secondary text-lg'>{data.description || '描述预览'}</p>
						</div>

						{loading ? (
							<div className='text-secondary text-center'>预览渲染中...</div>
						) : (
							<div className='card relative p-6'>
								<div className='prose prose-sm max-w-none'>{content}</div>
							</div>
						)}
					</div>
				) : (
					<div className='space-y-6'>
						<div className='space-y-4'>
							<input
								type='text'
								placeholder='标题'
								className='w-full rounded-lg border px-4 py-3 text-center text-2xl font-bold'
								value={data.title}
								onChange={e => setData({ ...data, title: e.target.value })}
							/>
							<input
								type='text'
								placeholder='描述'
								className='w-full rounded-lg border px-4 py-3 text-center text-lg'
								value={data.description}
								onChange={e => setData({ ...data, description: e.target.value })}
							/>
						</div>

						<div className='card relative static'>
							<textarea
								placeholder='Markdown 内容'
								className='min-h-[400px] w-full resize-none text-sm'
								value={data.content}
								onChange={e => setData({ ...data, content: e.target.value })}
							/>
						</div>
					</div>
				)}

				<div className='mt-8 flex items-center justify-center gap-6'>
					<motion.a
						href='https://github.com/YYsuni/2025-blog-public'
						target='_blank'
						rel='noreferrer'
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0 }}
						className='bg-card flex h-[53px] w-[53px] items-center justify-center rounded-full border'>
						<GithubSVG />
					</motion.a>

					<LikeButton slug='open-source' delay={0} />
				</div>
			</Card>
		</>
	)
}
