'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

type SingleDatePickerProps = {
	label: string
	date: Date | null
	onChange: (date: Date | null) => void
}

export function DatePicker({ label, date, onChange }: SingleDatePickerProps) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm font-medium">{label}</span>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn('w-[220px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? format(date, 'PPP', { locale: pl }) : <span>Wybierz datę</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date ?? undefined}
						onSelect={d => onChange(d ?? null)}
						// block past dates
						disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}
