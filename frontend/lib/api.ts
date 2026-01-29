import { getCookie } from './cookies'

const API = process.env.API_URL || 'http://localhost:8000/api'
const API_IMAGE = process.env.API_IMAGE_URL || 'http://localhost:8000'

export async function fetchCSRFToken() {
	await fetch(`${API}/set-csrf-token`, {
		method: 'GET',
		credentials: 'include',
	})
}

function headersWithCsrf(extra?: HeadersInit): HeadersInit {
	const token = getCookie('csrftoken') // nazwa musi być zgodna z backendem
	return {
		'Content-Type': 'application/json',
		...(token ? { 'X-CSRFToken': token } : {}),
		...extra,
	}
}

export async function apiFetch<T>(path: string, options: RequestInit & { csrf?: boolean } = {}): Promise<T> {
	const { csrf = true, headers, ...rest } = options

	const res = await fetch(`${API}${path}`, {
		...rest,
		credentials: 'include',
		headers: csrf ? headersWithCsrf(headers) : headers,
	})

	if (!res.ok) {
		const text = await res.text().catch(() => '')
		throw new Error(`API ${res.status}: ${text || res.statusText}`)
	}

	return (await res.json()) as T
}

export function getRoomImageUrl(path: string): string {
	if (!path) return `${API_IMAGE}/placeholder-room.jpg`
	if (path.startsWith('http')) return path
	return `${API_IMAGE}${path}`
}

export const apiHealthCheck = () => apiFetch<any>('/health', { method: 'GET' })
