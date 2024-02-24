import { useEffect } from "react";

const PlayerList = ({ socket, players, setPlayers }) => {
    console.log('PlayerList', players);

    useEffect(() => {
        if (!socket) return;

        socket.on('updateHost', (data) => {
            console.log('updateHost', data);
            if (data.id === socket.id) {
                console.log('You are the host');
            }
            
        });

        socket.on('playerJoined', (data) => {
            console.log('playerJoined', data)
            setPlayers(prev => [...prev, data]);
        });

        socket.on('playerLeft', (data) => {
            console.log('playerLeft', data)
            setPlayers(prev => prev.filter(player => player.id !== data.id));
        });
    }, [socket]);

    return (
        <div className="h-full w-24 border-white border-2">
            <div className="flex flex-col gap-2 p-3 w-full h-full">
                {players.map((player, index) => (
                    <div key={index} className="flex justify-between items-center border-white border-2 rounded-lg w-full h-24">
                        <div className="text-white">{player.nickname}</div>
                        <div className="text-white">{player.id === socket?.id ? 'You' : ''}</div>
                    </div>
                ))}
            </div>
        </div>
    );


};

export default PlayerList;