'use client'
import { useState } from 'react'
import FormStep1 from './step-1'
import FormStep2 from './step-2'

type FormData = {
	// first step on home page
	dateStart: Date | null
	dateEnd: Date | null
	capacity: number | null
	// second step on reservation page after render rooms consistent with the dates and number of people
	roomName: string | null
	roomType: string | null
	roomCapacity: number | null
	roomPricePerNight: number | null
	roomDescription: string | null
	//  third steop after user selected room
	userName: string | null
	userNameSurname: string | null
	userEmail: string | null
	userPhone: string | null
	userAddress: string | null
	userSecondaryAddress?: string | null
	userCity: string | null
	userPostalCode: string | null
	userCountry: string | null
	userMessage?: string | null
	// fourth step sumary and payment
	paymentMethod: string | null
}

export default function Form() {
	const [step, setStep] = useState(0)

	const [formData, setFormData] = useState<FormData>({
		dateStart: null,
		dateEnd: null,
		capacity: null,
		// second step on reservation page after render rooms consistent with the dates and number of people
		roomName: null,
		roomType: null,
		roomCapacity: null,
		roomPricePerNight: null,
		roomDescription: null,
		//  third steop after user selected room
		userName: null,
		userNameSurname: null,
		userEmail: null,
		userPhone: null,
		userAddress: null,
		userSecondaryAddress: null,
		userCity: null,
		userPostalCode: null,
		userCountry: null,
		userMessage: null,
		// fourth step sumary and payment
		paymentMethod: null,
	})
	return (
		<>
			{step === 0 && (
				<FormStep1
					dateStart={formData.dateStart}
					dateEnd={formData.dateEnd}
					capacity={formData.capacity}
					onNext={(dateStart, dateEnd, capacity, room) => {
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
						setStep(1)
					}}
				/>
			)}
			{step === 1 && (
				<FormStep2
					address={formData.address}
					option={formData.option}
					dietId={formData.dietId}
					onBack={(address, option, dietId) => {
						setFormData({ ...formData, address, option, dietId })
						setStep(0)
					}}
					onNext={(address, option, dietId) => {
						setFormData({ ...formData, address, option, dietId })

						if (
							formData.name === null ||
							formData.email === null ||
							formData.address === null ||
							formData.option === null ||
							formData.dietId === null
						) {
							alert('Wypełnij wszystkie pola')
							return
						}

						setStep(2)
					}}
				/>
			)}
			{step === 2 && (
				<div>
					<h2>Podsumowanie</h2>
					<p>Imię: {formData.name}</p>
					<p>Email: {formData.email}</p>
					<p>Adres: {formData.address}</p>
					<p>Opcja: {formData.option}</p>
					<p>Wysyłać maile: {formData.emailSend ? 'Tak' : 'Nie'}</p>
					<p>Dieta ID: {diety.find(d => d.id === formData.dietId)?.name}</p>
					<button onClick={() => setStep(1)}>Wstecz</button>
					<button onClick={() => alert('Formularz wysłany!')}>Wyślij</button>
				</div>
			)}
		</>
	)
}
