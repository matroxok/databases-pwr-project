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

export const getAvailableRooms = (check_in: string, check_out: string, guests: number) => {
	const params = new URLSearchParams({
		check_in,
		check_out,
		guests: guests.toString(),
	})

	return apiFetch(`/rooms/available?${params.toString()}`, {
		method: 'GET',
		csrf: true,
	})
}

export async function createReservation(payload: {
	room_id: string
	check_in: string
	check_out: string
	guests_count: number
	notes?: string
}) {
	return await apiFetch(`/reservations`, {
		method: 'POST',
		csrf: true,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
}

export async function getMyReservations() {
	return await apiFetch(`/reservations`, {
		method: 'GET',
		csrf: true,
	})
}

export async function updateReservation(
	id: number,
	payload: { check_in: string; check_out: string; guests_count: number; notes?: string },
) {
	return await apiFetch(`/reservations/${id}`, {
		method: 'PUT',
		csrf: true,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
}

export async function deleteReservation(id: number) {
	return await apiFetch(`/reservations/${id}`, {
		method: 'DELETE',
		csrf: true,
	})
}
