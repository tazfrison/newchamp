import { Link, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { ClassStats } from './ClassStats';
import styles from './Players.module.css';
import { selectPlayers } from './playersSlice';

export function Stats() {
  return (<ClassStats />);
}

export function Players() {
  const players = Object.values(useAppSelector(selectPlayers))
    .filter(player => player !== null)
    .sort((a, b) =>
      a!.total === b!.total
        ? a!.name.localeCompare(b!.name)
        : b!.total! - a!.total!);

  return (<div className={styles.Players}>
    <div className={styles.playerList}>
      {players.map(player => (<Link
        className={styles.player}
        key={player!.steamId}
        to={`/players/${player!.steamId}`}
      >
        <div>{player!.name}</div>
        <div>{player!.logPlayers?.length}</div>
      </Link>))}
    </div>
    <div className={styles.content}>
      <Outlet />
    </div>
  </div>);
}