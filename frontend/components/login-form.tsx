'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { login, fetchMe } from '@/lib/routes'
import { useAuthStore } from '@/lib/authStore'
import Image from 'next/image'

import Link from 'next/link'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
	const router = useRouter()
	const setUser = useAuthStore(s => s.setUser)
	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		setLoading(true)

		const fd = new FormData(e.currentTarget)
		const email = String(fd.get('email') || '')
		const password = String(fd.get('password') || '')

		try {
			// 1) logowanie (CSRF + cookies po stronie fetchów w lib/routes)
			await login(email, password)

			// 2) pobranie zalogowanego usera
			const me = await fetchMe()
			setUser(me)

			// 3) redirect do panelu
			router.push('/dashboard')
		} catch (err: any) {
			// pokaż komunikat (możesz dopasować pod swój backend)
			setError(err?.message?.toString() || 'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8 space-y-4" onSubmit={onSubmit}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">Dzień Dobry,</h1>
								<p className="text-muted-foreground text-balance">
									Zaloguj się do swojego konta w systemie <br />
									Hotelu <span className="font-bold">PROJECT</span>
								</p>
							</div>

							{error && (
								<p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
							)}

							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="jan.kowalski@poczta.pl"
									required
									disabled={loading}
									autoComplete="email"
								/>
							</Field>

							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
										Zapomniałeś/aś hasła?
									</a>
								</div>
								<Input
									id="password"
									name="password"
									type="password"
									required
									disabled={loading}
									autoComplete="current-password"
								/>
							</Field>

							<Field>
								<Button type="submit" disabled={loading} className="w-full">
									{loading ? 'Pracuję...' : 'Zaloguj'}
								</Button>
							</Field>

							<Field className="grid grid-cols-3 gap-4"></Field>

							<FieldDescription className="text-center">
								Nie masz konta? <Link href="/auth/signup">Zarejestruj się</Link>
							</FieldDescription>
						</FieldGroup>
					</form>

					<div className="bg-muted relative hidden md:block">
						<Image
							src="/assets/LOGO_HOTEL_IMG.png"
							alt="Image"
							width={1920}
							height={1080}
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
