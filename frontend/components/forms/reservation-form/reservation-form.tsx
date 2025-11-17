'use client'
import { useState } from 'react'
import FormStep1 from './step-1'
import FormStep2 from './step-2'

type FormData = {
	name: string | null
	email: string | null
	address: string | null
	option: string | null
	emailSend: boolean
	dietId: string | null
}

export default function Form() {
	// 1 - IMIE, MAIL
	// 2- ADRESS

	const [step, setStep] = useState(0)

	const [formData, setFormData] = useState<FormData>({
		name: null,
		email: null,
		address: null,
		option: null,
		emailSend: false,
		dietId: null,
	})
	const diety = [
		{ id: '1', name: 'Dieta Standard' },
		{ id: '2', name: 'Dieta Chujowa' },
		{ id: '3', name: 'Dieta dla Cwela' },
	]
	return (
		<>
			{step === 0 && (
				<FormStep1
					name={formData.name}
					email={formData.email}
					emailSend={formData.emailSend}
					onNext={(name, email, emailSend) => {
						setFormData({ ...formData, name: name, email, emailSend })
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
