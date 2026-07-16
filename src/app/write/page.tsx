'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * /write 入口已迁移到管理后台 /admin/blogs/write
 * 这里保留是为了避免直接访问 /write 路径返回 404。
 */
export default function WriteRedirect() {
	const router = useRouter()

	useEffect(() => {
		router.replace('/admin/blogs/write')
	}, [router])

	return <div className='text-secondary flex min-h-[60vh] items-center justify-center text-sm'>已迁移到管理后台，正在跳转...</div>
}
