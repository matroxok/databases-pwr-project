import { apiFetch } from './api'

export const fetchMe = () => apiFetch<any>('/auth/me', { method: 'GET' })

export const login = (email: string, password: string) =>
	apiFetch('/auth/login', {
		method: 'POST',
		csrf: true,
		body: JSON.stringify({ email, password }),
	})

export const logout = () =>
	apiFetch('/auth/logout', {
		method: 'POST',
		csrf: true,
	})

export const register = (email: string, password: string) =>
	apiFetch('/auth/register', {
		method: 'POST',
		csrf: true,
		body: JSON.stringify({ email, password }),
	})

export const reset_password = (uid: string, token: string, new_password: string) =>
	apiFetch('/auth/reset-password/confirm', {
		method: 'POST',
		csrf: true,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ uid, token, new_password }),
	})

// export const reset_password = async (uid: string, token: string, new_password: string) => {
// 	const csrfToken = getCookie('csrftoken')
// 	console.log('csrftoken from cookie:', csrfToken)

// 	const res = await fetch('http://localhost:8000/api/auth/reset-password/confirm', {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
// 		},
// 		body: JSON.stringify({ uid, token, new_password }),
// 		credentials: 'include', // ważne, żeby cookie w ogóle poleciały
// 	})

// 	const data = await res.json().catch(() => null)

// 	if (!res.ok) {
// 		console.log('RESET ERROR STATUS', res.status, data)
// 		throw { status: res.status, data }
// 	}

// 	return data
// }
