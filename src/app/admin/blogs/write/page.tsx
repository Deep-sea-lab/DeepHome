'use client'

import { useWriteStore } from './stores/write-store'
import { usePreviewStore } from './stores/preview-store'
import { WriteEditor } from './components/editor'
import { WriteSidebar } from './components/sidebar'
import { WriteActions } from './components/actions'
import { WritePreview } from './components/preview'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/app/admin/_components/card'

export default function WritePage() {
	const { form, cover, reset } = useWriteStore()
	useEffect(() => reset(), [])
	const { isPreview, closePreview } = usePreviewStore()
	const router = useRouter()

	const coverPreviewUrl = cover ? (cover.type === 'url' ? cover.url : cover.previewUrl) : null

	return isPreview ? (
		<WritePreview form={form} coverPreviewUrl={coverPreviewUrl} onClose={closePreview} />
	) : (
		<div className='space-y-6'>
			<Card className='static p-4' staticLayout>
				<div className='flex items-center justify-between gap-3'>
					<div>
						<h2 className='text-lg font-semibold'>写文章</h2>
						<p className='text-secondary mt-1 text-sm'>填写 slug、标题与 Markdown 内容，配置封面、标签后发布到仓库。</p>
					</div>
					<button
						type='button'
						onClick={() => router.push('/admin/blogs')}
						className='admin-btn px-3 py-1.5 text-xs'>
						返回博客管理
					</button>
				</div>
			</Card>

			<div className='grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]'>
				<div className='min-w-0'>
					<WriteEditor />
				</div>
				<div className='min-w-0'>
					<WriteSidebar />
				</div>
			</div>

			<WriteActions />
		</div>
	)
}
