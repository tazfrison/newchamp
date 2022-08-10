import React, { ChangeEventHandler } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAdmin, sendAction } from '../profile/profileSlice';
import { UserMenu } from '../users/UserMenu';
import { selectUsers, UserProps } from '../users/usersSlice';
import styles from './Servers.module.css';
import app from '../../app/App.module.css';
import { selectMaps, selectServer } from './serversSlice';
import { TEAMS, CLASS_ORDER } from '../../app/types';
import { Link } from 'react-router-dom';

function Player(props: { player: UserProps }) {
  if (!props.player.tf2) {
    return (<div>{props.player.name} is not on a server</div>)
  }

  switch (props.player.tf2.team) {
    case 'Spectator':
      return (<Link to={`/players/${props.player.steamId}`}>{props.player.tf2.name}</Link>);
    case 'Blue':
    case 'Red':
      return (<div
        className={`${styles.player} ${app[props.player.tf2.class]}`}
        title={props.player.tf2.name}
      >
        <Link to={`/players/${props.player.steamId}`}>{props.player.tf2.name}</Link>
      </div>);
    default:
      return (<div><i><Link to={`/players/${props.player.steamId}`}>{props.player.tf2.name}</Link></i></div>);
  }
}

function PlayerList(props: { players: number[] }) {
  const users = useAppSelector(selectUsers);
  const players = props.players.map(id => users[id]).sort((a, b) => {
    if (a.tf2?.class === b.tf2?.class) {
      return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
    }
    return CLASS_ORDER[a.tf2!.class] - CLASS_ORDER[b.tf2!.class];
  });
  return (<div className={styles.playerlist}>
    {players.map(player => (
      <UserMenu key={player.id} user={player}>
        <Player player={player} />
      </UserMenu>
    ))}
  </div>);
}

export function ServerStub(props: { ip: string }) {
  const server = useAppSelector(selectServer(props.ip));
  return (<div className={styles.ServerStub}>
    <div><a href={`steam://connect/${server.ip}:27015/${server.password}`}>{server.name}</a></div>
    <div>{server.time}</div>
    <div className={styles.score}>
      <span className={app.Blue}>{server.score.Blue}</span>
      <span className={app.Red}>{server.score.Red}</span>
    </div>
    <div>{server.live ? 'Live' : ''}</div>
    <div>{server.paused ? 'Paused' : ''}</div>
  </div>);
}

export function Server(props: { ip: string }) {
  const dispatch = useAppDispatch();
  const server = useAppSelector(selectServer(props.ip));
  const isAdmin = useAppSelector(selectAdmin);
  const maps = useAppSelector(selectMaps).slice();

  const players: { [team in TEAMS]: number[] } = {
    [TEAMS.Red]: [],
    [TEAMS.Blue]: [],
    [TEAMS.Spectator]: [],
    [TEAMS.Unassigned]: [],
  };

  for (const [key, { team }] of Object.entries(server.players)) {
    if (players[team]) {
      players[team].push(parseInt(key));
    } else {
      players[TEAMS.Unassigned].push(parseInt(key));
    }
  }

  let map = (<span>{server.map}</span>);

  if (isAdmin) {
    const mapChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
      if (window.confirm('Change ' + server.ip + ' to ' + event.target.value + '?')) {
        dispatch(sendAction({
          route: `server/${props.ip}/changeLevel`,
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

  return (<div className={styles.server}>
    <div className={styles.header}>
      <span><a href={`steam://connect/${server.ip}:27015/learning`}>{server.name}</a></span>
      <span>{server.time}</span>
      {map}
      <span>{server.live ? 'Live' : ''}</span>
      <span>{server.paused ? 'Paused' : ''}</span>
    </div>
    <div className={styles.teams}>
      <div className={app.Blue}>
        <div className={styles.header}>
          <b>BLU</b><b>{server.score.Blue}</b>
        </div>
        <PlayerList players={players.Blue} />
      </div>
      <div className={app.Red}>
        <div className={styles.header}>
          <b>{server.score.Red}</b><b>RED</b>
        </div>
        <PlayerList players={players.Red} />
      </div>
    </div>
    <div className={styles.spectator}>
      <PlayerList players={players.Spectator.concat(players.Unassigned)} />
    </div>
  </div>)
}
