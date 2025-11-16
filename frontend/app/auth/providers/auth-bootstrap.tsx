// AuthBootstrap.tsx
'use client'

import { useEffect } from 'react'
import { apiHealthCheck, fetchCSRFToken } from '@/lib/api'
import { fetchMe } from '@/lib/routes'
import { useAuthStore } from '@/lib/authStore'

export default function AuthBootstrap() {
	const setUser = useAuthStore(s => s.setUser)
	const clear = useAuthStore(s => s.clear)

	useEffect(() => {
		;(async () => {
			try {
				// 1) Ustaw CSRF cookie (przyda się później do POST-ów)
				await fetchCSRFToken()
				await apiHealthCheck()

				// 2) Spróbuj pobrać aktualnie zalogowanego użytkownika
				const me = await fetchMe() // <-- TU /auth/me
				setUser(me)
			} catch (_e) {
				// brak sesji / 401 itp.
				clear()
			}
		})()
	}, [setUser, clear])

	return null
}
