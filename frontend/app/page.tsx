'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/authStore'
import { logout, reset_password_send_email } from '@/lib/routes'
import { useState } from 'react'

import { apiHealthCheck } from '@/lib/api'

export default function Home() {
	const router = useRouter()
	const clear = useAuthStore(s => s.clear)

	const [reset, setIsReset] = useState(false)
	console.log(reset)

	const [health, isHealth] = useState(false)

	async function healthCheck() {
		try {
			await apiHealthCheck()
			isHealth(true)
		} catch (error) {
			console.log('API offline')
		}
	}

	healthCheck()

	async function logoutAPI() {
		try {
			await logout()
			router.push('/')
			clear()
		} catch {}
	}

	async function resetPasswordAPI(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const formData = new FormData(e.currentTarget)
		const email = String(formData.get('email') || '')

		try {
			if (!email) {
				console.log('missing email')
			}

			await reset_password_send_email(email)
		} catch (error) {
			console.log(error)
		} finally {
			setIsReset(false)
		}
	}

	return (
		<div className="w-full h-screen flex items-center justify-center">
			<div className="flex flex-col items-center justify-center">
				<div className="flex gap-2 items-center">
					<p>API STATUS: </p>
					{health ? (
						<div className="flex gap-2 items-center">
							<div className="w-4 h-4 bg-green-600 animate-pulse rounded-full"></div>
							<p className="text-green-600">- online</p>
						</div>
					) : (
						<div className="flex gap-2 items-center">
							<div className="w-4 h-4 bg-red-600 animate-pulse rounded-full"></div>
							<p className="text-red-600">- offline</p>
						</div>
					)}
				</div>
				<h1 className="font-bold text-2xl">dev hotel app</h1>
				<h2 className="text-blue-400">public endpoints</h2>
				<p className="pt-5">legend:</p>
				<div className="flex gap-4 pt-2">
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 rounded-full bg-green-200"></div>
						<p>Endpoint accessible without logging in </p>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 rounded-full bg-blue-200"></div>
						<p>
							Endpoint accessible <span className="font-bold">only</span> after login
						</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 rounded-full bg-red-300"></div>
						<p>Endpoint other </p>
					</div>
				</div>
				<div className="flex items-center gap-4 py-5">
					<Link
						href="/auth/login"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-green-200">
						Login
					</Link>
					<Link
						href="/auth/signup"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-green-200">
						Registry
					</Link>
					<Link
						href="/dashboard/"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-blue-200">
						Dashboard
					</Link>
					<Link
						href="/"
						onClick={logoutAPI}
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-red-300">
						Logout
					</Link>
					<div>
						{reset ? (
							<form onSubmit={resetPasswordAPI} className="flex flex-col gap-2">
								<input id="email" name="email" type="email" placeholder="Podaj email" required className="border p-2" />

								<button
									type="submit"
									className="px-2 py-2 border shadow-l cursor-pointer text-xl bg-green-200 active:bg-green-300">
									send
								</button>
							</form>
						) : (
							<button
								onClick={() => setIsReset(true)}
								className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-green-200">
								reset password
							</button>
						)}
					</div>
					<Link
						href="/auth/logout"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-blue-200">
						change password
					</Link>
				</div>
				<p>other links:</p>
				<div className="flex items-center gap-4">
					<Link href="http://localhost:8000/api/docs" target="blank" className="underline text-blue-500">
						API docs
					</Link>
					<Link href="http://localhost:8000/admin" target="blank" className="underline text-blue-500">
						ADMIN PANEL
					</Link>
				</div>
			</div>
		</div>
	)
}
