import { getCookie } from './cookies'

const API = process.env.API_URL || 'http://localhost:8000/api'
console.log(API)

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
	const { csrf = false, headers, ...rest } = options

	const res = await fetch(`${API}${path}`, {
		credentials: 'include',
		headers: csrf ? headersWithCsrf(headers) : headers,
		...rest,
	})

	if (!res.ok) {
		const text = await res.text().catch(() => '')
		throw new Error(`API ${res.status}: ${text || res.statusText}`)
	}
	return (await res.json()) as T
}

// export const fetchMe = () => apiFetch<any>('/user', { method: 'GET' })
export const apiHealthCheck = () => apiFetch<any>('/health', { method: 'GET' })
