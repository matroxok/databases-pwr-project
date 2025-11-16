'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function PasswordResetForm({ className, ...props }: React.ComponentProps<'div'>) {
	const searchParms = useSearchParams()
	const uid = searchParms.get('uid')
	const token = searchParms.get('token')

	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8 space-y-4">
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">password reset</h1>
								<p className="text-muted-foreground text-balance">password_reset</p>
							</div>

							{error && (
								<p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
							)}

							<Field>
								<FieldLabel htmlFor="new_password">new_password</FieldLabel>
								<Input id="new_password" name="new_password" type="password" required disabled={loading} />
							</Field>

							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="confirm_new_password">confirm_new_password</FieldLabel>
								</div>
								<Input
									id="confirm_new_password"
									name="confirm_new_password"
									type="password"
									required
									disabled={loading}
								/>
							</Field>

							<Field>
								<Button type="submit" disabled={loading} className="w-full">
									{loading ? 'proccesing...' : 'change password'}
								</Button>
							</Field>

							<FieldDescription className="text-center">
								Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
							</FieldDescription>
						</FieldGroup>
					</form>

					<div className="bg-muted relative hidden md:block">
						<img
							src="/placeholder.svg"
							alt="Image"
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
						/>
					</div>
				</CardContent>
			</Card>

			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our <a href="">Terms of Service</a> and <a href="#">Privacy Policy</a>.
			</FieldDescription>
		</div>
	)
}
