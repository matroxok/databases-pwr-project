'use client'

import Navbar from '@/components/navbar'
import RoomSearch from '@/components/room-search'

export default function Home() {
	return (
		<div>
			<Navbar />
			<main className="mx-auto max-w-6xl px-4 py-10">
				<RoomSearch />
			</main>
		</div>
	)
}
