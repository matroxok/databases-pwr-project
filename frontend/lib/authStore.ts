import { create } from 'zustand'

type User = { email: string; password: string } | null

interface AuthState {
	user: User
	isAuthenticated: boolean
	setUser: (u: User) => void
	clear: () => void
}

export const useAuthStore = create<AuthState>(set => ({
	user: null,
	isAuthenticated: false,
	setUser: u => set({ user: u, isAuthenticated: !!u }),
	clear: () => set({ user: null, isAuthenticated: false }),
}))
