import { ChangeEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAdmin, sendAction } from '../profile/profileSlice';
import { UserMenu } from '../users/UserMenu';
import { selectUsers, UserProps } from '../users/usersSlice';
import styles from './Servers.module.css';
import { LiveServerProps, selectMaps } from './serversSlice';

function Player(props: { player: UserProps }) {
  if (!props.player.tf2) {
    return (<div>{props.player.name} is not on a server</div>)
  }
  return (<Link to={`/players/${props.player.steamId}`}>{props.player.tf2.name}</Link>);
}

function PlayerList(props: { players: UserProps[] }) {
  const players = props.players.sort((a, b) => {
    return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
  });
  return (<div className={styles.playerlist}>
    {players.map(player => (
      <UserMenu key={player.id} user={player}>
        <Player player={player} />
      </UserMenu>
    ))}
  </div>);
}

export function ServerStub(server: LiveServerProps) {
  return (<div className={styles.ServerStub}>
    <div><a href={`steam://connect/${server.model.ip}:27015/${server.model.password}`}>{server.model.name}</a></div>
    <div>{server.map}</div>
  </div>);
}

export function Server(server: LiveServerProps) {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectAdmin);
  const maps = useAppSelector(selectMaps).slice();
  const users = useAppSelector(selectUsers);

  const players: UserProps[] = [];

  for (const player of Object.values(server.players)) {
    if (!users[player.userId]) {
      continue;
    }
    players.push(users[player.userId]);
  }

  let map = (<span>{server.map}</span>);

  if (isAdmin) {
    const mapChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
      if (window.confirm('Change ' + server.model.name + ' to ' + event.target.value + '?')) {
        dispatch(sendAction({
          route: `servers/${server.model.id}/changeLevel`,
          body: [event.target.value],
        }));
      }
    }

    if (maps.indexOf(server.map) === -1) {
      maps.unshift(server.map);
    }

    map = (<select value={server.map} onChange={mapChange}>
      {maps.map(map => (<option key={map} value={map}>{map}</option>))}
    </select>);
  }

  return (<div className={styles.Server}>
    <div className={styles.header}>
      <span><a href={`steam://connect/${server.model.ip}:27015/learning`}>{server.model.name}</a></span>
      {map}
    </div>
    <div className={styles.spectator}>
      <PlayerList players={players} />
    </div>
  </div>)
}
