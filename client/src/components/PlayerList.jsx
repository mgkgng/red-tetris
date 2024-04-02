const PlayerList = ({ players, hostId, socketId }) => {
    return (
        <div className="h-full absolute left-0">
            <div className="flex flex-col gap-1 p-3 w-28 h-full">
                {players.map((player, index) => (
                    <div key={index} className={`
                        flex flex-col gap-1 justify-center items-center py-4 text-black border-2 rounded-sm w-full
                        ${(player.id === hostId) ? "border-2 border-red-300" : ""}
                        ${(player.id === socketId ? "bg-green-400" : "bg-slate-100")}
                        `}>
                        <span className="text-5xl">{player.emoji}</span>
                        <div>{player.nickname}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerList;