import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import styles from './Servers.module.css';
import { fetchMumbleAction, selectMumbleChannel, selectMumbleRoot, toggleChannel } from './serversSlice';

function Channel({ id }: { id: number }) {
  const dispatch = useAppDispatch();
  const channel = useAppSelector(selectMumbleChannel(id));
  if (!channel) {
    return null;
  }
  return (<div
    className={styles.Channel}
    onClick={(event) => {
      dispatch(toggleChannel(id));
      event.stopPropagation();
    }}
  >
    {channel.name}
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