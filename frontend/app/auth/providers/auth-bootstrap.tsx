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
				// set crsf token in cookie
				await fetchCSRFToken()
				// get api healthceck in logs
				await apiHealthCheck()

				// try to get user info
				const me = await fetchMe()
				setUser(me)
			} catch (_e) {
				// if sessionid (user isn't logged) clear session informations form authstore.
				// if in console is error [16/Nov/2025 23:53:05] "GET /api/auth/me HTTP/1.1" 401 26 // Not Found: | all its okay.
				clear()
			}
		})()
	}, [setUser, clear])

	return null
}
