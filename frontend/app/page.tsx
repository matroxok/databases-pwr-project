'use client'

import Navbar from '@/components/navbar'
import RoomSearch from '@/components/room-search'
import Image from 'next/image'

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="relative flex-1 w-full h-full px-4 py-10 flex justify-center items-center bg-cover bg-center overflow-hidden">
				<div className="absolute inset-0 -z-10">
					<Image src="/assets/bg.jpg" alt="bg" fill priority className="object-cover blur-sm scale-105" />
					<div className="absolute inset-0 bg-black/40" />
				</div>
				<RoomSearch />
			</main>
		</div>
	)
}
