'use client'

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import TetrisGame from "@/components/tetris/TetrisGame";
import io from 'socket.io-client';

const Page = ({id}) => {
    const [socket, setSocket] = useState(null);
    const [verified, setVerified] = useState(false);
    const [localStorageChecked, setLocalStorageChecked] = useState(false);
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedNickname = localStorage.getItem('nickname');
            console.log("nickname:", storedNickname);
            // TODO maybe, i can create nickname directly while joining the room via url
            if (!storedNickname)
                redirect('/game');
            setNickname(storedNickname);
            setLocalStorageChecked(true);
        }
    }, [])

    useEffect(() => {
        if (!localStorageChecked) return;
        const newSocket = io(`http://localhost:3000?nickname=${nickname}`);
        newSocket && setSocket(newSocket);

        return () => {
			newSocket.disconnect();
        };
    }, [localStorageChecked]);

    return (
        <div>
        <TetrisGame socket={socket} />
        </div>
    )
}

export default Page;