import { useRef, useState } from 'react'

export default function FormStep1({
	name,
	email,
	emailSend,
	onNext,
}: {
	name: string | null
	email: string | null
	emailSend: boolean
	onNext: (name: string | null, email: string | null, emailSend: boolean) => void
}) {
	'use client'

	const nameRef = useRef<HTMLInputElement>(null)
	const emailRef = useRef<HTMLInputElement>(null)

	const [tempSendEmail, setTempSendEmail] = useState(emailSend)

	return (
		<>
			<h2>FORM STEP 1</h2>
			<input ref={nameRef} placeholder="Imię" defaultValue={name ?? ''} />
			<input ref={emailRef} placeholder="Email" defaultValue={email ?? ''} />

			<button
				style={tempSendEmail ? { backgroundColor: 'green', color: 'white' } : {}}
				onClick={() => setTempSendEmail(true)}>
				Wysyłaj maile
			</button>
			<button
				style={!tempSendEmail ? { backgroundColor: 'green', color: 'white' } : {}}
				onClick={() => setTempSendEmail(false)}>
				Nie wysyłaj maile
			</button>

			<button onClick={() => onNext(nameRef.current?.value ?? null, emailRef.current?.value ?? null, tempSendEmail)}>
				Dalej
			</button>
		</>
	)
}
