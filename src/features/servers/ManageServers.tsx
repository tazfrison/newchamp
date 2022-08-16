import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import styles from './Servers.module.css';
import { fetchConfigsAction, selectServerConfigs } from './serversSlice';

export function ManageServers() {
  const dispatch = useAppDispatch();
  const configs = useAppSelector(selectServerConfigs);
  const sorted = Object.values(configs || {})
    .sort((a, b) =>a.name.localeCompare(b.name));

  useEffect(() => {
    if (configs === undefined) {
      dispatch(fetchConfigsAction());
    }
  }, [configs, dispatch]);

  return (<div className={styles.ManageServers}>
    <div className={styles.configs}>
    <Link
        className={styles.config}
        key=''
        to={`/servers/new`}
      >
        <div>New</div>
      </Link>
      {sorted.map(config => (<Link
        className={styles.config}
        key={config.id}
        to={`/servers/${config.id}`}
      >
        <div>{config.name}</div>
      </Link>))}
    </div>
    <div className={styles.content}>
      <Outlet />
    </div>
  </div>);
}