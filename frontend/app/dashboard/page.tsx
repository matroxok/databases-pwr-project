import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LogoutButton } from '@/components/logout-button'
import Navbar from '@/components/navbar'

export default async function DashboardPage() {
	const session = (await cookies()).get('sessionid')

	if (!session) {
		redirect('/auth/signin')
	}

	const res = await fetch('http://localhost:8000/api/auth/me', {
		credentials: 'include',
		headers: {
			cookie: `sessionid=${session.value}`,
		},
	})
	if (!res.ok) redirect('/login')

	const user = await res.json()

	return (
		<div>
			<Navbar />
			Witaj {user.email}! welcome.
			<LogoutButton />
		</div>
	)
}
