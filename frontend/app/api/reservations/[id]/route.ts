import { NextResponse } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

function requireBaseUrl() {
	if (!baseUrl) {
		return NextResponse.json({ message: 'Brak NEXT_PUBLIC_API_BASE_URL' }, { status: 500 })
	}
	return null
}

async function forward(req: Request, url: string) {
	const cookie = req.headers.get('cookie') ?? ''
	const authorization = req.headers.get('authorization') ?? ''
	const contentType = req.headers.get('content-type') ?? 'application/json'

	const init: RequestInit = {
		method: req.method,
		headers: {
			...(contentType ? { 'content-type': contentType } : {}),
			...(cookie ? { cookie } : {}),
			...(authorization ? { authorization } : {}),
		},
	}

	if (req.method !== 'GET' && req.method !== 'HEAD') {
		init.body = await req.text()
	}

	const upstream = await fetch(url, init)
	const text = await upstream.text()
	const upstreamCT = upstream.headers.get('content-type') || 'application/json'

	return new NextResponse(text, { status: upstream.status, headers: { 'content-type': upstreamCT } })
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
	const err = requireBaseUrl()
	if (err) return err
	return forward(req, `${baseUrl}/api/reservations/${ctx.params.id}`)
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
	const err = requireBaseUrl()
	if (err) return err
	return forward(req, `${baseUrl}/a/reservations/${ctx.params.id}`)
}
