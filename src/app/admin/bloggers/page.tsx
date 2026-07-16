'use client'

import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import GridView, { type Blogger } from './grid-view'
import CreateDialog from './components/create-dialog'
import { pushBloggers } from './services/push-bloggers'
import { useAuthStore } from '@/hooks/use-auth'
import initialList from './list.json'
import type { AvatarItem } from './components/avatar-upload-dialog'
import { Card } from '@/app/admin/_components/card'

export default function Page() {
	const [bloggers, setBloggers] = useState<Blogger[]>(initialList as Blogger[])
	const [originalBloggers, setOriginalBloggers] = useState<Blogger[]>(initialList as Blogger[])
	const [isSaving, setIsSaving] = useState(false)
	const [editingBlogger, setEditingBlogger] = useState<Blogger | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [avatarItems, setAvatarItems] = useState<Map<string, AvatarItem>>(new Map())
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()

	const handleUpdate = (updatedBlogger: Blogger, oldBlogger: Blogger, avatarItem?: AvatarItem) => {
		setBloggers(prev => prev.map(b => (b.url === oldBlogger.url ? updatedBlogger : b)))
		if (avatarItem) {
			setAvatarItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedBlogger.url, avatarItem)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingBlogger(null)
		setIsCreateDialogOpen(true)
	}

	const handleSaveBlogger = (updatedBlogger: Blogger) => {
		if (editingBlogger) {
			const updated = bloggers.map(b => (b.url === editingBlogger.url ? updatedBlogger : b))
			setBloggers(updated)
		} else {
			setBloggers([...bloggers, updatedBlogger])
		}
	}

	const handleDelete = (blogger: Blogger) => {
		if (confirm(`确定要删除 ${blogger.name} 吗？`)) {
			setBloggers(bloggers.filter(b => b.url !== blogger.url))
		}
	}

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
			await pushBloggers({
				bloggers,
				avatarItems
			})

			setOriginalBloggers(bloggers)
			setAvatarItems(new Map())
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setBloggers(originalBloggers)
		setAvatarItems(new Map())
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
						<h2 className='text-lg font-semibold'>优秀博客管理</h2>
						<p className='text-secondary mt-1 text-sm'>编辑优秀博客列表。</p>
					</div>
					<div className='flex items-center gap-2'>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-4 py-2 text-sm disabled:opacity-60'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleAdd}
							className='rounded-xl border bg-white/60 px-4 py-2 text-sm'>
							添加
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

			<GridView bloggers={bloggers} isEditMode={true} onUpdate={handleUpdate} onDelete={handleDelete} />

			{isCreateDialogOpen && <CreateDialog blogger={editingBlogger} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveBlogger} />}
		</>
	)
}
