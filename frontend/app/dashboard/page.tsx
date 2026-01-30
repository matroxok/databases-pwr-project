'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { getMyReservations, updateReservation, deleteReservation } from '@/lib/routes'
import Navbar from '@/components/navbar'

type Reservation = {
	id: number
	room_id: string
	room_name: string
	check_in: string
	check_out: string
	guests_count: number
	status: string
	notes: string
	created_at: string
}

export default function MyReservations() {
	const [items, setItems] = React.useState<Reservation[]>([])
	const [loading, setLoading] = React.useState(true)

	const [editOpen, setEditOpen] = React.useState(false)
	const [editLoading, setEditLoading] = React.useState(false)
	const [current, setCurrent] = React.useState<Reservation | null>(null)

	const [form, setForm] = React.useState({
		check_in: '',
		check_out: '',
		guests_count: 1,
		notes: '',
	})

	const load = React.useCallback(async () => {
		try {
			setLoading(true)
			const data = (await getMyReservations()) as Reservation[]
			setItems(data)
		} catch (e: any) {
			toast.error(e?.message?.toString() || 'Nie udało się pobrać rezerwacji.')
		} finally {
			setLoading(false)
		}
	}, [])

	React.useEffect(() => {
		load()
	}, [load])

	const openEdit = (r: Reservation) => {
		setCurrent(r)
		setForm({
			check_in: r.check_in,
			check_out: r.check_out,
			guests_count: r.guests_count,
			notes: r.notes ?? '',
		})
		setEditOpen(true)
	}

	const submitEdit = async () => {
		if (!current) return
		if (!form.check_in || !form.check_out) {
			toast.error('Uzupełnij daty.')
			return
		}
		if (form.guests_count <= 0) {
			toast.error('Liczba gości musi być dodatnia.')
			return
		}

		try {
			setEditLoading(true)
			await updateReservation(current.id, {
				check_in: form.check_in,
				check_out: form.check_out,
				guests_count: form.guests_count,
				notes: form.notes,
			})
			toast.success('Zapisano zmiany ✅')
			setEditOpen(false)
			setCurrent(null)
			await load()
		} catch (e: any) {
			toast.error(e?.message?.toString() || 'Nie udało się zapisać zmian.')
		} finally {
			setEditLoading(false)
		}
	}

	const onDelete = async (r: Reservation) => {
		const ok = window.confirm('Na pewno usunąć rezerwację?')
		if (!ok) return

		try {
			await deleteReservation(r.id)
			toast.success('Usunięto rezerwację ✅')
			await load()
		} catch (e: any) {
			toast.error(e?.message?.toString() || 'Nie udało się usunąć rezerwacji.')
		}
	}

	return (
		<>
			<Navbar />
			<Card>
				<CardContent className="p-4 md:p-6 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Twoje rezerwacje</h2>
						<Button variant="ghost" onClick={load} disabled={loading}>
							Odśwież
						</Button>
					</div>

					{loading ? (
						<p className="text-sm text-muted-foreground">Ładowanie...</p>
					) : items.length === 0 ? (
						<p className="text-sm text-muted-foreground">Nie masz jeszcze żadnych rezerwacji.</p>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										{/* <TableHead>ID</TableHead> */}
										<TableHead>Pokój</TableHead>
										<TableHead>Check-in</TableHead>
										<TableHead>Check-out</TableHead>
										<TableHead>Goście</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Akcje</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{items.map(r => (
										<TableRow key={r.id}>
											{/* <TableCell>{r.id}</TableCell> */}
											<TableCell className="font-mono text-xs">{r.room_name}</TableCell>
											<TableCell>{r.check_in}</TableCell>
											<TableCell>{r.check_out}</TableCell>
											<TableCell>{r.guests_count}</TableCell>
											<TableCell>{r.status}</TableCell>
											<TableCell className="text-right space-x-2">
												<Button size="sm" variant="secondary" onClick={() => openEdit(r)}>
													Edytuj
												</Button>
												<Button size="sm" variant="destructive" onClick={() => onDelete(r)}>
													Usuń
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>

				<Dialog open={editOpen} onOpenChange={setEditOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edytuj rezerwację</DialogTitle>
							<DialogDescription>Zmień daty, liczbę gości lub notatkę.</DialogDescription>
						</DialogHeader>

						<div className="space-y-3">
							<div className="grid gap-2">
								<label className="text-sm font-medium">Check-in</label>
								<Input
									type="date"
									value={form.check_in}
									onChange={e => setForm(p => ({ ...p, check_in: e.target.value }))}
								/>
							</div>

							<div className="grid gap-2">
								<label className="text-sm font-medium">Check-out</label>
								<Input
									type="date"
									value={form.check_out}
									onChange={e => setForm(p => ({ ...p, check_out: e.target.value }))}
								/>
							</div>

							<div className="grid gap-2">
								<label className="text-sm font-medium">Liczba gości</label>
								<Input
									type="number"
									min={1}
									value={form.guests_count}
									onChange={e => setForm(p => ({ ...p, guests_count: Math.max(1, Number(e.target.value) || 1) }))}
								/>
							</div>

							<div className="grid gap-2">
								<label className="text-sm font-medium">Notatka</label>
								<Textarea
									value={form.notes}
									onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
									placeholder="Opcjonalnie..."
								/>
							</div>
						</div>

						<DialogFooter className="gap-2 sm:gap-0">
							<Button variant="ghost" onClick={() => setEditOpen(false)} disabled={editLoading}>
								Anuluj
							</Button>
							<Button onClick={submitEdit} disabled={editLoading}>
								{editLoading ? 'Zapisuję...' : 'Zapisz'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</Card>
		</>
	)
}
