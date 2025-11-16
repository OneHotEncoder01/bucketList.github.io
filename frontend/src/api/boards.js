const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3000').replace(/\/$/, '')
const BASE_URL = `${API_BASE}/api/boards`

async function handleResponse(res) {
	if (!res.ok) {
		const text = await res.text().catch(() => '')
		throw new Error(text || `Request failed with status ${res.status}`)
	}
	return res.json()
}

export async function listBoards({ signal } = {}) {
	const res = await fetch(BASE_URL, { signal })
	return handleResponse(res)
}

export async function getBoard(boardId, { signal } = {}) {
	if (!boardId) throw new Error('boardId is required')
	const res = await fetch(`${BASE_URL}/${boardId}`, { signal })
	return handleResponse(res)
}

export async function createBoard(payload, { signal } = {}) {
	const res = await fetch(BASE_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload ?? {}),
		signal,
	})
	return handleResponse(res)
}

export async function saveBoard(boardId, payload, { signal } = {}) {
	if (!boardId) throw new Error('boardId is required')
	const res = await fetch(`${BASE_URL}/${boardId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload ?? {}),
		signal,
	})
	return handleResponse(res)
}

export async function createAchievement(boardId, payload, { signal } = {}) {
	if (!boardId) throw new Error('boardId is required')
	const res = await fetch(`${BASE_URL}/${boardId}/achievements`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload ?? {}),
		signal,
	})
	return handleResponse(res)
}

export async function updateAchievement(boardId, achievementId, payload, { signal } = {}) {
	if (!boardId) throw new Error('boardId is required')
	if (!achievementId) throw new Error('achievementId is required')
	const res = await fetch(`${BASE_URL}/${boardId}/achievements/${achievementId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload ?? {}),
		signal,
	})
	return handleResponse(res)
}

export async function deleteAchievement(boardId, achievementId, { signal } = {}) {
	if (!boardId) throw new Error('boardId is required')
	if (!achievementId) throw new Error('achievementId is required')
	const res = await fetch(`${BASE_URL}/${boardId}/achievements/${achievementId}`, {
		method: 'DELETE',
		signal,
	})
	return handleResponse(res)
}

export async function recordAchievementProgress(boardId, achievementId, payload, { signal } = {}) {
	if (!boardId) throw new Error('boardId is required')
	if (!achievementId) throw new Error('achievementId is required')
	const res = await fetch(`${BASE_URL}/${boardId}/achievements/${achievementId}/progress`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload ?? {}),
		signal,
	})
	return handleResponse(res)
}
