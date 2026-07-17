'use client'

import { useEffect, useRef } from 'react'

const SVG_URL = '/images/me.svg'

export default function SvgStrokePage() {
	const stageRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const stage = stageRef.current
		if (!stage) return

		const animations: Animation[] = []
		let cancelled = false

		const init = async () => {
			try {
				const res = await fetch(SVG_URL)
				const text = await res.text()
				const parser = new DOMParser()
				const doc = parser.parseFromString(text, 'image/svg+xml')
				const svg = doc.querySelector('svg')
				if (!svg) {
					stage.textContent = '加载 SVG 失败'
					return
				}

				const cleanup = initSvg(stage, svg, animations)
				if (cancelled) {
					cleanup()
				} else {
					// store cleanup on stage for unmount
					;(stage as unknown as { _cleanup?: () => void })._cleanup = cleanup
				}
			} catch (err) {
				console.error('Failed to load SVG:', err)
				stage.textContent = '加载 SVG 出错'
			}
		}

		init()

		return () => {
			cancelled = true
			animations.forEach(a => a.cancel())
			const cleanup = (stage as unknown as { _cleanup?: () => void })._cleanup
			cleanup?.()
		}
	}, [])

	return (
		<div className='mx-auto flex w-full max-w-2xl flex-col px-4 pt-[20vh]'>
			<div ref={stageRef} className='aspect-square w-full' />
		</div>
	)
}

function initSvg(stage: HTMLElement, svg: SVGElement, animations: Animation[]): () => void {
	stage.innerHTML = ''
	stage.appendChild(svg)

	svg.setAttribute('width', '100%')
	svg.setAttribute('height', '100%')
	svg.style.display = 'block'

	let defs = svg.querySelector('defs')
	if (!defs) {
		defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
		svg.insertBefore(defs, svg.firstChild)
	} else {
		defs.innerHTML = ''
	}

	const originalPaths = Array.from(svg.querySelectorAll('path'))
	const strokePaths: SVGPathElement[] = []
	const maskCircles: SVGCircleElement[] = []

	const resolveFill = (element: Element): string => {
		let el: Element | null = element
		while (el) {
			const fillAttr = el.getAttribute('fill')
			if (fillAttr && fillAttr !== 'none') return fillAttr
			el = el.parentNode as Element | null
		}
		return '#000000'
	}

	originalPaths.forEach((path, i) => {
		const fill = resolveFill(path)
		const len = path.getTotalLength()
		const bbox = path.getBBox()
		const cx = bbox.x + bbox.width / 2
		const cy = bbox.y + bbox.height / 2
		const maxRadius = Math.sqrt(Math.pow(bbox.width, 2) + Math.pow(bbox.height, 2)) * 0.6

		const maskId = 'ink-mask-' + i
		const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask')
		mask.setAttribute('id', maskId)

		const maskBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		maskBg.setAttribute('width', '100%')
		maskBg.setAttribute('height', '100%')
		maskBg.setAttribute('fill', 'black')
		mask.appendChild(maskBg)

		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		circle.setAttribute('cx', String(cx))
		circle.setAttribute('cy', String(cy))
		circle.setAttribute('r', '0px')
		circle.setAttribute('fill', 'white')
		mask.appendChild(circle)
		defs.appendChild(mask)
		maskCircles.push(circle)

		path.style.fill = fill
		path.style.stroke = 'none'
		path.setAttribute('mask', `url(#${maskId})`)

		const strokePath = path.cloneNode(true) as SVGPathElement
		strokePath.removeAttribute('mask')
		strokePath.style.fill = 'none'
		strokePath.style.stroke = fill
		strokePath.style.strokeWidth = '1px'
		;(strokePath as unknown as { _len: number })._len = len
		;(strokePath as unknown as { _maxRadius: number })._maxRadius = maxRadius
		strokePath.style.strokeDasharray = String(len)
		strokePath.style.strokeDashoffset = String(len)

		path.parentNode?.insertBefore(strokePath, path.nextSibling)
		strokePaths.push(strokePath)
	})

	const speed = 2500
	const pauseTime = 50
	const fillTime = 700

	strokePaths.forEach((path, i) => {
		const sp = path as unknown as { _len: number; _maxRadius: number }
		const len = sp._len
		if (!len) return
		const delay = (i % 120) * 8

		const draw = path.animate(
			[{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
			{
				duration: speed,
				delay,
				easing: 'ease-in-out',
				fill: 'forwards'
			}
		)
		animations.push(draw)

		draw.onfinish = () => {
			draw.commitStyles()
			setTimeout(() => {
				const circle = maskCircles[i]
				if (!circle) return
				const fillAnim = circle.animate(
					[{ r: '0px' }, { r: `${sp._maxRadius}px` }],
					{
						duration: fillTime,
						easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
						fill: 'forwards'
					}
				)
				animations.push(fillAnim)
				fillAnim.onfinish = () => fillAnim.commitStyles()
			}, pauseTime)
		}
	})

	return () => {
		animations.forEach(a => a.cancel())
	}
}
