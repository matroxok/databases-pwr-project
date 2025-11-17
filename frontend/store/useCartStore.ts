import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Cart {
	dateStart: string
	dateEnd: string
	capacity: number
	roomName: string
	roomType: string
	roomCapacity: number
	roomPricePerNight: number
	roomDescription: string
	userName: string
	userNameSurname: string
	userEmail: string
	userPhone: string
	userAddress: string
	userSecondaryAddress?: string
	userCity: string
	userPostalCode: string
	userCountry: string
	userMessage?: string
	totalPrice: number
	totalNights: number
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

type CartState = {
	cart: Cart | null
	setInitialCart: (params: { dateStart: string; dateEnd: string; capacity: number; room: AvailableRoom }) => void
	updateUserData: (
		data: Partial<
			Pick<
				Cart,
				| 'userName'
				| 'userNameSurname'
				| 'userEmail'
				| 'userPhone'
				| 'userAddress'
				| 'userSecondaryAddress'
				| 'userCity'
				| 'userPostalCode'
				| 'userCountry'
				| 'userMessage'
			>
		>
	) => void
	clearCart: () => void
}

function calcNights(start: string, end: string): number {
	const s = new Date(start)
	const e = new Date(end)
	const diffMs = e.getTime() - s.getTime()
	return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))
}

export const useCartStore = create<CartState>()(
	persist(
		set => ({
			cart: null,

			setInitialCart: ({ dateStart, dateEnd, capacity, room }) =>
				set(() => {
					const nights = calcNights(dateStart, dateEnd)
					const pricePerNight = Number(room.price_per_night) || 0

					return {
						cart: {
							dateStart,
							dateEnd,
							capacity,
							roomName: room.name,
							roomType: room.room_type,
							roomCapacity: room.capacity,
							roomPricePerNight: pricePerNight,
							roomDescription: room.description,
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
							totalNights: nights,
							totalPrice: nights * pricePerNight,
						},
					}
				}),

			updateUserData: data =>
				set(state =>
					state.cart
						? {
								cart: {
									...state.cart,
									...data,
								},
						  }
						: state
				),

			clearCart: () => set({ cart: null }),
		}),
		{
			name: 'hotel-cart', // klucz w localStorage
		}
	)
)
