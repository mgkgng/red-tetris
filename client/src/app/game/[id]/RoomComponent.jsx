'use client'

import { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext.jsx";
import { redirect } from "next/navigation";

const RoomComponent = ({id}) => {
    const { socket } = useSocket();
    const [verified, setVerified] = useState(false);
    const [localStorageChecked, setLocalStorageChecked] = useState(false);
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedNickname = localStorage.getItem('nickname');
            console.log("nickname:", storedNickname);
            if (!storedNickname)
                redirect('/game');
            setNickname(storedNickname);
            setLocalStorageChecked(true);
        }
    }, [])

    useEffect(() => {
        if (socket && localStorageChecked) {
            socket.emit('verifyRoom', { roomId: id, nickname: nickname });

            // Listen for the response from the server
            socket.on('roomVerified', (response) => {
                console.log('room verified:', response)
                // Assume 'response' contains a boolean indicating verification success
                setVerified(response.success);

                // Optionally handle the case where verification fails
            });

            // Cleanup this effect to avoid memory leaks and multiple listeners being added
            return () => {
                socket.off('roomVerified');
            };
        }
    }, [socket, id, localStorageChecked]);

    return (
        <div>
        {verified ? 
            <h1>It's verified!</h1> 
            : 
            <h1>Checking for Room {id}</h1>
        }
        </div>
    )
}

export default RoomComponent;