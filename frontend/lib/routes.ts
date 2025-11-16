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

export const reset_password_send_email = (email: string) =>
	apiFetch('/auth/reset-password', {
		method: 'POST',
		csrf: true,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email }),
	})
