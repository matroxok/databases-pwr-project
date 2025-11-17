'use client'

import { useEffect, useState, useCallback } from 'react'

export function useStepWithHistory(initialStep = 0) {
	const [step, setStep] = useState(initialStep)

	useEffect(() => {
		if (typeof window === 'undefined') return

		// Upewniamy się, że pierwszy wpis w historii ma state ze stepem
		window.history.replaceState({ step: initialStep }, '')

		const handlePopState = (event: PopStateEvent) => {
			// jeśli w state mamy step → cofamy tylko krok
			const stateStep = (event.state && (event.state as any).step) ?? initialStep
			setStep(stateStep)
		}

		window.addEventListener('popstate', handlePopState)
		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [initialStep])

	const goToStep = useCallback((nextStep: number) => {
		setStep(nextStep)
		if (typeof window !== 'undefined') {
			window.history.pushState({ step: nextStep }, '')
		}
	}, [])

	return { step, goToStep, setStep }
}
