'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useAuthStore } from '@/hooks/use-auth'
import { Card } from './card'

interface AuthGateProps {
	children: React.ReactNode
}

/**
 * 认证守卫：未认证时强制要求先导入 GitHub App 私钥
 * 认证后才会渲染 children。
 */
export function AuthGate({ children }: AuthGateProps) {
	const { isAuth, setPrivateKey, refreshAuthState } = useAuthStore()
	const [hydrated, setHydrated] = useState(false)
	const [importing, setImporting] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		setHydrated(true)
		void refreshAuthState()
	}, [refreshAuthState])

	const handleChoosePrivateKey = async (file: File) => {
		try {
			setImporting(true)
			const text = await file.text()
			await setPrivateKey(text)
			toast.success('密钥导入成功')
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		} finally {
			setImporting(false)
		}
	}

	if (!hydrated) {
		return (
			<div className='flex min-h-[60vh] items-center justify-center text-sm text-secondary'>加载中...</div>
		)
	}

	if (!isAuth) {
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

				<div className='flex min-h-[70vh] items-center justify-center px-6 py-24'>
					<Card className='relative w-full max-w-[520px] p-8 text-center' staticLayout>
						<div className='mb-4 flex justify-center'>
							<div className='bg-brand/10 flex h-16 w-16 items-center justify-center rounded-full'>
								<svg
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='1.5'
									strokeLinecap='round'
									strokeLinejoin='round'
									className='text-brand h-8 w-8'>
									<rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
									<path d='M7 11V7a5 5 0 0 1 10 0v4' />
								</svg>
							</div>
						</div>

						<h1 className='mb-2 text-2xl font-semibold'>需要先导入密钥</h1>
						<p className='text-secondary mx-auto mb-6 max-w-[360px] text-sm leading-relaxed'>
							管理页面用于直接修改仓库内容，需要先导入 GitHub App 私钥（.pem）才能进行操作。
						</p>

						<motion.button
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							disabled={importing}
							onClick={() => keyInputRef.current?.click()}
							className='brand-btn mx-auto px-8 disabled:opacity-60'>
							{importing ? '导入中...' : '导入私钥'}
						</motion.button>

						<p className='text-secondary mt-6 text-xs leading-relaxed'>
							密钥仅保存在当前浏览器 session 中，不会上传到服务器。
						</p>
					</Card>
				</div>
			</>
		)
	}

	return <>{children}</>
}
