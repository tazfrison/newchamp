import { Link, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { AggregateClassStatProps, ClassStats } from './ClassStats';
import styles from './Players.module.css';
import { selectPlayers, selectStats } from './playersSlice';

export function Stats() {
  const stats = useAppSelector(selectStats);

  let classStats: AggregateClassStatProps[] = [];
  if (stats) {
    classStats = Object.values(stats);
  }
  return (<ClassStats stats={classStats} />);
}

export function Players() {
  const players = Object.values(useAppSelector(selectPlayers))
    .sort((a, b) =>
      a.LogCount === b.LogCount
        ? a.name.localeCompare(b.name)
        : b.LogCount! - a.LogCount!);

  return (<div className={styles.Players}>
    <div className={styles.playerList}>
      {players.map(player => (<Link
        className={styles.player}
        key={player.steamId}
        to={`/players/${player.steamId}`}
      >
        <div>{player.name}</div>
        <div>{player.LogCount}</div>
      </Link>))}
    </div>
    <div className={styles.content}>
      <Outlet />
    </div>
  </div>);
}