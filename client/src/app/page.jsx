'use client'

import React from 'react';
import styles from './page.module.css'
import Link from 'next/link';

export default function Home() {
	return (
		<div className="p-2 rounded-md flex gap-2">
			<div className=" absolute px-5 py-1 top-1/4 left-1/2 -translate-x-1/2 z-50">
				<h1 className={styles.title}>TETRISSIMO</h1>
			</div>
			<Link href="/join" className="bg-black text-white relative w-16 h-16 items-center justify-center hover:-translate-y-1">
				<p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Play</p>
			</Link>
			<Link href="/leaderboard" className="bg-black text-white relative w-16 h-16 items-center justify-center hover:-translate-y-1">
				<p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Rank</p>
			</Link>
		</div>
	)
}
