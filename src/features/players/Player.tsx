import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import app from '../../app/App.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLASSES } from '../../app/types';
import { formatter, LogPlayerProps } from '../logs/logsSlice';
import { ClassStats } from './ClassStats';
import styles from './Players.module.css';
import { fetchPlayerAction, selectPlayer, selectPlayerStats } from './playersSlice';

function PlayerLog(props: LogPlayerProps) {
  let score = `${props.log?.redScore}-${props.log?.bluScore}`;
  let winner = props.log?.winner || 'Tie';
  return (<tr className={styles.PlayerLog}>
      <td title={props.log?.title}><Link to={`/logs/${props.logId}`}>{formatter(new Date(props.log!.upload))}</Link></td>
      <td className={app[winner]}>{score}</td>
      <td className={`${app[CLASSES[props.logClassStats![0].className]]} ${app[props.team]}`}>&nbsp;&nbsp;&nbsp;</td>
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
  const stats = useAppSelector(selectPlayerStats(player?.id));
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (player && !player.logPlayers && !player.fetching) {
      dispatch(fetchPlayerAction(player.steamId));
    }
  }, [player, dispatch]);

  if (!player) {
    return (<div>No player stats yet.</div>);
  }

  let logPlayers: LogPlayerProps[] = [];
  if (player.logPlayers) {
    logPlayers = player.logPlayers.slice().sort((a, b) => {
      return new Date(b.log!.upload).getTime() - new Date(a.log!.upload).getTime();
    });
  }

  return (<div className={styles.Player}>
    <div className={styles.header}>
      <div>{player.name}</div>
      <div className={styles.links}>
        <a href={`https://logs.tf/profile/${player.steamId}`} target='_blank' rel='noreferrer'>
          <img alt='Logs.TF' src='../images/logstf_small.png' />
        </a>
        <a href={`https://steamcommunity.com/profile/${player.steamId}`} target='_blank' rel='noreferrer'>
          <img alt='Steam' src='../images/logo_steam.svg' />
        </a>
        <a href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${player.steamId}`} target='_blank' rel='noreferrer'>
          <img alt='RGL' src='../images/rglgg_logo_small.png' />
        </a>
      </div>
    </div>
    <table className={styles.logs}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Score</th>
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
    <ClassStats stats={Object.values(stats || {})} />
  </div>);
}
