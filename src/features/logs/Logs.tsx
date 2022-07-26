import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAdmin, sendAction } from '../profile/profileSlice';
import styles from './Logs.module.css';
import app from '../../app/App.module.css';
import { duration, fetchUploaderAction, formatter, selectLogs, selectUploaded } from './logsSlice';

export function Index() {
  const logs = Object.values(useAppSelector(selectLogs));

  const scoreMap: number[][] = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];

  const mapCount: { [map: string]: number } = {};
  logs.forEach(log => {
    scoreMap[log.bluScore][log.redScore]++;
    if (!mapCount[log.map]) {
      mapCount[log.map] = 0;
    }
    ++mapCount[log.map];
  });

  return (<div>
    <table>
      <tbody>
        <tr>
          <th></th>
          <th className={app.Red}>0</th>
          <th className={app.Red}>1</th>
          <th className={app.Red}>2</th>
          <th className={app.Red}>3</th>
          <th className={app.Red}>4</th>
          <th className={app.Red}>5</th>
        </tr>
        {scoreMap.map((scores, i) => <tr key={i}>
          <th className={app.Blue}>{i}</th>
          {scores.map((score, k) => <td key={k}>{score}</td>)}
        </tr>)}
      </tbody>
    </table>
    <div>
      {Object.entries(mapCount).map(([map, count]) => <div key={map}>
        {map}: {count}
      </div>)}
    </div>
  </div>);
}

export function Importer() {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectAdmin);
  const logs = useAppSelector(selectLogs);
  const uploaded = useAppSelector(selectUploaded);
  const [logId, setLogId] = useState(0);

  useEffect(() => {
    if (uploaded === undefined) {
      dispatch(fetchUploaderAction());
    }
  }, [uploaded, dispatch]);

  if (!isAdmin) {
    return (<div>
      Select a log to view
    </div>);
  }

  let toDownload = [];
  if (uploaded !== undefined && uploaded.length > 0) {
    toDownload = uploaded.filter(log => !logs[log.id]);
  }

  return (<div>
    <div>
      Upload a log?
      <input
        value={logId}
        onChange={event => setLogId(parseInt(event.target.value))} type='number'
      />
      <button
        onClick={event => dispatch(sendAction({
          route: `logs/${logId}`,
          body: [],
        }))}
      >
        Submit
      </button>
      <button
        onClick={event => {
          if (window.confirm('Purge all logs?')) {
            dispatch(sendAction({
              route: `logs/purge?full=1`,
              body: [],
            }));
          } else {
            dispatch(sendAction({
              route: `logs/purge`,
              body: [],
            }))
          }
        }}
      >
        PURGE
      </button>
    </div>
    <div>
      {toDownload.map(log => <div key={log.id}>
        <span>{log.title}</span>
        <span>{formatter(new Date(log.date * 1000))}</span>
        <span>{log.map}</span>
        <button
          onClick={event => dispatch(sendAction({
            route: `logs/${log.id}`,
            body: [],
          }))}
        >Download</button>
      </div>)}
    </div>
  </div>);
}

export function Logs() {
  const isAdmin = useAppSelector(selectAdmin);
  const logs = Object.values(useAppSelector(selectLogs)).sort((a, b) => {
    return new Date(b.upload).getTime() - new Date(a.upload).getTime();
  });

  return (<div className={styles.Logs}>
    <div className={styles.logList}>
      {isAdmin ? <Link to='/logs/import'>Import</Link> : null}
      {logs.map(log => (<Link
        className={styles.log}
        key={log.id}
        to={`/logs/${log.id}`}
        title={log.title}
      >
        <div>
          <div><span>{formatter(new Date(log.upload))}</span> <span>{duration(log.duration)}</span></div>
          <div>{log.title}</div>
          <div>{log.map}</div>
        </div>
        <div>
          <div className={app.Blue}>{log.bluScore}</div>
          <div className={app.Red}>{log.redScore}</div>
        </div>
      </Link>))}
    </div>
    <div className={styles.content}>
      <Outlet />
    </div>
  </div>);
}