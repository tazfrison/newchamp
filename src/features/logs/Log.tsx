import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLASSES, CLASS_ORDER, TEAM_NAMES } from '../../app/types';
import styles from './Logs.module.css';
import app from '../../app/App.module.css';
import { duration, fetchLogAction, formatter, LogPlayerProps, RoundProps, selectLog } from './logsSlice';

function LogPlayerRow(props: LogPlayerProps) {
  return (<tr className={styles.LogPlayerRow}>
    <td className={app[props.team]}>{TEAM_NAMES[props.team]}</td>
    <td className={styles.name}><Link to={`/players/${props.player?.steamId}`}>{props.player?.name}</Link></td>
    <td className={app[CLASSES[props.logClassStats![0].className]]}></td>
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

export default function Log() {
  const params = useParams();
  const log = useAppSelector(selectLog(parseInt(params.logId!)));
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (log && !log.rounds && !log.fetching) {
      dispatch(fetchLogAction(log.id));
    }
  }, [log, dispatch]);

  if (!log) {
    return (<div>Log not uploaded yet.</div>);
  }

  let players: LogPlayerProps[] = [];
  if (log.players) {
    players = log.players.slice().sort((a, b) => {
      if (a.team === b.team) {
        return CLASS_ORDER[a.logClassStats![0].className] - CLASS_ORDER[b.logClassStats![0].className];
      }
      return a.team.localeCompare(b.team);
    });
  }

  let rounds: RoundProps[] = [];
  if (log.rounds) {
    rounds = log.rounds;
  }

  return (<div className={styles.Log}>
    <div className={styles.header}>
      <div className={styles.left}>
        <div><b>{log.title}</b></div>
        <div>{log.map}</div>
        <div>{duration(log.duration)}</div>
      </div>
      <div className={styles.right}>
        <a href={`https://logs.tf/${log.id}`} target='_blank' rel='noreferrer'>View on Logs.tf</a>
        <div>{formatter(new Date(log.upload))}</div>
      </div>
    </div>
    <div className={styles.body}>
      <div className={styles.score}>
        <div className={app.Blue}>
          <div>BLU</div>
          <div>{log.bluScore}</div>
        </div>
        <div className={app.Red}>
          <div>{log.redScore}</div>
          <div>RED</div>
        </div>
      </div>
      <table className={styles.players}>
        <thead>
          <tr>
            <th>Team</th>
            <th>Name</th>
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
          {players.map(player => (<LogPlayerRow key={player.id} {...player} />))}
        </tbody>
      </table>
      <div className={styles.teams}>
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Kills</th>
              <th>Damage</th>
              <th>Charges</th>
              <th>Drops</th>
              <th>Caps</th>
              <th>Midfights</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={app.Red}>RED</td>
              <td>{log.teamStats.Red.kills}</td>
              <td>{log.teamStats.Red.dmg}</td>
              <td>{log.teamStats.Red.charges}</td>
              <td>{log.teamStats.Red.drops}</td>
              <td>{log.teamStats.Red.caps}</td>
              <td>{log.teamStats.Red.firstcaps}</td>
            </tr>
            <tr>
              <td className={app.Blue}>BLU</td>
              <td>{log.teamStats.Blue.kills}</td>
              <td>{log.teamStats.Blue.dmg}</td>
              <td>{log.teamStats.Blue.charges}</td>
              <td>{log.teamStats.Blue.drops}</td>
              <td>{log.teamStats.Blue.caps}</td>
              <td>{log.teamStats.Blue.firstcaps}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th>BLU</th>
              <th>RED</th>
              <th>BLU</th>
              <th>RED</th>
              <th>BLU</th>
              <th>RED</th>
              <th></th>
            </tr>
            <tr>
              <th>Round</th>
              <th>Length</th>
              <th>Score</th>
              <th>K</th>
              <th>K</th>
              <th>UC</th>
              <th>UC</th>
              <th>DA</th>
              <th>DA</th>
              <th>Midfights</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map(round => <tr key={round.number}>
              <td>{round.number}</td>
              <td>{duration(round.duration)}</td>
              <td className={app[round.winner || '']}>{round.winner ? TEAM_NAMES[round.winner] : ''}</td>
              <td>{round.teamStats.Blue.kills}</td>
              <td>{round.teamStats.Red.kills}</td>
              <td>{round.teamStats.Blue.ubers}</td>
              <td>{round.teamStats.Red.ubers}</td>
              <td>{round.teamStats.Blue.dmg}</td>
              <td>{round.teamStats.Red.dmg}</td>
              <td className={app[round.firstCap || '']}>{round.firstCap ? TEAM_NAMES[round.firstCap] : ''}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </div>);
}
