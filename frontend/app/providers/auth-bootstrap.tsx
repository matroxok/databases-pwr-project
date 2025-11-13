'use client'

import { useEffect } from 'react'
import { fetchCSRFToken, apiHealthCheck } from '@/lib/api'
import { useAuthStore } from '@/lib/authStore'

export default function AuthBootstrap() {
	const setUser = useAuthStore(s => s.setUser)

	useEffect(() => {
		;(async () => {
			try {
				await fetchCSRFToken() // get crsf token cookie 1)
				const me = await apiHealthCheck() // healthcheck api
				if (me) setUser(me)
			} catch (_e) {}
		})()
	}, [setUser])

	return null
}
