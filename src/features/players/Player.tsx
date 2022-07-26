import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import app from '../../app/App.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLASSES, RED } from '../../app/types';
import { formatter, LogPlayerProps } from '../logs/logsSlice';
import { AggregateClassStatProps, ClassStats } from './ClassStats';
import styles from './Players.module.css';
import { fetchPlayerAction, selectPlayer } from './playersSlice';

function PlayerLog(props: LogPlayerProps) {
  return (<tr className={styles.PlayerLog}>
      <td title={props.log?.title}><Link to={`/logs/${props.logId}`}>{formatter(new Date(props.log!.upload))}</Link></td>
      <td className={props.team === RED ? app.red : app.blu}>{props.team}</td>
      <td className={app[CLASSES[props.logClassStats![0].className]]}>&nbsp;&nbsp;&nbsp;</td>
      <td>{props.kills}</td>
      <td>{props.assists}</td>
      <td>{props.deaths}</td>
      <td>{props.damage}</td>
      <td>{Math.round(props.damage / (props.playtime / 60))}</td>
      <td>{Math.round(10 * (props.kills + props.assists) / props.deaths) / 10}</td>
      <td>{Math.round(10 * props.kills / props.deaths) / 10}</td>
      <td>{props.damageTaken}</td>
      <td>{Math.round(props.damageTaken / (props.playtime / 60))}</td>
      <td>{props.healthPacks}</td>
      <td>{props.airshots}</td>
      <td>{props.captures}</td>
    </tr>);
}

export default function Player() {
  const params = useParams();
  const player = useAppSelector(selectPlayer(params.steamId!));
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (player && !player.logPlayers && !player.fetching) {
      dispatch(fetchPlayerAction(player.steamId));
    }
  }, [player, dispatch]);

  if (!player) {
    return (<div>No player stats yet.</div>);
  }

  const stats: { [className in CLASSES]?: AggregateClassStatProps } = {};

  let logPlayers: LogPlayerProps[] = [];
  if (player.logPlayers) {
    logPlayers = player.logPlayers.slice().sort((a, b) => {
      return new Date(b.log!.upload).getTime() - new Date(a.log!.upload).getTime();
    });
  }

  logPlayers.forEach(logPlayer => {
    if (logPlayer.logClassStats) {
      logPlayer.logClassStats.forEach(classStats => {
        if (!stats[classStats.className]) {
          stats[classStats.className] = JSON.parse(JSON.stringify(classStats));
          stats[classStats.className]!.total = 1;
        } else {
          ['kills', 'assists', 'deaths', 'damage', 'playtime',].forEach(stat => {
            (stats[classStats.className] as any)[stat] += (classStats as any)[stat];
          });
          stats[classStats.className]!.total += 1;
        }
      });
    }
  });

  return (<div className={styles.Player}>
    {player.name}
    <table className={styles.logs}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Team</th>
          <th>C</th>
          <th>K</th>
          <th>A</th>
          <th>D</th>
          <th>DA</th>
          <th>DA/M</th>
          <th>KA/D</th>
          <th>K/D</th>
          <th>DT</th>
          <th>DT/M</th>
          <th>HP</th>
          <th>AS</th>
          <th>CAP</th>
        </tr>
      </thead>
      <tbody>
        {logPlayers.map(logPlayer => <PlayerLog key={logPlayer.id} {...logPlayer} />)}
      </tbody>
    </table>
    <ClassStats stats={Object.values(stats)} />
  </div>);
}
