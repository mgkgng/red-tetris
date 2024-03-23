'use client'

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

const PAGE_STATES = {
    LOADING: 0,
    LOADED: 1
};

const Page = () => {
    const [pageState, setPageState] = useState(PAGE_STATES.LOADING);
    const [rank, setRank] = useState([]);

	async function fetchRank() {
        try {
            const response = await fetch(`http://localhost:3000/api/get_rank`);
            const data = await response.json();
            console.log(data);
            setRank(data);
            if (pageState === PAGE_STATES.LOADING)
                setPageState(PAGE_STATES.LOADED);
        } catch (e) {
            console.error(e);
        }
	}

    useEffect(() => {
        fetchRank();
    }, [])

    return (
        <div className="border-2 w-3/5 min-w-96 pt-6 pb-4 px-5 rounded-sm">
            {pageState === PAGE_STATES.LOADING ? (
                <p className="text-white">Loading...</p>
            ) : (
                <div className="text-white">
                    {rank.map((entry, index) => (
                        <div className={styles.rankRow}>
                            <p>{index}</p>
                            <p className='text-2xl'>{entry.emoji}</p>
                            <p>{entry.name}</p>
                            <p>{entry.score}</p>
                            <p>{entry.date.split('T')[0]}</p>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default Page;