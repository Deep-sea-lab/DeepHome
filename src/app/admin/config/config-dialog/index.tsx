'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { pushSiteContent } from '../push-site-content'
import type { SiteContent, CardStyles } from '@/app/(home)/stores/config-store'
import { SiteSettings, type FileItem, type ArtImageUploads, type BackgroundImageUploads, type SocialButtonImageUploads } from './site-settings'
import { ColorConfig } from './color-config'
import { HomeLayout } from './home-layout'
import { Card } from '@/app/admin/_components/card'

type TabType = 'site' | 'color' | 'layout'

export default function AdminConfigPanel() {
	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent, setSiteContent, cardStyles, setCardStyles, regenerateBubbles } = useConfigStore()
	const [formData, setFormData] = useState<SiteContent>(siteContent)
	const [cardStylesData, setCardStylesData] = useState<CardStyles>(cardStyles)
	const [originalData, setOriginalData] = useState<SiteContent>(siteContent)
	const [originalCardStyles, setOriginalCardStyles] = useState<CardStyles>(cardStyles)
	const [isSaving, setIsSaving] = useState(false)
	const [activeTab, setActiveTab] = useState<TabType>('site')
	const keyInputRef = useRef<HTMLInputElement>(null)
	const [faviconItem, setFaviconItem] = useState<FileItem | null>(null)
	const [avatarItem, setAvatarItem] = useState<FileItem | null>(null)
	const [artImageUploads, setArtImageUploads] = useState<ArtImageUploads>({})
	const [backgroundImageUploads, setBackgroundImageUploads] = useState<BackgroundImageUploads>({})
	const [socialButtonImageUploads, setSocialButtonImageUploads] = useState<SocialButtonImageUploads>({})

	useEffect(() => {
		const current = { ...siteContent }
		const currentCardStyles = { ...cardStyles }
		setFormData(current)
		setCardStylesData(currentCardStyles)
		setOriginalData(current)
		setOriginalCardStyles(currentCardStyles)
		setFaviconItem(null)
		setAvatarItem(null)
		setArtImageUploads({})
		setBackgroundImageUploads({})
		setSocialButtonImageUploads({})
		setActiveTab('site')
	}, [siteContent, cardStyles])

	useEffect(() => {
		return () => {
			if (faviconItem?.type === 'file') {
				URL.revokeObjectURL(faviconItem.previewUrl)
			}
			if (avatarItem?.type === 'file') {
				URL.revokeObjectURL(avatarItem.previewUrl)
			}
			Object.values(artImageUploads).forEach(item => {
				if (item.type === 'file') {
					URL.revokeObjectURL(item.previewUrl)
				}
			})
			Object.values(backgroundImageUploads).forEach(item => {
				if (item.type === 'file') {
					URL.revokeObjectURL(item.previewUrl)
				}
			})
			Object.values(socialButtonImageUploads).forEach(item => {
				if (item.type === 'file') {
					URL.revokeObjectURL(item.previewUrl)
				}
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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
			const originalArtImages = originalData.artImages ?? []
			const currentArtImages = formData.artImages ?? []
			const removedArtImages = originalArtImages.filter(orig => !currentArtImages.some(current => current.id === orig.id))

			const originalBackgroundImages = originalData.backgroundImages ?? []
			const currentBackgroundImages = formData.backgroundImages ?? []
			const removedBackgroundImages = originalBackgroundImages.filter(orig => !currentBackgroundImages.some(current => current.id === orig.id))

			await pushSiteContent(
				formData,
				cardStylesData,
				faviconItem,
				avatarItem,
				artImageUploads,
				removedArtImages,
				backgroundImageUploads,
				removedBackgroundImages,
				socialButtonImageUploads
			)
			setSiteContent(formData)
			setCardStyles(cardStylesData)
			updateThemeVariables(formData.theme)
			setFaviconItem(null)
			setAvatarItem(null)
			setArtImageUploads({})
			setBackgroundImageUploads({})
			setSocialButtonImageUploads({})
			toast.success('保存成功')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		if (faviconItem?.type === 'file') {
			URL.revokeObjectURL(faviconItem.previewUrl)
		}
		if (avatarItem?.type === 'file') {
			URL.revokeObjectURL(avatarItem.previewUrl)
		}
		Object.values(artImageUploads).forEach(item => {
			if (item.type === 'file') {
				URL.revokeObjectURL(item.previewUrl)
			}
		})
		Object.values(backgroundImageUploads).forEach(item => {
			if (item.type === 'file') {
				URL.revokeObjectURL(item.previewUrl)
			}
		})
		Object.values(socialButtonImageUploads).forEach(item => {
			if (item.type === 'file') {
				URL.revokeObjectURL(item.previewUrl)
			}
		})
		setSiteContent(originalData)
		setCardStyles(originalCardStyles)
		regenerateBubbles()
		if (typeof document !== 'undefined') {
			document.title = originalData.meta.title
			const metaDescription = document.querySelector('meta[name="description"]')
			if (metaDescription) {
				metaDescription.setAttribute('content', originalData.meta.description)
			}
		}
		updateThemeVariables(originalData.theme)
		setFaviconItem(null)
		setAvatarItem(null)
		setArtImageUploads({})
		setBackgroundImageUploads({})
		setSocialButtonImageUploads({})
		toast.info('已撤销修改')
	}

	const updateThemeVariables = (theme?: SiteContent['theme']) => {
		if (typeof document === 'undefined' || !theme) return

		const { colorBrand, colorBrandSecondary, colorPrimary, colorSecondary, colorBg, colorBorder, colorCard, colorArticle } = theme

		const root = document.documentElement

		if (colorBrand) root.style.setProperty('--color-brand', colorBrand)
		if (colorBrandSecondary) root.style.setProperty('--color-brand-secondary', colorBrandSecondary)
		if (colorPrimary) root.style.setProperty('--color-primary', colorPrimary)
		if (colorSecondary) root.style.setProperty('--color-secondary', colorSecondary)
		if (colorBg) root.style.setProperty('--color-bg', colorBg)
		if (colorBorder) root.style.setProperty('--color-border', colorBorder)
		if (colorCard) root.style.setProperty('--color-card', colorCard)
		if (colorArticle) root.style.setProperty('--color-article', colorArticle)
	}

	const handlePreview = () => {
		setSiteContent(formData)
		setCardStyles(cardStylesData)
		regenerateBubbles()

		if (typeof document !== 'undefined') {
			document.title = formData.meta.title
			const metaDescription = document.querySelector('meta[name="description"]')
			if (metaDescription) {
				metaDescription.setAttribute('content', formData.meta.description)
			}
		}
		updateThemeVariables(formData.theme)
		toast.info('已应用预览，可前往首页查看效果')
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	const tabs: { id: TabType; label: string }[] = [
		{ id: 'site', label: '网站设置' },
		{ id: 'color', label: '色彩配置' },
		{ id: 'layout', label: '首页布局' }
	]

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
						<h2 className='text-lg font-semibold'>网站配置</h2>
						<p className='text-secondary mt-1 text-sm'>编辑站点元信息、主题色、首页布局、社交按钮等。</p>
					</div>
					<div className='flex flex-wrap items-center gap-2'>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handlePreview}
							className='bg-card rounded-xl border px-4 py-2 text-sm'>
							预览
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='bg-card rounded-xl border px-4 py-2 text-sm disabled:opacity-60'>
							取消
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

			<Card className='static p-2' staticLayout>
				<div className='flex gap-1'>
					{tabs.map(tab => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`relative px-4 py-2 text-sm font-medium transition-colors ${
								activeTab === tab.id ? 'text-brand' : 'text-secondary hover:text-primary'
							}`}>
							{tab.label}
							{activeTab === tab.id && <div className='bg-brand absolute right-0 bottom-0 left-0 h-0.5' />}
						</button>
					))}
				</div>
			</Card>

			<Card className='static p-5' staticLayout>
				{activeTab === 'site' && (
					<SiteSettings
						formData={formData}
						setFormData={setFormData}
						faviconItem={faviconItem}
						setFaviconItem={setFaviconItem}
						avatarItem={avatarItem}
						setAvatarItem={setAvatarItem}
						artImageUploads={artImageUploads}
						setArtImageUploads={setArtImageUploads}
						backgroundImageUploads={backgroundImageUploads}
						setBackgroundImageUploads={setBackgroundImageUploads}
						socialButtonImageUploads={socialButtonImageUploads}
						setSocialButtonImageUploads={setSocialButtonImageUploads}
					/>
				)}
				{activeTab === 'color' && <ColorConfig formData={formData} setFormData={setFormData} />}
				{activeTab === 'layout' && <HomeLayout cardStylesData={cardStylesData} setCardStylesData={setCardStylesData} />}
			</Card>
		</>
	)
}
