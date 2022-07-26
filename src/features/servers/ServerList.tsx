import { useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectStatus } from '../profile/profileSlice';
import { Server, ServerStub } from './Server';
import styles from './Servers.module.css';
import { selectServers } from './serversSlice';

export function ServerList() {
  const ips = Object.keys(useAppSelector(selectServers));
  const status = useAppSelector(selectStatus);
  const [isExpanded, setExpanded] = useState(false);

  if (status !== 'ready') {
    return (<span>Loading</span>);
  }

  let style = styles.ServerList;
  if (isExpanded) {
    style += ` ${styles.expanded}`;
  }

  return (<div className={style}>
    <div
      className={styles.header}
      onClick={() => setExpanded(!isExpanded)}
    >
      {isExpanded ? 'Servers >' : '< Servers'}
    </div>
    <div className={styles.servers}>
      {ips.map(ip => {
        if (isExpanded) {
          return (<Server key={ip} ip={ip} />);
        } else {
          return (<ServerStub key={ip} ip={ip} />)
        }
      })}
    </div>
  </div>);
}