'use client'

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import TetrisGame from "@/components/tetris/TetrisGame";
import io from 'socket.io-client';

const Page = ({params}) => {
    const [socket, setSocket] = useState(null);
    const [roomVerified, setRoomVerified] = useState(false);
    const [localStorageChecked, setLocalStorageChecked] = useState(false);
    const [nickname, setNickname] = useState('');
    const [roomStateMessage, setRoomStateMessage] = useState('loading...');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedNickname = localStorage.getItem('nickname');
            console.log("nickname:", storedNickname);
            if (!storedNickname) // TODO maybe, i can create nickname directly while joining the room via url
                redirect('/game');
            setNickname(storedNickname);
            setLocalStorageChecked(true);
        }
    }, [])

    useEffect(() => {
        if (!localStorageChecked) return;
        async function VerifyRoom(){  
            try {
                console.log('verifying id', params.id)
                const response = await fetch(`http://localhost:3000/api/verify_room/${params.id}`);
                if (!response.ok) {
                    console.log(response.status)
                    // throw new Error('Room not found');
                    setRoomStateMessage('Room not found');
                    return;
                }
    
                const data = await response.json();
                console.log(data)
                setRoomVerified(true);
            } catch (error) {
                console.error(error);
                router.push('/');
            }
        };
        VerifyRoom();
    }, [localStorageChecked]);


    useEffect(() => {
        if (!roomVerified) return;
        const newSocket = io(`http://localhost:3000?nickname=${nickname}&room_id=${params.id}`);
        newSocket && setSocket(newSocket);

        return () => {
			newSocket.disconnect();
        };
    }, [roomVerified]);

    return (
        <div>
        {roomVerified ?
            <TetrisGame socket={socket} />
            :
            <div className="text-white">{roomStateMessage}</div>
        }
        </div>
    )
}

export default Page;