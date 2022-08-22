import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { formatter } from '../logs/logsSlice';
import { ServerList } from '../servers/ServerList';
import { UserMenu } from './UserMenu';
import styles from './Users.module.css';
import { fetchUsersAction, FullUserProps, selectFullUsers, selectUsers, UserProps } from './usersSlice';

function User({ full, user }: { full: FullUserProps, user?: UserProps }) {
  let style = styles.User;
  if (user) {
    style += ' ' + styles.online;
  }
  const validated = user?.validated || full.ipCheck?.validated;
  if (validated === true) {
    style += ' ' + styles.valid;
  } else if (validated === false) {
    style += ' ' + styles.invalid;
  }

  let voiceStyle = '';
  let voiceTitle = '';
  if (full.voiceAccount) {
    voiceStyle = styles[full.voiceAccount.type];
    if (user && user.mumble) {
      voiceStyle += ' ' + styles.online;
      voiceTitle = user.mumble.channel.path.join('\n');
    }
  }

  let playerStyle = '';
  let playerTitle = '';
  if (full.player) {
    if (full.player.admin) {
      playerStyle = styles.admin;
    } else if (full.player.coach) {
      playerStyle = styles.coach;
    } else {
      playerStyle = styles.steam;
    }
    if (user && user.tf2) {
      playerStyle += ' ' + styles.online;
      playerTitle = `${user.tf2.name} ${user.tf2.team} ${user.tf2.class}`;
    }
  }

  return (<Link to={`/users/${full.id}`} className={style}>
    <div className={voiceStyle} title={voiceTitle}></div>
    <div className={styles.details}>
      <div>{full.name}</div>
      <div>{formatter(new Date(full.updatedAt))}</div>
    </div>
    <div className={playerStyle} title={playerTitle}></div>
  </Link>);
}

export default function Users() {
  const dispatch = useAppDispatch();
  const full = useAppSelector(selectFullUsers);
  const users = useAppSelector(selectUsers);
  useEffect(() => {
    if (full === undefined) {
      dispatch(fetchUsersAction());
    }
  }, [full, dispatch]);

  const sorted = Object.values(full || {}).sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (<div className={styles.Users}>
    <div className={styles.userList}>
      {sorted.map(user => {
        const ele = (<User key={user.id} full={user} user={users[user.id]} />);
        if (users[user.id]) {
          return (<UserMenu user={users[user.id]} key={user.id}>
            {ele}
          </UserMenu>);
        }
        return ele;
      })}
    </div>
    <div className={styles.content}>
      <Outlet />
    </div>
    <ServerList />
  </div>);
}