'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import TetrisGame from "@/components/tetris/TetrisGame";
import io from 'socket.io-client';
import Modal from '@/components/Modal';

const Page = ({params}) => {
    const [socket, setSocket] = useState(null);
    const [roomVerified, setRoomVerified] = useState(false);
    const [localStorageChecked, setLocalStorageChecked] = useState(false);
    const [nickname, setNickname] = useState('');
    const [nameEmoji, setNameEmoji] = useState('');
    const [roomStateMessage, setRoomStateMessage] = useState('loading...');
    const [players, setPlayers] = useState([]);
    const [hostId, setHostId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [scores, setScores] = useState(new Map());
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
	const [hash, setHash] = useState('');
    const router = useRouter();

	useEffect(() => {
		const currentHash = window.location.hash;
	
		const hashValue = currentHash.substring(1);
        if (hashValue === '') {
            router.push('/');
            return ;
        }
        
		setHash(hashValue);
	}, []);

    function initializeScores() {
        const initialScores = new Map();
        players.forEach(playerId => { initialScores.set(playerId, 0); });
        setScores(initialScores);
    }
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedNickname = localStorage.getItem('nickname');
            const storedEmoji = localStorage.getItem('emoji');
            if (!storedNickname || !storedEmoji)
                redirect('/game');
            setNickname(storedNickname);
            setNameEmoji(storedEmoji);
            setLocalStorageChecked(true);
        }
    }, [])

    useEffect(() => {
        if (!localStorageChecked) return ;
        if (hash === '') return ;
        async function VerifyRoom(){  
            try {
                const response = await fetch(`http://localhost:3000/api/verify_room/${hash}`);
                if (!response.ok) {
                    setRoomStateMessage('Room not found');
                    return;
                }
    
                const data = await response.json();
                setPlayers(data.players);
                setHostId(data.host);
                initializeScores()
                setRoomVerified(true);
            } catch (error) {
                console.error(error);
                router.push('/');
            }
        };
        VerifyRoom();
    }, [localStorageChecked, hash]);

    useEffect(() => {
        if (!roomVerified) return;
        if (hash === '') return ;
        const newSocket = io(`http://localhost:3000?nickname=${nickname}&room_id=${hash}&emoji=${nameEmoji}`);
        newSocket && setSocket(newSocket);

        return () => {
			newSocket.disconnect();
        };
    }, [roomVerified, hash]);

    useEffect(() => {
        if (!socket) return ;

        socket.on('gameEnd', ({winner}) => {
			setGameStarted(false);
            if (!winner) {
                setModalMessage('Gameover');
            } else if (winner === socket.id) {
                setModalMessage('You are the winner');
            } else {
                const win = players.find(player => player.id === winner);
                win && setModalMessage('The winner is ' + win.nickname + ' ' + win.emoji);
            }
            setOpenModal(true);
        })

        socket.on('scoreUpdate', (data) => {
            setScores(prev => new Map(prev.set(data.player, data.score)));
        });

        socket.on('roomError', (data) => {
            setModalMessage(data.message);
            setShouldRedirect(true);
            setOpenModal(true);
        })

        socket.on('updateHost', ({id}) => {
            setHostId(id);
        })

        return (() => {
            socket.off('gameEnd');
            socket.off('scoreUpdate');
            socket.off('roomError');
        });
    }, [socket, players])

    return (
        <div className="relative w-full">
        {roomVerified ?
            <div className="flex gap-5 h-screen py-5 justify-center items-center">
                <TetrisGame socket={socket} 
                    players={players} setPlayers={setPlayers}
                    hostId={hostId} setHostId={setHostId}
                    scores={scores} setScores={setScores}
                    gameStarted={gameStarted} setGameStarted={setGameStarted}
                />
            </div>
            :
            <div className="text-white w-full h-full flex justify-center">{roomStateMessage}</div>
        }
        <Modal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
        >
            <div className="text-center">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                {modalMessage}
                </h3>
        
                <div className="flex justify-center gap-4">
                    <button onClick={() => {
                        if (shouldRedirect === true)
                            router.push('/');
                        setOpenModal(false);
                    }}>
                        Close
                    </button>
                </div>
            </div>
        </Modal>
        </div>
    )
}

export default Page;