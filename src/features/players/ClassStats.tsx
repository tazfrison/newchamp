import { useEffect } from 'react';
import app from '../../app/App.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLASSES, CLASS_NAMES } from '../../app/types';
import { duration } from '../logs/logsSlice';
import styles from './Players.module.css';
import { selectStats, fetchStatsAction } from './playersSlice';

export interface AggregateClassStatProps {
  className: CLASSES,
  ka_d_sd: number,
  k_d_sd: number,
  k_m_sd: number,
  a_m_sd: number,
  de_m_sd: number,
  da_m_sd: number,
  total: number,
  playtime: number,
  ka_d: number,
  k_d: number,
  k_m: number,
  a_m: number,
  de_m: number,
  da_m: number,
}

const round = (number: number) => {
  if (number <= 0) {
    return 0;
  }
  const exp = Math.floor(Math.log10(number));
  const scale = Math.pow(10, Math.max(2 - exp, 1));
  return Math.floor(scale * number) / scale;
}

export function ClassStats(props: { stats: AggregateClassStatProps[] }) {
  const dispatch = useAppDispatch();
  const globalStats = useAppSelector(selectStats);

  useEffect(() => {
    if (globalStats === undefined) {
      dispatch(fetchStatsAction());
    }
  }, [globalStats, dispatch]);

  const rows = props.stats.map(classStats => {
    let rangeStats = {
      k_m: [classStats.da_m, classStats.da_m] as [number, number],
      a_m: [classStats.k_m, classStats.k_m] as [number, number],
      de_m: [classStats.a_m, classStats.a_m] as [number, number],
      da_m: [classStats.de_m, classStats.de_m] as [number, number],
    };
    if (globalStats && globalStats[classStats.className]) {
      const globalClass = globalStats[classStats.className]!;
      rangeStats = {
        da_m: [globalClass.da_m - globalClass.da_m_sd, globalClass.da_m + globalClass.da_m_sd],
        k_m: [globalClass.k_m - globalClass.k_m_sd, globalClass.k_m + globalClass.k_m_sd],
        a_m: [globalClass.a_m - globalClass.a_m_sd, globalClass.a_m + globalClass.a_m_sd],
        de_m: [globalClass.de_m - globalClass.de_m_sd, globalClass.de_m + globalClass.de_m_sd],
      };
    }

    const getStyle = (value: number, range: [number, number]) => {
      if (value < range[0]) {
        return styles.lower;
      }
      if (value > range[1]) {
        return styles.upper;
      }
      return ''
    }

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
        <td>{classStats.total}</td>
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
        <th># Logs</th>
        <th>KA/D</th>
        <th>DaPM</th>
        <th>KPM</th>
        <th>APM</th>
        <th>DePM</th>
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
