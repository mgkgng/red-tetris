import styles from './PlayerList.module.css';

const PlayerList = ({ players, hostId, socketId }) => {
    return (
        <div className={styles.playerListWrapper}>
            <div className={styles.playerList}>
                {players.map((player, index) => (
                    <div key={index} className={`
                        ${styles.playerCell}
                        ${(player.id === hostId) ? "border-2 border-red-300" : ""}
                        ${(player.id === socketId ? "bg-green-400" : "bg-slate-100")}
                        `}>
                        <span className={styles.emoji}>{player.emoji}</span>
                        <div>{player.nickname}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerList;