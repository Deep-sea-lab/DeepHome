'use client'

import { useEffect, useState } from 'react'
import initialList from './list.json'

const getRandomSnippet = (list: string[]) => (list.length === 0 ? '' : list[Math.floor(Math.random() * list.length)])

export default function Page() {
	const [currentSnippet, setCurrentSnippet] = useState<string>(getRandomSnippet(initialList as string[]))

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSnippet(getRandomSnippet(initialList as string[]))
		}, 60_000)
		return () => clearInterval(interval)
	}, [])

	return (
		<div className='flex min-h-[70vh] flex-col items-center justify-center px-6 py-24'>
			<div className='w-full max-w-3xl text-center'>
				<p className='text-2xl leading-relaxed font-semibold'>{currentSnippet || '无'}</p>
			</div>
		</div>
	)
}
