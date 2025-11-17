import { format } from 'date-fns'

export function toApiDate(date: Date | null): string | null {
	if (!date) return null
	return format(date, 'yyyy-MM-dd')
}
