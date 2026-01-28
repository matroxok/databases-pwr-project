'use client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import * as React from 'react'
import { register, fetchMe, login } from '@/lib/routes'
import { useRouter } from 'next/navigation'

import Link from 'next/link'
import { useAuthStore } from '@/lib/authStore'
import Image from 'next/image'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const setUser = useAuthStore(s => s.setUser)
	const router = useRouter()

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		setLoading(true)

		const formData = new FormData(e.currentTarget)
		const email = String(formData.get('email') || '')
		const password = String(formData.get('password') || '')
		const confirmPassword = String(formData.get('confirm-password') || '')

		try {
			if (email.length === 0) {
				throw new Error('Email is required')
			}

			if (password !== confirmPassword) {
				throw new Error('Passwords do not match')
			}

			// register api/auth/register
			await register(email, password)
			// login api/auth/login
			await login(email, password)
			const user = await fetchMe()
			setUser(user)

			console.log('user succesfuly registered')
			router.push('/dashboard')
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error))
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form onSubmit={onSubmit} className="p-6 md:p-8">
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">Dołącz do nas,</h1>
								<p className="text-muted-foreground text-balance">
									Załóż konto aby korzystać z usług <br />
									Hotelu <span className="font-bold">PROJECT</span>
								</p>
							</div>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="jan.kowalski@poczta.pl"
									disabled={loading}
									required
									autoComplete="email"
								/>
								<FieldDescription>Podaj swój adres email, którego będziesz używać do logowania.</FieldDescription>
							</Field>
							<Field>
								<Field className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="password">Hasło</FieldLabel>
										<Input
											id="password"
											name="password"
											type="password"
											required
											disabled={loading}
											autoComplete="new-password"
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="confirm-password">Potwierdź hasło</FieldLabel>
										<Input
											id="confirm-password"
											name="confirm-password"
											type="password"
											required
											disabled={loading}
											autoComplete="new-password"
										/>
									</Field>
								</Field>
							</Field>
							<Field>
								<Button type="submit" disabled={loading} className="w-full">
									{loading ? 'Rejestruję...' : 'Zarejestruj się'}
								</Button>
								{error && <p className="text-sm text-red-500 mt-2">{error}</p>}
							</Field>

							<FieldDescription className="text-center">
								Masz już konto? <Link href="/auth/signin">Zaloguj się</Link>
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
