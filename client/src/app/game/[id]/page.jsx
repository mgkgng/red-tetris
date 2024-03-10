'use client'

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import TetrisGame from "@/components/tetris/TetrisGame";
import io from 'socket.io-client';
import { Button, Modal } from 'flowbite-react';

const Page = ({params}) => {
    const [socket, setSocket] = useState(null);
    const [roomVerified, setRoomVerified] = useState(false);
    const [localStorageChecked, setLocalStorageChecked] = useState(false);
    const [nickname, setNickname] = useState('');
    const [roomStateMessage, setRoomStateMessage] = useState('loading...');
    const [players, setPlayers] = useState([]);
    const [hostId, setHostId] = useState(null);
    const [winnerId, setWinnerId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedNickname = localStorage.getItem('nickname');
            console.log("nickname:", storedNickname);
            if (!storedNickname) // TODO maybe, i can create nickname directly while joining the room via url
                redirect('/game');
            setNickname(storedNickname);
            setLocalStorageChecked(true);
            localStorage.removeItem('nickname');
        }
    }, [])

    useEffect(() => {
        if (!localStorageChecked) return;
        async function VerifyRoom(){  
            try {
                const response = await fetch(`http://localhost:3000/api/verify_room/${params.id}`);
                if (!response.ok) {
                    console.log(response.status)
                    // throw new Error('Room not found');
                    setRoomStateMessage('Room not found');
                    return;
                }
    
                const data = await response.json();
                console.log("first data received:", data)
                setPlayers(data.players);
                setHostId(data.host);
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

    useEffect(() => {
        if (!socket) return ;

        socket.on('gameEnd', ({winner}) => {
            setOpenModal(true);
            winner && setWinnerId(winner);
        })

        socket.on('scoreUpdate', (data) => {
            console.log('score:', data)
            setScore(score);
        });

        return (() => {
            socket.off('gameEnd');
        });
    }, [socket])

    return (
        <div className="relative">
        {roomVerified ?
            <div className="flex gap-5">
                <TetrisGame socket={socket} 
                    players={players} setPlayers={setPlayers}
                    hostId={hostId} setHostId={setHostId}
                />
            </div>
            :
            <div className="text-white">{roomStateMessage}</div>
        }
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Body className="modal1">
            <div className="text-center modal2">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                The winner is <b>{players.find(player => player.id === winnerId)?.nickname}</b>
                </h3>
                <div className="flex justify-center gap-4">
                <Button color="gray" onClick={() => setOpenModal(false)}>
                    Go Back
                </Button>
                </div>
            </div>
            </Modal.Body>
        </Modal>
        </div>
    )
}

export default Page;