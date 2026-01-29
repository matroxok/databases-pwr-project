'use client'

import { JSX, useState } from 'react'
import { DatePicker } from '../date-picker'

import { getAvailableRooms } from '@/lib/routes'
import { toApiDate } from '@/lib/date-to-api'

import Image from 'next/image'
import { getRoomImageUrl } from '@/lib/api'

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

type FormStep1Props = {
	dateStart: Date | null
	dateEnd: Date | null
	capacity: number | null
	onNext: (dateStart: Date, dateEnd: Date, capacity: number, room: AvailableRoom) => void
}

export default function FormStep1({ dateStart, dateEnd, capacity, onNext }: FormStep1Props) {
	const today = new Date()
	const tomorrow = new Date(today)
	tomorrow.setDate(today.getDate() + 1)

	const [startDate, setStartDate] = useState<Date | null>(dateStart ?? today)
	const [endDate, setEndDate] = useState<Date | null>(dateEnd ?? tomorrow)
	const [localCapacity, setLocalCapacity] = useState<number>(capacity ?? 2)

	const [rooms, setRooms] = useState<AvailableRoom[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [hasSearched, setHasSearched] = useState(false)

	const handleSearch = async () => {
		if (!startDate || !endDate) {
			setError('Wybierz daty przyjazdu i wyjazdu')
			return
		}
		if (localCapacity <= 0) {
			setError('Liczba osób musi być większa od 0')
			return
		}

		const dateStartAPI = toApiDate(startDate)
		const dateEndAPI = toApiDate(endDate)

		if (!dateStartAPI || !dateEndAPI) {
			setError('Błąd formatu daty')
			return
		}

		try {
			setIsLoading(true)
			setError(null)
			setHasSearched(true)

			const data = (await getAvailableRooms(dateStartAPI, dateEndAPI, localCapacity)) as AvailableRoom[]
			setRooms(data)
			console.log(setRooms)
		} catch (e) {
			console.error(e)
			setError('Nie udało się pobrać pokoi. Spróbuj ponownie.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleSelectRoom = (room: AvailableRoom) => {
		if (!startDate || !endDate) {
			setError('Brakuje dat – wybierz je jeszcze raz')
			return
		}

		onNext(startDate, endDate, localCapacity, room)
	}

	return (
		<div className="pt-10 flex flex-col gap-4">
			<h2 className="text-xl font-semibold">FORM STEP 1</h2>

			<div className="flex flex-wrap gap-4">
				<DatePicker label="Data przyjazdu" date={startDate} onChange={setStartDate} />
				<DatePicker label="Data wyjazdu" date={endDate} onChange={setEndDate} />
			</div>

			<div className="flex flex-col gap-1 max-w-[220px]">
				<label className="text-sm font-medium">Liczba osób</label>
				<input
					type="number"
					min={1}
					className="border rounded px-2 py-1 bg-background"
					value={localCapacity}
					onChange={e => {
						const value = Number(e.target.value)
						const safeValue = !value || value < 1 ? 1 : value > 8 ? 8 : value
						setLocalCapacity(safeValue)
					}}
				/>
			</div>

			<button
				onClick={handleSearch}
				disabled={isLoading}
				className="mt-4 inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
				{isLoading ? 'Ładowanie...' : 'Szukaj pokoi'}
			</button>

			{error && <p className="text-sm text-red-500">{error}</p>}

			{hasSearched && !isLoading && (
				<div className="mt-6">
					{rooms.length === 0 ? (
						<p>Brak dostępnych pokoi w wybranym terminie.</p>
					) : (
						<div className="grid gap-4">
							{rooms.map(room => (
								<div key={room.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-card shadow-sm">
									<Image src={getRoomImageUrl(room.image)} alt="" width={300} height={200} unoptimized></Image>
									<div className="flex justify-between items-baseline">
										<h3 className="text-lg font-semibold">Pokój – {room.name}</h3>
										<span className="text-sm font-medium">{room.price_per_night} zł / noc</span>
									</div>
									<p className="text-sm text-muted-foreground">
										Typ: {room.room_type}, max {room.capacity} os.
									</p>
									{room.description && <p className="text-sm">{room.description}</p>}

									<button
										onClick={() => handleSelectRoom(room)}
										className="mt-2 self-end inline-flex items-center rounded bg-secondary px-3 py-1 text-xs font-medium">
										Wybierz ten pokój
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
