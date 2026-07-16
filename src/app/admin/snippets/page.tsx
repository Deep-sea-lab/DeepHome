'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import initialList from './list.json'
import { pushSnippets } from './services/push-snippets'
import { Card } from '@/app/admin/_components/card'

const getRandomSnippet = (list: string[]) => (list.length === 0 ? '' : list[Math.floor(Math.random() * list.length)])

export default function Page() {
	const [snippets, setSnippets] = useState<string[]>(initialList as string[])
	const [originalSnippets, setOriginalSnippets] = useState<string[]>(initialList as string[])
	const [currentSnippet, setCurrentSnippet] = useState<string>(getRandomSnippet(initialList as string[]))
	const [isEditMode, setIsEditMode] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [isManageOpen, setIsManageOpen] = useState(false)
	const [draftSnippets, setDraftSnippets] = useState<string[]>([])
	const [newSnippet, setNewSnippet] = useState('')
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()

	const handleSave = async () => {
		setIsSaving(true)
		try {
			await pushSnippets({ snippets })
			setOriginalSnippets(snippets)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save snippets:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			void handleSave()
		}
	}

	const handleCancel = () => {
		setSnippets(originalSnippets)
	}

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			await setPrivateKey(text)
			toast.success('密钥导入成功')
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const openManageDialog = () => {
		setDraftSnippets(snippets)
		setNewSnippet('')
		setIsManageOpen(true)
	}

	const handleAddDraft = () => {
		const value = newSnippet.trim()
		if (!value) {
			toast.error('请输入句子')
			return
		}
		setDraftSnippets(prev => [...prev, value])
		setNewSnippet('')
	}

	const handleRemoveDraft = (index: number) => {
		setDraftSnippets(prev => prev.filter((_, i) => i !== index))
	}

	const applyManageChanges = () => {
		const cleaned = draftSnippets.map(item => item.trim()).filter(Boolean)
		if (cleaned.length === 0) {
			toast.error('请至少添加一句话')
			return
		}
		setSnippets(cleaned)
		setIsManageOpen(false)
		toast.success('已更新列表')
	}

	const cancelManageChanges = () => {
		setIsManageOpen(false)
		setDraftSnippets([])
		setNewSnippet('')
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
					const file = e.target.files?.[0]
					if (file) await handleChoosePrivateKey(file)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<Card className='static space-y-4 p-5' staticLayout>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<div>
						<h2 className='text-lg font-semibold'>句子管理</h2>
						<p className='text-secondary mt-1 text-sm'>编辑首页随机显示的句子。</p>
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
							onClick={openManageDialog}
							className='admin-btn'>
							管理
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

				<div className='admin-inner text-center'>
					<p className='text-secondary mb-1 text-xs'>当前随机句子：</p>
					<p className='text-xl leading-relaxed font-semibold'>{currentSnippet || '无'}</p>
				</div>

				<div className='space-y-2'>
					<p className='text-secondary text-xs'>所有句子（{snippets.length}）</p>
					<div className='max-h-[420px] space-y-1 overflow-y-auto admin-inner p-2 text-sm'>
						{snippets.length === 0 && <p className='text-secondary py-6 text-center'>暂无句子</p>}
						{snippets.map((item, index) => (
							<div key={`${item}-${index}`} className='rounded-lg px-3 py-2'>
								<p className='leading-relaxed text-gray-800'>{item}</p>
							</div>
						))}
					</div>
				</div>
			</Card>

			<DialogModal open={isManageOpen} onClose={cancelManageChanges} className='w-[520px] max-sm:w-full'>
				<div className='space-y-4'>
					<div className='flex items-center gap-3'>
						<input
							type='text'
							value={newSnippet}
							onChange={e => setNewSnippet(e.target.value)}
							placeholder='新增'
							className='admin-input flex-1'
						/>
						<button onClick={handleAddDraft} className='brand-btn flex items-center gap-1 px-4 py-2 text-sm'>
							<Plus className='h-4 w-4' />
							新增
						</button>
					</div>

					<div className='max-h-[320px] space-y-2 overflow-y-auto pr-1'>
						{draftSnippets.length === 0 && <p className='text-secondary py-6 text-center text-sm'>暂无内容</p>}
						{draftSnippets.map((item, index) => (
							<div key={`${item}-${index}`} className='group flex items-start gap-3 rounded-lg px-3 py-2 text-sm'>
								<p className='flex-1 leading-relaxed text-gray-800'>{item}</p>
								<button onClick={() => handleRemoveDraft(index)} className='text-gray-400 transition-colors hover:text-red-500'>
									<X className='h-4 w-4' />
								</button>
							</div>
						))}
					</div>

					<div className='mt-4 flex gap-3'>
						<button
							onClick={cancelManageChanges}
							className='admin-btn flex-1'>
							取消
						</button>
						<button onClick={applyManageChanges} className='admin-btn-primary flex-1 justify-center'>
							保存
						</button>
					</div>
				</div>
			</DialogModal>
		</>
	)
}
