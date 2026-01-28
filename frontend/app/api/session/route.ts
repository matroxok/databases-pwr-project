import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
	const cookieStore = await cookies()
	const session = cookieStore.get('sessionid')?.value
	const csrftoken = cookieStore.get('csrftoken')?.value

	if (!session) {
		return NextResponse.json({ loggedIn: false }, { status: 200 })
	}

	const res = await fetch(`${process.env.API_URL}/auth/me`, {
		method: 'GET',
		headers: {
			Cookie: `sessionid=${session}${csrftoken ? `; csrftoken=${csrftoken}` : ''}`,
		},
		cache: 'no-store',
	})

	return NextResponse.json({ loggedIn: res.ok }, { status: 200 })
}
