'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { login, fetchMe, reset_password_send_email } from '@/lib/routes'
import { useAuthStore } from '@/lib/authStore'

import Image from 'next/image'
import Link from 'next/link'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const setUser = useAuthStore(s => s.setUser)

	const next = searchParams.get('next') || '/dashboard'

	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const [resetOpen, setResetOpen] = React.useState(false)
	const [resetEmail, setResetEmail] = React.useState('')
	const [resetLoading, setResetLoading] = React.useState(false)

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		setLoading(true)

		const fd = new FormData(e.currentTarget)
		const email = String(fd.get('email') || '')
		const password = String(fd.get('password') || '')

		try {
			await login(email, password)
			const me = await fetchMe()

			setUser(me)
			router.push(next ?? '/dashboard')

			router.push(next)
		} catch (err: any) {
			setError(err?.message?.toString() || 'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.')
		} finally {
			setLoading(false)
		}
	}

	async function onResetPassword() {
		const email = resetEmail.trim()
		if (!email) {
			toast.error('Podaj adres email')
			return
		}

		try {
			setResetLoading(true)
			await reset_password_send_email(email)
			toast.success('Jeśli konto istnieje, wysłaliśmy instrukcję resetu hasła.')
			setResetOpen(false)
			setResetEmail('')
		} catch (err: any) {
			toast.error(err?.message?.toString() || 'Nie udało się wysłać emaila resetującego hasło.')
		} finally {
			setResetLoading(false)
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

									<div className="ml-auto">
										<Popover open={resetOpen} onOpenChange={setResetOpen}>
											<PopoverTrigger asChild>
												<button
													type="button"
													className="text-sm underline-offset-2 hover:underline text-muted-foreground disabled:opacity-60"
													disabled={loading}>
													Zapomniałeś/aś hasła?
												</button>
											</PopoverTrigger>

											<PopoverContent className="w-80" align="end">
												<div className="space-y-3">
													<div className="space-y-1">
														<p className="text-sm font-medium">Reset hasła</p>
														<p className="text-xs text-muted-foreground">
															Podaj email — wyślemy instrukcję resetu hasła.
														</p>
													</div>

													<Input
														value={resetEmail}
														onChange={e => setResetEmail(e.target.value)}
														placeholder="email@domena.pl"
														type="email"
														autoComplete="email"
														disabled={resetLoading}
														onKeyDown={e => {
															if (e.key === 'Enter') {
																e.preventDefault()
																onResetPassword()
															}
														}}
													/>

													<div className="flex justify-end gap-2">
														<Button
															type="button"
															variant="ghost"
															onClick={() => setResetOpen(false)}
															disabled={resetLoading}>
															Anuluj
														</Button>
														<Button type="button" onClick={onResetPassword} disabled={resetLoading}>
															{resetLoading ? 'Wysyłam...' : 'Wyślij'}
														</Button>
													</div>
												</div>
											</PopoverContent>
										</Popover>
									</div>
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

							<FieldDescription className="text-center">
								Nie masz konta? <Link href={`/auth/signup?next=${encodeURIComponent(next)}`}>Zarejestruj się</Link>
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
