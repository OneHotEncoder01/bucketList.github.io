import { useEffect, useState } from 'react'

import { getBoard } from '../api/boards'

const emptyPosition = { x: 0, y: 0 }

const normalizeNode = (node, index = 0) => {
	if (!node || typeof node !== 'object') return null
	const id = String(node.id ?? `ach-${index}`)
	const data = node.data && typeof node.data === 'object' ? node.data : {}
	const label = data.label ?? node.label ?? id
	const name = data.name ?? label
	const description = data.description ?? ''
	const status = data.status ?? 'locked'
	const rarity = data.rarity ?? 'common'
	const reward = data.reward ?? ''
	const icon = data.icon ?? '⭐'
	const xp = Number.isFinite(Number(data.xp)) ? Number(data.xp) : 0
	const tags = Array.isArray(data.tags) ? data.tags.map(String) : []
	const dependsOn = Array.isArray(data.dependsOn) ? data.dependsOn.map(String) : []
	const progressTotal = Math.max(1, Number.isFinite(Number(data.progress?.total)) ? Number(data.progress.total) : 1)
	const progressCurrent = Math.min(
		Math.max(0, Number.isFinite(Number(data.progress?.current)) ? Number(data.progress.current) : 0),
		progressTotal
	)
	const timeline = {
		createdAt: data.timeline?.createdAt ? new Date(data.timeline.createdAt) : null,
		unlockedAt: data.timeline?.unlockedAt ? new Date(data.timeline.unlockedAt) : null,
		completedAt: data.timeline?.completedAt ? new Date(data.timeline.completedAt) : null,
	}

	return {
		...node,
		id,
		type: node.type ?? 'achievement',
		data: {
			...data,
			label,
			name,
			description,
			status,
			rarity,
			reward,
			icon,
			xp,
			tags,
			dependsOn,
			progress: { current: progressCurrent, total: progressTotal },
			timeline,
		},
		position: node.position && typeof node.position === 'object'
			? { ...emptyPosition, ...node.position }
			: { ...emptyPosition },
		sourcePosition: node.sourcePosition ?? 'right',
		targetPosition: node.targetPosition ?? 'left',
	}
}

const normalizeEdge = (edge, index = 0) => {
	if (!edge || typeof edge !== 'object') return null
	const source = String(edge.source ?? '')
	const target = String(edge.target ?? '')
	if (!source || !target) return null

	return {
		id: edge.id ?? `${source}-${target}-${index}`,
		source,
		target,
		type: edge.type ?? 'smoothstep',
		animated: edge.animated ?? false,
		data: edge.data ?? undefined,
		label: edge.label ?? undefined,
	}
}

export function useLoadGoals(boardId) {
	const [nodes, setNodes] = useState([])
	const [edges, setEdges] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [board, setBoard] = useState(null)
	const [stats, setStats] = useState(null)
	const [progression, setProgression] = useState(null)

	useEffect(() => {
		if (!boardId) return
		const controller = new AbortController()
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const doc = await getBoard(boardId, { signal: controller.signal })
				setBoard(doc)
				setStats(doc?.stats ?? null)
				setProgression(doc?.progression ?? null)
				const safeNodes = Array.isArray(doc?.nodes)
					? doc.nodes.map((node, idx) => normalizeNode(node, idx)).filter(Boolean)
					: []
				const safeEdges = Array.isArray(doc?.edges)
					? doc.edges.map((edge, idx) => normalizeEdge(edge, idx)).filter(Boolean)
					: []
				setNodes(safeNodes)
				setEdges(safeEdges)
			} catch (err) {
				if (!controller.signal.aborted) {
					setError(err)
					setNodes([])
					setEdges([])
				}
			} finally {
				if (!controller.signal.aborted) setLoading(false)
			}
		}
		load()
		return () => controller.abort()
	}, [boardId])

	return {
		nodes,
		edges,
		setNodes,
		setEdges,
		loading,
		error,
		board,
		setBoard,
		stats,
		setStats,
		progression,
		setProgression,
	}
}
