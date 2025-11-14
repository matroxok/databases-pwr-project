'use client'

import { useAuthStore } from '@/lib/authStore'
import { logout } from '@/lib/routes'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
	const clear = useAuthStore(s => s.clear)
	const router = useRouter()
	return (
		<button
			onClick={async () => {
				await logout()
				router.push('/login')
				clear()
			}}>
			Wyloguj
		</button>
	)
}
