'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { DatePicker } from './forms/date-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

import { getAvailableRooms, createReservation } from '@/lib/routes'
import { toApiDate } from '@/lib/date-to-api'
import { getRoomImageUrl } from '@/lib/api'
import { useAuthStore } from '@/lib/authStore'

type AvailableRoom = {
	id: string
	number: string
	name: string
	image: string
	room_type: 'single' | 'double' | 'suite' | 'family'
	capacity: number
	price_per_night: string
	description: string
	is_active: boolean
}

export default function RoomSearch() {
	const router = useRouter()
	const searchParams = useSearchParams()

	const isAuthenticated = useAuthStore(s => s.isAuthenticated)

	// default dates
	const today = new Date()
	const tomorrow = new Date(today)
	tomorrow.setDate(today.getDate() + 1)

	const [startDate, setStartDate] = React.useState<Date | null>(today)
	const [endDate, setEndDate] = React.useState<Date | null>(tomorrow)
	const [capacity, setCapacity] = React.useState<number>(2)

	const [rooms, setRooms] = React.useState<AvailableRoom[]>([])
	const [isLoading, setIsLoading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const [hasSearched, setHasSearched] = React.useState(false)

	// reservation dialog state
	const [reserveOpen, setReserveOpen] = React.useState(false)
	const [selectedRoom, setSelectedRoom] = React.useState<AvailableRoom | null>(null)
	const [notes, setNotes] = React.useState('')
	const [reserveLoading, setReserveLoading] = React.useState(false)

	const handleSearch = React.useCallback(async () => {
		if (!startDate || !endDate) {
			setError('Wybierz daty przyjazdu i wyjazdu')
			return
		}
		if (capacity <= 0) {
			setError('Liczba osób musi być większa od 0')
			return
		}

		const checkIn = toApiDate(startDate)
		const checkOut = toApiDate(endDate)

		if (!checkIn || !checkOut) {
			setError('Błąd formatu daty')
			return
		}

		try {
			setIsLoading(true)
			setError(null)
			setHasSearched(true)

			const data = (await getAvailableRooms(checkIn, checkOut, capacity)) as AvailableRoom[]
			setRooms(data)
		} catch (e) {
			console.error(e)
			setError('Nie udało się pobrać pokoi. Spróbuj ponownie.')
		} finally {
			setIsLoading(false)
		}
	}, [startDate, endDate, capacity])

	// ✅ protip: jeżeli wróciliśmy z logowania i mamy w URL reserveRoomId,
	// to wznawiamy rezerwację (automatyczny search + otwarcie dialogu)
	React.useEffect(() => {
		const reserveRoomId = searchParams.get('reserveRoomId')
		const checkIn = searchParams.get('checkIn')
		const checkOut = searchParams.get('checkOut')
		const guests = searchParams.get('guests')

		if (!reserveRoomId) return
		if (!isAuthenticated) return

		// jeśli parametry są w URL, ustaw stan wyszukiwarki
		if (checkIn) setStartDate(new Date(checkIn))
		if (checkOut) setEndDate(new Date(checkOut))
		if (guests) setCapacity(Number(guests) || 1)

		// jeśli nie szukaliśmy jeszcze / nie mamy pokoi, odpal search
		// potem jak przyjdą pokoje, kolejny efekt otworzy dialog
		if (!hasSearched) {
			// mała kolejka, żeby state zdążył się ustawić
			setTimeout(() => {
				handleSearch()
			}, 0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated])

	// gdy mamy pokoje i w URL jest reserveRoomId → otwórz dialog na właściwym pokoju
	React.useEffect(() => {
		const reserveRoomId = searchParams.get('reserveRoomId')
		if (!reserveRoomId) return
		if (!isAuthenticated) return
		if (!hasSearched) return
		if (rooms.length === 0) return

		const room = rooms.find(r => r.id === reserveRoomId)
		if (!room) {
			toast.error('Nie znaleziono pokoju do rezerwacji w aktualnych wynikach.')
			// usuń reserveRoomId, żeby nie zapętlać
			const params = new URLSearchParams(searchParams.toString())
			params.delete('reserveRoomId')
			router.replace(`?${params.toString()}`, { scroll: false })
			return
		}

		setSelectedRoom(room)
		setReserveOpen(true)
	}, [rooms, hasSearched, isAuthenticated, router, searchParams])

	const openReserve = (room: AvailableRoom) => {
		if (!startDate || !endDate) {
			toast.error('Wybierz daty przed rezerwacją.')
			return
		}

		// zapisujemy intencję rezerwacji w URL (żeby po logowaniu wrócić do tego samego pokoju)
		const params = new URLSearchParams(searchParams.toString())
		params.set('reserveRoomId', room.id)
		params.set('checkIn', toApiDate(startDate)!)
		params.set('checkOut', toApiDate(endDate)!)
		params.set('guests', String(capacity))

		const next = `/?${params.toString()}`

		if (!isAuthenticated) {
			toast.error('Aby złożyć rezerwację musisz być zalogowany/a.')
			router.push(`/auth/signin?next=${encodeURIComponent(next)}`)
			return
		}

		// zalogowany → normalnie otwieramy dialog
		setSelectedRoom(room)
		setReserveOpen(true)

		// optional: uzupełnij URL żeby po refreshie dalej było wiadomo co rezerwujemy
		router.replace(`?${params.toString()}`, { scroll: false })
	}

	const clearReserveFromUrl = () => {
		const params = new URLSearchParams(searchParams.toString())
		params.delete('reserveRoomId')
		// zostaw checkIn/checkOut/guests (przydatne do odtworzenia)
		router.replace(`?${params.toString()}`, { scroll: false })
	}

	const confirmReservation = async () => {
		if (!selectedRoom) return
		if (!startDate || !endDate) {
			toast.error('Brakuje dat — wybierz je ponownie.')
			setReserveOpen(false)
			clearReserveFromUrl()
			return
		}

		const checkIn = toApiDate(startDate)
		const checkOut = toApiDate(endDate)
		if (!checkIn || !checkOut) {
			toast.error('Błąd formatu daty.')
			return
		}

		try {
			setReserveLoading(true)

			await createReservation({
				room_id: selectedRoom.id,
				check_in: checkIn,
				check_out: checkOut,
				guests_count: capacity,
				notes: notes.trim() || undefined,
			})

			toast.success('Rezerwacja złożona ✅')
			setReserveOpen(false)
			setSelectedRoom(null)
			setNotes('')
			clearReserveFromUrl()
		} catch (e: any) {
			toast.error(e?.message?.toString() || 'Nie udało się utworzyć rezerwacji.')
		} finally {
			setReserveLoading(false)
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-bold">Wyszukiwarka pokoi</h1>
				<p className="text-sm text-muted-foreground">Wybierz daty i liczbę osób — pokażemy dostępne pokoje.</p>
			</header>

			<Card>
				<CardContent className="p-4 md:p-6">
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap gap-4">
							<DatePicker label="Data przyjazdu" date={startDate} onChange={setStartDate} />
							<DatePicker label="Data wyjazdu" date={endDate} onChange={setEndDate} />

							<div className="flex flex-col gap-1 w-[220px]">
								<label className="text-sm font-medium">Liczba osób</label>
								<Input
									type="number"
									min={1}
									value={capacity}
									onChange={e => {
										const value = Number(e.target.value)
										const safe = !value || value < 1 ? 1 : value > 8 ? 8 : value
										setCapacity(safe)
									}}
								/>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Button onClick={handleSearch} disabled={isLoading}>
								{isLoading ? 'Ładowanie...' : 'Szukaj pokoi'}
							</Button>

							{error && <p className="text-sm text-red-500">{error}</p>}
						</div>
					</div>
				</CardContent>
			</Card>

			{hasSearched && !isLoading && (
				<div className="space-y-3">
					<h2 className="text-lg font-semibold">Dostępne pokoje</h2>

					{rooms.length === 0 ? (
						<p className="text-sm text-muted-foreground">Brak dostępnych pokoi w wybranym terminie.</p>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{rooms.map(room => (
								<Card key={room.id} className="overflow-hidden">
									<div className="relative h-44 w-full bg-muted">
										<Image
											src={getRoomImageUrl(room.image)}
											alt={room.name}
											fill
											className="object-cover"
											unoptimized
										/>
									</div>

									<CardContent className="p-4 space-y-2">
										<div className="flex items-start justify-between gap-2">
											<div>
												<p className="text-base font-semibold">{room.name}</p>
												<p className="text-xs text-muted-foreground">
													Typ: {room.room_type} • max {room.capacity} os.
												</p>
											</div>
											<p className="text-sm font-medium whitespace-nowrap">{room.price_per_night} zł / noc</p>
										</div>

										{room.description && (
											<p className="text-sm text-muted-foreground line-clamp-3">{room.description}</p>
										)}

										<div className="pt-2">
											<Button className="w-full" onClick={() => openReserve(room)}>
												Zarezerwuj
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			)}

			{/* Dialog potwierdzenia */}
			<Dialog
				open={reserveOpen}
				onOpenChange={open => {
					setReserveOpen(open)
					if (!open) clearReserveFromUrl()
				}}>
				<DialogTrigger asChild>
					<button className="hidden" />
				</DialogTrigger>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Potwierdź rezerwację</DialogTitle>
						<DialogDescription>Sprawdź dane i kliknij „Potwierdź”. Możesz dodać notatkę.</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<div className="rounded-lg border p-3 text-sm">
							<p>
								<strong>Pokój:</strong> {selectedRoom?.name}
							</p>
							<p>
								<strong>Termin:</strong> {toApiDate(startDate)} – {toApiDate(endDate)}
							</p>
							<p>
								<strong>Liczba osób:</strong> {capacity}
							</p>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium">Notatka (opcjonalnie)</label>
							<Textarea value={notes} onChange={e => setNotes(e.target.value)} />
						</div>
					</div>

					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="ghost" onClick={() => setReserveOpen(false)} disabled={reserveLoading}>
							Anuluj
						</Button>
						<Button onClick={confirmReservation} disabled={reserveLoading}>
							{reserveLoading ? 'Rezerwuję...' : 'Potwierdź'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
