import { useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectStatus } from '../profile/profileSlice';
import { AdvancedServer, AdvancedServerStub } from './AdvancedServer';
import { Server, ServerStub } from './Server';
import styles from './Servers.module.css';
import { AdvancedLiveServerProps, selectServers } from './serversSlice';

export function ServerList() {
  const servers = Object.values(useAppSelector(selectServers));
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
      {servers.map(server => {
        if (server.model.advancedStats) {
          if (isExpanded) {
            return (<AdvancedServer key={server.model.id} {...(server as AdvancedLiveServerProps)} />);
          } else {
            return (<AdvancedServerStub key={server.model.id} {...(server as AdvancedLiveServerProps)} />);
          }
        } else {
          if (isExpanded) {
            return (<Server key={server.model.id} {...server} />);
          } else {
            return (<ServerStub key={server.model.id} {...server} />);
          }
        }
      })}
    </div>
  </div>);
}