'use client'

import { useAuthStore } from '@/lib/authStore'
import { logout } from '@/lib/routes'

export function LogoutButton() {
	const clear = useAuthStore(s => s.clear)
	return (
		<button
			onClick={async () => {
				await logout() 
				clear()
			}}>
			Wyloguj
		</button>
	)
}
