'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'

type FormStep2Props = {
	onNext: () => void
	onBack: () => void
}

export default function FormStep2({ onNext, onBack }: FormStep2Props) {
	const { cart, updateUserData } = useCartStore()

	const [form, setForm] = useState({
		userName: '',
		userNameSurname: '',
		userEmail: '',
		userPhone: '',
		userAddress: '',
		userSecondaryAddress: '',
		userCity: '',
		userPostalCode: '',
		userCountry: '',
		userMessage: '',
	})

	useEffect(() => {
		if (!cart) return

		setForm({
			userName: cart.userName,
			userNameSurname: cart.userNameSurname,
			userEmail: cart.userEmail,
			userPhone: cart.userPhone,
			userAddress: cart.userAddress,
			userSecondaryAddress: cart.userSecondaryAddress ?? '',
			userCity: cart.userCity,
			userPostalCode: cart.userPostalCode,
			userCountry: cart.userCountry,
			userMessage: cart.userMessage ?? '',
		})
	}, [cart])

	if (!cart) {
		return (
			<div className="pt-10">
				<p>Brak danych koszyka – wróć do wyboru pokoju.</p>
				<button onClick={onBack}>Wróć</button>
			</div>
		)
	}

	const handleChange = (field: keyof typeof form, value: string) => {
		setForm(prev => ({ ...prev, [field]: value }))
	}

	const handleSubmit = () => {
		updateUserData(form)
		// TODO: walidacja
		onNext()
	}

	return (
		<div className="pt-10 flex flex-col gap-6">
			<h2 className="text-xl font-semibold">FORM STEP 2 – Dane gościa</h2>

			{/* podsumowanie z koszyka */}
			<div className="border rounded-lg p-4 bg-card">
				<p>
					<strong>Pokój:</strong> {cart.roomName} ({cart.roomType}), max {cart.roomCapacity} os.
				</p>
				<p>
					<strong>Termin:</strong> {cart.dateStart} – {cart.dateEnd} ({cart.totalNights} nocy)
				</p>
				<p>
					<strong>Cena:</strong> {cart.totalPrice} zł
				</p>
			</div>

			{/* formularz */}
			<div className="grid gap-3 max-w-lg">
				<input
					className="border rounded px-2 py-1 bg-background"
					placeholder="Imię"
					value={form.userName}
					onChange={e => handleChange('userName', e.target.value)}
				/>
				<input
					className="border rounded px-2 py-1 bg-background"
					placeholder="Nazwisko"
					value={form.userNameSurname}
					onChange={e => handleChange('userNameSurname', e.target.value)}
				/>
				<input
					className="border rounded px-2 py-1 bg-background"
					placeholder="E-mail"
					value={form.userEmail}
					onChange={e => handleChange('userEmail', e.target.value)}
				/>
			</div>

			<div className="flex gap-2">
				<button
					onClick={onBack}
					className="inline-flex items-center rounded bg-secondary px-4 py-2 text-sm font-medium">
					Wstecz
				</button>
				<button
					onClick={handleSubmit}
					className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
					Dalej
				</button>
			</div>
		</div>
	)
}
