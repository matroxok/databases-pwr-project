import { useEffect, useRef, useState } from 'react'

export default function FormStep2({
	address,
	dietId,
	onNext,
	onBack,
}: {
	address: string | null
	option: string | null
	dietId: string | null
	onNext: (address: string | null, option: string | null, dietId: string | null) => void
	onBack: (address: string | null, option: string | null, dietId: string | null) => void
}) {
	'use client'

	const addressRef = useRef<HTMLInputElement>(null)
	const selectRef = useRef<HTMLSelectElement>(null)

	const diety = [
		{ id: '1', name: 'Dieta Standard' },
		{ id: '2', name: 'Dieta Chujowa' },
		{ id: '3', name: 'Dieta dla Cwela' },
	]

	const [selectedDietId, setSelectedDietId] = useState<string | null>(dietId)

	return (
		<>
			<input ref={addressRef} placeholder="Adres" defaultValue={address ?? ''} />
			<select ref={selectRef}>
				<option value="opcja1">Opcja 1</option>
				<option value="opcja2">Opcja 2</option>
				<option value="opcja3">Opcja 3</option>
			</select>
			// radio
			<br />
			{diety.map(d => (
				<button
					key={d.id}
					style={selectedDietId === d.id ? { backgroundColor: 'green', color: 'white' } : {}}
					onClick={() => setSelectedDietId(d.id)}>
					{d.name}
				</button>
			))}
			<br />
			<button
				onClick={() => onNext(addressRef.current?.value ?? null, selectRef.current?.value ?? null, selectedDietId)}>
				Dalej
			</button>
			<button
				onClick={() => onBack(addressRef.current?.value ?? null, selectRef.current?.value ?? null, selectedDietId)}>
				Wstecz
			</button>
		</>
	)
}
