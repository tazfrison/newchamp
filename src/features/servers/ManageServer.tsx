import { ChangeEventHandler, MouseEventHandler, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { TEAMS } from '../../app/types';
import { AdvancedServer } from './AdvancedServer';
import { Server } from './Server';
import styles from './Servers.module.css';
import { AdvancedLiveServerProps, configFunctionAction, selectServer, selectServerConfig, ServerConfig, updateConfigAction } from './serversSlice';

const DEFAULT_CONFIG = {
  name: 'New Config',
  ip: '',
  port: 27015,
  rcon: '',
  password: '',
  active: false,
  setSpec: false,
  advancedStats: false,
  channels: {
    [TEAMS.Blue]: 0,
    [TEAMS.Red]: 0,
  }
}

export default function ManageServer() {
  const params = useParams();
  let input = useAppSelector(selectServerConfig(parseInt(params.configId || '')));
  const server = useAppSelector(selectServer(parseInt(params.configId || '')));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [config, updateConfig] = useState<ServerConfig>(input || DEFAULT_CONFIG);

  useEffect(() => {
    if (!params.configId) {
      if (config.id) {
        updateConfig(DEFAULT_CONFIG);
      }
    } else {
      if (parseInt(params.configId) !== config.id) {
        if (input) {
          updateConfig(input);
        }
      } else {
        if (!input) {
          navigate('/servers');
        }
      }
    }
  }, [params.configId, config, input, navigate]);

  if (params.configId && !input) {
    return (<div>Config doesn't exist.</div>);
  }

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (config) {
      const path = event.target.name.split('.');
      const newConfig = JSON.parse(JSON.stringify(config));
      if (path.length > 1) {
        if (path[0] === 'channels') {
          newConfig.channels[path[1]] = event.target.value;
        }
      } else {
        let value: any = event.target.value;
        if (event.target.type === 'checkbox') {
          value = event.target.checked;
        }
        newConfig[path[0]] = value;
      }
      updateConfig(newConfig);
    }
  }

  const onClick = (command: string): MouseEventHandler<HTMLButtonElement> => () => {
    if (config && config.id) {
      dispatch(configFunctionAction({ command, id: config.id }));
    }
  }

  return (<div className={styles.ManageServer}>
    <div className={styles.header}>
      <div className={styles.config}>
        <label>Name<input
          type='string'
          name='name'
          value={config.name}
          onChange={onChange}
        /></label>
        <label>IP<input
          type='string'
          name='ip'
          value={config.ip}
          onChange={onChange}
        /></label>
        <label>Port<input
          type='number'
          name='port'
          value={config.port}
          onChange={onChange}
        /></label>
        <label>Password<input
          type='string'
          name='password'
          value={config.password}
          onChange={onChange}
        /></label>
        <label>RCON<input
          type='string'
          name='rcon'
          value={config.rcon}
          onChange={onChange}
        /></label>
      </div>
      <div className={styles.features}>
        <label>Advanced Stats<input
          type='checkbox'
          name='advancedStats'
          checked={config.advancedStats}
          onChange={onChange}
        /></label>
        <div className={styles.channels}>
          <label>Red<input
            type='number'
            name='channels.Red'
            value={config.channels.Red}
            onChange={onChange}
          /></label>
          <label>Blue<input
            type='number'
            name='channels.Blue'
            value={config.channels.Blue}
            onChange={onChange}
          /></label>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={() => {
          if (config) {
            dispatch(updateConfigAction(config));
          }
        }}>{params.configId ? 'Save' : 'Create'}</button>
        {params.configId ? [
          (<button
            key='connect'
            onClick={onClick(server ? 'disconnect' : 'connect')}
          >
            {server ? 'Disconnect' : 'Connect'}
          </button>),
          (<button
            key='delete'
            onClick={onClick('delete')}
          >
            Delete
          </button>),
        ] : ''}
      </div>
    </div>
    <div className={styles.details}>
      {server
        ? (server.model.advancedStats
          ? (<AdvancedServer {...(server as AdvancedLiveServerProps)}/>)
          : (<Server {...server} />))
        : ''}
    </div>
  </div>);
}
