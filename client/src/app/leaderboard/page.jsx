'use client'

import React, { useState, useEffect } from 'react';

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
        <div>
            <h1 className="text-white">Leaderboard</h1>
            {pageState === PAGE_STATES.LOADING ? (
                <p className="text-white">Loading...</p>
            ) : (
                <ul className="text-white">
                    {rank.map((entry, index) => (
                        <li key={index}>{entry.name}: {entry.score} {entry.date.split('T')[0]}</li>
                    ))}
                </ul>
            )}

        </div>
    );
}

export default Page;