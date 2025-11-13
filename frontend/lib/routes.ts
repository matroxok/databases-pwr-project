import { apiFetch } from './api'

export const fetchMe = () => apiFetch<any>('/user', { method: 'GET' })

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
