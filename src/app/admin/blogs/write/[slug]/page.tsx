'use client'

import { useParams, useRouter } from 'next/navigation'
import { useWriteStore } from '../stores/write-store'
import { usePreviewStore } from '../stores/preview-store'
import { useLoadBlog } from '../hooks/use-load-blog'
import { WriteEditor } from '../components/editor'
import { WriteSidebar } from '../components/sidebar'
import { WriteActions } from '../components/actions'
import { WritePreview } from '../components/preview'
import { Card } from '@/app/admin/_components/card'

export default function EditBlogPage() {
	const params = useParams() as { slug?: string }
	const slug = params?.slug || ''
	const router = useRouter()

	const { form, cover } = useWriteStore()
	const { isPreview, closePreview } = usePreviewStore()
	const { loading } = useLoadBlog(slug)

	const coverPreviewUrl = cover ? (cover.type === 'url' ? cover.url : cover.previewUrl) : null

	if (loading) {
		return <div className='text-secondary flex min-h-[40vh] items-center justify-center text-sm'>加载中...</div>
	}

	if (!slug) {
		return <div className='flex min-h-[40vh] items-center justify-center text-sm text-red-500'>无效的博客 ID</div>
	}

	return isPreview ? (
		<WritePreview form={form} coverPreviewUrl={coverPreviewUrl} onClose={closePreview} slug={slug} />
	) : (
		<div className='space-y-6'>
			<Card className='static p-4' staticLayout>
				<div className='flex items-center justify-between gap-3'>
					<div>
						<h2 className='text-lg font-semibold'>编辑文章</h2>
						<p className='text-secondary mt-1 text-sm'>slug：{slug}</p>
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
