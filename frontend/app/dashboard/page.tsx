import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardPage() {
	const session = (await cookies()).get('sessionid')

	if (!session) {
		redirect('/login')
	}

	const res = await fetch('http://localhost:8000/api/user', {
		credentials: 'include',
		headers: {
			cookie: `sessionid=${session.value}`,
		},
	})
	if (!res.ok) redirect('/login')

	const user = await res.json()

	return (
		<div>
			Witaj {user.name}! welcome.
			<LogoutButton />
		</div>
	)
}
