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
				await fetchCSRFToken()

				await apiHealthCheck()

				const me = await fetchMe()
				setUser(me)
			} catch (_e) {
				clear()
			}
		})()
	}, [setUser, clear])

	return null
}
