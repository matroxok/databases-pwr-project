'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import FormStep1 from './step-1'
import FormStep2 from './step-2'
import { useCartStore } from '@/store/useCartStore'
import { toApiDate } from '@/lib/date-to-api'

type FormData = {
	dateStart: Date | null
	dateEnd: Date | null
	capacity: number | null
	roomName: string | null
	roomType: string | null
	roomCapacity: number | null
	roomPricePerNight: number | null
	roomDescription: string | null
}

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

export default function Form() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const { setInitialCart, cart } = useCartStore()

	const step = useMemo(() => {
		const raw = searchParams.get('step')
		const n = raw ? Number(raw) : 0
		return Number.isNaN(n) ? 0 : n
	}, [searchParams])

	const goToStep = (nextStep: number) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('step', String(nextStep))
		router.push(`?${params.toString()}`, { scroll: false })
	}

	const [formData, setFormData] = useState<FormData>({
		dateStart: null,
		dateEnd: null,
		capacity: null,
		roomName: null,
		roomType: null,
		roomCapacity: null,
		roomPricePerNight: null,
		roomDescription: null,
	})

	useEffect(() => {
		const hasStepParam = searchParams.get('step') !== null

		if (cart && step === 0 && !hasStepParam) {
			goToStep(1)
		}
	}, [cart, step, searchParams, goToStep])

	return (
		<>
			{step === 0 && (
				<FormStep1
					dateStart={formData.dateStart}
					dateEnd={formData.dateEnd}
					capacity={formData.capacity}
					onNext={(dateStart, dateEnd, capacity, room: AvailableRoom) => {
						setFormData(prev => ({
							...prev,
							dateStart,
							dateEnd,
							capacity,
							roomName: room.name,
							roomType: room.room_type,
							roomCapacity: room.capacity,
							roomPricePerNight: Number(room.price_per_night),
							roomDescription: room.description,
						}))

						const dateStartStr = toApiDate(dateStart)!
						const dateEndStr = toApiDate(dateEnd)!

						setInitialCart({
							dateStart: dateStartStr,
							dateEnd: dateEndStr,
							capacity,
							room,
						})

						goToStep(1)
					}}
				/>
			)}

			{step === 1 && <FormStep2 onBack={() => goToStep(0)} onNext={() => goToStep(2)} />}

			{step === 2 && (
				<div className="pt-10">
					<h2>Podsumowanie / płatność (step 3)</h2>
				</div>
			)}
		</>
	)
}
