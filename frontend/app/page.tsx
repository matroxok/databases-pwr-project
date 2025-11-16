import Link from 'next/link'

export default function Home() {
	return (
		<div className="w-full h-screen flex items-center justify-center">
			<div className="flex flex-col items-center justify-center">
				<h1 className="font-bold text-2xl">dev hotel app</h1>
				<p className="pt-5">legend:</p>
				<div className="flex gap-4 pt-2">
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 rounded-full bg-green-200"></div>
						<p>Endpoint accessible without logging in </p>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 rounded-full bg-blue-200"></div>
						<p>
							Endpoint accessible <span className="font-bold">only</span> after login
						</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 rounded-full bg-red-300"></div>
						<p>Endpoint other </p>
					</div>
				</div>
				<div className="flex items-center gap-4 py-5">
					<Link
						href="/auth/login"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-green-200">
						Login
					</Link>
					<Link
						href="/auth/signup"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-green-200">
						Registry
					</Link>
					<Link
						href="/dashboard/"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-blue-200">
						Dashboard
					</Link>
					<Link
						href="/auth/logout"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-red-300">
						Logout
					</Link>
					<Link
						href="/auth/logout"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-green-200">
						reset password
					</Link>
					<Link
						href="/auth/logout"
						className="px-2 py-2 border shadow-l active:bg-green-200 cursor-pointer text-xl bg-blue-200">
						change password
					</Link>
				</div>
				<p>other links:</p>
				<div className="flex items-center gap-4">
					<Link href="http://localhost:8000/api/docs" target="blank" className="underline text-blue-500">
						docs
					</Link>
				</div>
			</div>
		</div>
	)
}
