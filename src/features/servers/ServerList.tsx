import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatus } from '../profile/profileSlice';
import { AdvancedServer, AdvancedServerStub } from './AdvancedServer';
import { Server, ServerStub } from './Server';
import styles from './Servers.module.css';
import { AdvancedLiveServerProps, selectExpand, selectServers, toggleSidebar } from './serversSlice';

export function ServerList() {
  const dispatch = useAppDispatch();
  const servers = Object.values(useAppSelector(selectServers));
  const status = useAppSelector(selectStatus);
  const expanded = useAppSelector(selectExpand);

  if (status !== 'ready') {
    return (<span>Loading</span>);
  }

  let style = styles.ServerList;
  if (expanded) {
    style += ` ${styles.expanded}`;
  }

  return (<div className={style}>
    <div
      className={styles.header}
      onClick={() => dispatch(toggleSidebar(!expanded))}
    >
      {expanded ? 'Servers >' : '< Servers'}
    </div>
    <div className={styles.servers}>
      {servers.map(server => {
        if (server.model.advancedStats) {
          if (expanded) {
            return (<AdvancedServer key={server.model.id} {...(server as AdvancedLiveServerProps)} />);
          } else {
            return (<AdvancedServerStub key={server.model.id} {...(server as AdvancedLiveServerProps)} />);
          }
        } else {
          if (expanded) {
            return (<Server key={server.model.id} {...server} />);
          } else {
            return (<ServerStub key={server.model.id} {...server} />);
          }
        }
      })}
    </div>
  </div>);
}