'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

/**
 * /write/[slug] 入口已迁移到管理后台 /admin/blogs/write/[slug]
 */
export default function EditBlogRedirect() {
	const router = useRouter()
	const params = useParams() as { slug?: string }
	const slug = params?.slug || ''

	useEffect(() => {
		if (slug) {
			router.replace(`/admin/blogs/write/${slug}`)
		} else {
			router.replace('/admin/blogs/write')
		}
	}, [router, slug])

	return <div className='text-secondary flex min-h-[60vh] items-center justify-center text-sm'>已迁移到管理后台，正在跳转...</div>
}
