import Image from 'next/image'
import styles from './page.module.css'
import Button from '@/components/Button'
import Link from 'next/link';


export default function Home() {

	return (
		<div className="p-2 rounded-md flex gap-10">
			<Link href="/game" className="relative p-4 border-4 border-blue-300 w-32 h-32 text-blue-300 rounded-full items-center justify-center">
				<p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Play</p>
			</Link>
			<Link href="/leaderboard" className="relative p-4 border-4 border-red-300 w-32 h-32 text-red-300 rounded-full items-center justify-center">
				<p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Rank</p>
			</Link>
		</div>
	)
}
