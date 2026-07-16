'use client'

import { useMarkdownRender } from '@/hooks/use-markdown-render'
import LikeButton from '@/components/like-button'
import GithubSVG from '@/svgs/github.svg'
import initialData from './list.json'

export default function Page() {
	const { content, loading } = useMarkdownRender(initialData.content)

	return (
		<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12 max-sm:px-0'>
			<div className='w-full max-w-[800px]'>
				<div className='mb-12 text-center'>
					<h1 className='mb-4 text-4xl font-bold'>{initialData.title}</h1>
					<p className='text-secondary text-lg'>{initialData.description}</p>
				</div>

				{loading ? (
					<div className='text-secondary text-center'>加载中...</div>
				) : (
					<div className='card relative p-6'>
						<div className='prose prose-sm max-w-none'>{content}</div>
					</div>
				)}

				<div className='mt-8 flex items-center justify-center gap-6'>
					<a
						href='https://github.com/YYsuni/2025-blog-public'
						target='_blank'
						rel='noreferrer'
						className='bg-card flex h-[53px] w-[53px] items-center justify-center rounded-full border'>
						<GithubSVG />
					</a>

					<LikeButton slug='open-source' />
				</div>
			</div>
		</div>
	)
}
