import { MouseEventHandler, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { formatter } from '../logs/logsSlice';
import { ClassStats } from '../players/ClassStats';
import { fetchPlayerAction, selectPlayer, updateUserAction } from '../players/playersSlice';
import styles from './Users.module.css';
import { selectFullUser, selectUser } from './usersSlice';

function Player({ steamId }: { steamId: string }) {
  const dispatch = useAppDispatch();
  const player = useAppSelector(selectPlayer(steamId));
  useEffect(() => {
    if (player === undefined) {
      dispatch(fetchPlayerAction({ steamId }));
    }
  }, [steamId, player, dispatch]);

  if (!player) {
    return (<div></div>);
  }

  return (<div className={styles.Player}>
    <div><Link to={`/players/${steamId}`}>{player.name} {player.logPlayers?.length}</Link></div>
    {!!player.aggregatedClassStats?.length && <ClassStats stats={player.aggregatedClassStats} />}
  </div>);
}

export default function User() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const id = parseInt(params.userId!);
  const full = useAppSelector(selectFullUser(id));
  const user = useAppSelector(selectUser(id));
  if (!full) {
    return (<div>User not found</div>);
  }

  let voice;
  if (full.voiceAccount) {
    voice = (<div>
      <div>{full.voiceAccount.name}</div>
      {!!(user && user.mumble) && user.mumble.channel.path.map((name, i) => <div key={i}>{name}</div>)}
      <div>{Object.entries(full.voiceAccount.tags).map(([key, value]) => {
        return (<div key={key}>{key}: {value}</div>);
      })}</div>
    </div>)
  }

  const onClick = (key: string, value: any): MouseEventHandler<HTMLButtonElement> => () => {
    if (!full.player) {
      return;
    }
    dispatch(updateUserAction({
      id: full.player.id,
      key,
      value
    }));
  }
  let headerStyle = '';
  if (full.player?.admin) {
    headerStyle = styles.admin;
  } else if (full.player?.coach) {
    headerStyle = styles.coach;
  }

  return (<div className={styles.User}>
    <div className={styles.header}>
      <div className={headerStyle}>
        <div>{full.name}</div>
        {full.player?.admin && <div><span className={styles.hover}>Admin</span></div>}
        {full.player?.coach && <div><span className={styles.hover}>Coach</span></div>}
        <div>{user && 'Online'}</div>
      </div>
      <div>
        <div>First seen: {formatter(new Date(full.createdAt))}</div>
        <div>Last seen: {formatter(new Date(full.updatedAt))}</div>
        <div>Last IP: {full.ipCheck?.ip}</div>
      </div>
      <div>
        {!!full.player && [
          <button key='admin' onClick={onClick('admin', !full.player.admin)}>{full.player.admin ? 'Remove' : 'Make'} Admin</button>,
          <button key='coach' onClick={onClick('coach', !full.player.coach)}>{full.player.coach ? 'Remove' : 'Make'} Coach</button>
        ]}
      </div>
    </div>
    {full.player && (<Player steamId={full.player.steamId} />)}
    {voice}
  </div>);
}
