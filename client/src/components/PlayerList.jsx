import { useEffect } from "react";

const PlayerList = ({ players, hostId, socketId }) => {
    useEffect(() => {
        console.log('PlayerList', players);
    
    }, [players])

    // icon for host, color for himself
    return (
        <div className="h-full w-24 border-white border-2">
            <div className="flex flex-col gap-2 p-3 w-full h-full">
                {players.map((player, index) => (
                    <div key={index} className="flex justify-between items-center border-white border-2 rounded-lg w-full h-24">
                        <div className={(player.id === hostId) ? "text-red" : "text-white"}>{player.nickname}</div>
                        <div className="text-white">{player.id === socketId ? 'You' : ''}</div>
                    </div>
                ))}
            </div>
        </div>
    );


};

export default PlayerList;