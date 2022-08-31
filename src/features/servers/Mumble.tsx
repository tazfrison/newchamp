import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import styles from './Servers.module.css';
import { fetchMumbleAction, selectMumbleChannel, selectMumbleRoot, toggleChannel, updateChannelAction } from './serversSlice';

function Channel({ id }: { id: number }) {
  const dispatch = useAppDispatch();
  const channel = useAppSelector(selectMumbleChannel(id));
  if (!channel) {
    return null;
  }
  return (<div
    className={`${styles.Channel} ${channel.collapse ? styles.collapse : ''} ${channel.children.length > 0 ? styles.children : ''}`}
    onClick={(event) => {
      dispatch(toggleChannel(id));
      event.stopPropagation();
    }}
  >
    <span>
      {channel.name}
      <span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            const tags = window.prompt(`Tags for ${channel.name}:`, JSON.stringify(channel.tags));
            if (tags === null) {
              return;
            }
            console.log(tags);
            dispatch(updateChannelAction({ id: channel.id, tags }));
          }}
        >
          {channel.tags ? String.fromCharCode(9999) : String.fromCharCode(43)}
        </button>
      </span>
    </span>
    {channel.collapse ? null : (<div>
      {channel.children.map(id => (<Channel key={id} id={id} />))}
    </div>)}
  </div>);
}

export default function Mumble() {
  const dispatch = useAppDispatch();
  const root = useAppSelector(selectMumbleRoot);

  useEffect(() => {
    if (root === undefined) {
      dispatch(fetchMumbleAction());
    }
  }, [root, dispatch]);

  return (<div className={styles.Mumble}>
    {root ? (<Channel id={root.id} />) : null}
  </div>);
}