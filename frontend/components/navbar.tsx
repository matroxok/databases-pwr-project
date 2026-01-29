'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/authStore'
import { logout } from '@/lib/routes'
import Link from 'next/dist/client/link'

export default function Navbar() {
	const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
	const router = useRouter()
	const clear = useAuthStore(s => s.clear)

	useEffect(() => {
		const checkSession = async () => {
			try {
				const res = await fetch('/api/session', { cache: 'no-store' })
				const data = await res.json()
				setLoggedIn(!!data.loggedIn)
			} catch {
				setLoggedIn(false)
			}
		}
		checkSession()
	}, [])

	return (
		<nav className="flex items-center justify-between py-3 px-12 bg-[#0746ba]">
			<Link href="/" className="text-white leading-tight">
				Hotel <span className="font-semibold">PROJECT</span>
				<br />
				<span className="text-xs">Najlepszy hotel w okolicy</span>
			</Link>
			{loggedIn === null ? (
				<span className="text-white text-sm opacity-80">...</span>
			) : loggedIn ? (
				<div className="flex gap-5">
					<button
						type="button"
						onClick={() => router.push('/dashboard')}
						className="bg-white text-[#0746ba] px-4 py-2 rounded text-sm font-medium hover:bg-gray-100">
						Moje konto
					</button>
					<button
						type="button"
						onClick={async () => {
							await logout()
							router.push('/')
							clear()
						}}
						className="bg-white text-red-500 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100">
						Wyloguj się
					</button>
				</div>
			) : (
				<div className="flex gap-5">
					<button
						type="button"
						onClick={() => router.push('/auth/signup')}
						className="bg-white text-[#0746ba] px-4 py-2 rounded text-sm font-medium hover:bg-gray-100">
						Zarejestruj się
					</button>
					<button
						type="button"
						onClick={() => router.push('/auth/signin')}
						className="bg-white text-[#0746ba] px-4 py-2 rounded text-sm font-medium hover:bg-gray-100">
						Zaloguj się
					</button>
				</div>
			)}
		</nav>
	)
}
