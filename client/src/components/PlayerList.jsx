import { useEffect } from "react";

const PlayerList = ({ players, hostId, socketId }) => {
    return (
        <div className="h-full w-28 ">
            <div className="flex flex-col gap-2 p-3 w-full h-full">
                {players.map((player, index) => (
                    <div key={index} className="flex flex-col justify-center items-center p-2 border-white border-2 rounded-sm w-full h-24">
                        <span className="text-5xl">{player.emoji}</span>
                        <div className={(player.id === hostId) ? "text-red-400" : "text-white"}>{player.nickname}</div>
                    </div>
                ))}
            </div>
        </div>
    );


};

export default PlayerList;