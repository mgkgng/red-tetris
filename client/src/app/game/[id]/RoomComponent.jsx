'use client'

import { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";

const RoomComponent = ({id}) => {
    const { socket } = useSocket();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.emit('verifyRoom', { roomId: id });

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
    }, [socket, id]); // Re-run the effect if `socket` or `id` changes

    return (

        <div>
            <h1>Room {id}</h1>
        </div>
    )
}

export default RoomComponent;