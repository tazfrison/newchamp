import { useState } from 'react';
import { Link } from 'react-router-dom';
import app from '../../app/App.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLASSES, SKILL_TITLES } from '../../app/types';
import { duration, round } from '../logs/logsSlice';
import { AggregateClassStatProps, selectGlobalStats, selectPlayerStats } from '../players/playersSlice';
import { selectAdmin } from '../profile/profileSlice';
import { UserProps } from '../users/usersSlice';
import styles from './Drafter.module.css';
import { setIsOpen } from './draftSlice';

interface DrafteeProps extends UserProps {
  draftClass: CLASSES;
}

export default function Draftee(props: DrafteeProps) {
  const isAdmin = useAppSelector(selectAdmin);
  const stats = useAppSelector(selectPlayerStats(props.player?.id));
  const global = useAppSelector(selectGlobalStats) || {};
  const [expanded, setExpanded] = useState(false);
  const dispatch = useAppDispatch();

  const skillLevel = props.tags[props.draftClass]!;

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    dispatch(setIsOpen(true));
    event.dataTransfer.setData('name', props.name);
    event.dataTransfer.setData('userid', props.id.toString());
    event.dataTransfer.setData('skill', skillLevel.toString());
    event.dataTransfer.setData(props.draftClass, props.draftClass);
  };

  const onDragEnd = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    dispatch(setIsOpen(false));
  };

  let statBlock = (<div></div>);
  if (expanded) {
    if (stats && stats[props.draftClass]) {
      const stat = stats[props.draftClass]!;
      const globalStat = global[props.draftClass] as any;
      const getStatItem = (type: keyof AggregateClassStatProps) => {
        const value: number = stat[type] as number;
        if (undefined === globalStat
          || undefined === globalStat[type]
          || undefined === globalStat[type + '_sd']
        ) {
          return (<td>{round(value)}</td>);
        }
        const average = globalStat[type] as number;
        const deviation = globalStat[type + '_sd'] as number;
        let style;
        if (value < (average - deviation)) {
          style = styles.lower;
        } else if (value > (average + deviation)) {
          style = styles.upper;
        }
        return (<td className={style} title={`${round(average - deviation)} - ${round(average + deviation)}`}>{round(value)}</td>);
      }
      statBlock = (<div className={styles.stats}>
        <table>
          <thead>
            <tr>
              <th>Playtime</th>
              <th>KA/D</th>
              <th>K/M</th>
              <th>D/M</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{duration(stat.playtime)}</td>
              {getStatItem('ka_d')}
              {getStatItem('k_m')}
              {getStatItem('da_m')}
            </tr>
          </tbody>
        </table>
      </div>);
    } else {
      statBlock = (<div>No stats for this class</div>);
    }
  }

  let name = (<div>{props.name}</div>);
  let count = '0/0/0';
  if (props.steamId) {
    if (stats && stats[props.draftClass]) {
      const total = stats[props.draftClass]?.count || 0;
      const wins = stats[props.draftClass]?.wins || 0;
      const losses = stats[props.draftClass]?.losses || 0;
      count = `${wins}/${total - wins - losses}/${losses}`;
    }
    name = (<Link to={`/players/${props.steamId}`}>{props.name}</Link>);
  }

  return (<div
    className={`${styles.Draftee} ${styles['experience' + skillLevel]}`}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onClick={() => setExpanded(!expanded)}
    draggable={isAdmin}
    title={SKILL_TITLES[skillLevel]}
  >
    <div className={styles.header}>
      <div className={app[props.draftClass]}></div>
      {name}
      <div>{count}</div>
    </div>
    {statBlock}
  </div>);
}