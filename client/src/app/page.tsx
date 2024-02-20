'use client'
import Image from 'next/image'
import styles from './page.module.css'
import Button from '@/components/Button'
import Link from 'next/link';
import { useEffect } from 'react';


export default function Home() {
	let width, height;
	useEffect(() => {
		width = screen.width;
		height = screen.height;
		console.log(`Maximum Screen Width: ${width}, Maximum Screen Height: ${height}`);
	}, []);

	return (
		<div className="p-2 rounded-md flex gap-2">
			<div className=" absolute px-5 py-1 top-1/4 left-1/2 -translate-x-1/2 z-50">
				<h1 className={styles.title}>TETRISSIMO</h1>
			</div>
			<Link href="/game" className="bg-black text-white relative w-16 h-16 items-center justify-center">
				<p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Play</p>
			</Link>
			<Link href="/leaderboard" className="bg-black text-white relative w-16 h-16 items-center justify-center">
				<p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Rank</p>
			</Link>
		</div>
	)
}
