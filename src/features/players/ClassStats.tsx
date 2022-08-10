import { useEffect } from 'react';
import app from '../../app/App.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLASS_NAMES, CLASS_ORDER } from '../../app/types';
import { duration, round } from '../logs/logsSlice';
import styles from './Players.module.css';
import { fetchStatsAction, selectGlobalStats, AggregateClassStatProps } from './playersSlice';

export function ClassStats(props: { stats?: AggregateClassStatProps[] }) {
  const dispatch = useAppDispatch();
  const globalStats = useAppSelector(selectGlobalStats);
  const personal = !!props.stats;

  useEffect(() => {
    if (globalStats === undefined) {
      dispatch(fetchStatsAction());
    }
  }, [globalStats, dispatch]);
  const stats = (props.stats || Object.values(globalStats || {})).sort((a, b) => CLASS_ORDER[a.className] - CLASS_ORDER[b.className]);

  const rows = stats.map(classStats => {
    let rangeStats = {
      k_m: [classStats.k_m, classStats.k_m] as [number, number],
      a_m: [classStats.a_m, classStats.a_m] as [number, number],
      de_m: [classStats.de_m, classStats.de_m] as [number, number],
      da_m: [classStats.da_m, classStats.da_m] as [number, number],
    };
    if (globalStats && globalStats[classStats.className]) {
      const globalClass = globalStats[classStats.className]!;
      rangeStats = {
        k_m: [globalClass.k_m - globalClass.k_m_sd, globalClass.k_m + globalClass.k_m_sd],
        a_m: [globalClass.a_m - globalClass.a_m_sd, globalClass.a_m + globalClass.a_m_sd],
        de_m: [globalClass.de_m - globalClass.de_m_sd, globalClass.de_m + globalClass.de_m_sd],
        da_m: [globalClass.da_m - globalClass.da_m_sd, globalClass.da_m + globalClass.da_m_sd],
      };
    }

    const getStyle = (value: number, range: [number, number]) => {
      if (value < range[0]) {
        return styles.lower;
      }
      if (value > range[1]) {
        return styles.upper;
      }
      return '';
    }

    const count = personal
      ? `${classStats.wins}/${classStats.count - classStats.wins - classStats.losses}/${classStats.losses}`
      : classStats.count;

    const stats = {
      k_m: getStyle(classStats.k_m, rangeStats.k_m),
      a_m: getStyle(classStats.a_m, rangeStats.a_m),
      de_m: getStyle(classStats.de_m, rangeStats.de_m),
      da_m: getStyle(classStats.da_m, rangeStats.da_m),
    }

    return (<tbody key={classStats.className}>
      <tr>
        <th rowSpan={2} className={app[classStats.className]}>
          {CLASS_NAMES[classStats.className]}
        </th>
        <td>{count}</td>
        <td>{round(classStats.ka_d)}</td>
        <td className={stats.da_m}>{round(classStats.da_m)}</td>
        <td className={stats.k_m}>{round(classStats.k_m)}</td>
        <td className={stats.a_m}>{round(classStats.a_m)}</td>
        <td className={stats.de_m}>{round(classStats.de_m)}</td>
      </tr>
      <tr>
        <td>{duration(classStats.playtime)}</td>
        <td>{round(classStats.k_d)}</td>
        <td>{round(rangeStats.da_m[0])} - {round(rangeStats.da_m[1])}</td>
        <td>{round(rangeStats.k_m[0])} - {round(rangeStats.k_m[1])}</td>
        <td>{round(rangeStats.a_m[0])} - {round(rangeStats.a_m[1])}</td>
        <td>{round(rangeStats.de_m[0])} - {round(rangeStats.de_m[1])}</td>
      </tr>
    </tbody>);
  })

  return (<table className={styles.ClassStats}>
    <thead>
      <tr>
        <th rowSpan={2}>Class</th>
        <th>{personal ? 'Win/Tie/Loss' : '# Logs'}</th>
        <th>KA/D</th>
        <th>Da/M</th>
        <th>K/M</th>
        <th>A/M</th>
        <th>De/M</th>
      </tr>
      <tr>
        <th>Playtime</th>
        <th>K/D</th>
        <th colSpan={4}>Within 1 Standard Deviation</th>
      </tr>
    </thead>
    {rows}
  </table>);
}
