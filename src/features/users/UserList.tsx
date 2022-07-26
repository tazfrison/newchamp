import { useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectStatus } from '../profile/profileSlice';
import User from './User';
import { UserMenu } from './UserMenu';
import styles from './Users.module.css';
import { selectUsers } from './usersSlice';

export function UserList() {
  const users = Object.values(useAppSelector(selectUsers)).sort((a, b) => {
    if ((!!a.mumble || !!a.tf2) !== (!!b.mumble || !!b.tf2)) {
      return (!!a.mumble || !!a.tf2) ? -1 : 1;
    }
    if (a.validated !== b.validated) {
      if (!a.validated == !b.validated) { // eslint-disable-line eqeqeq
        return a.validated === false ? -1 : 1;
      }
      return a.validated ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });
  const status = useAppSelector(selectStatus);
  const [isExpanded, setExpanded] = useState(false);

  if (status !== 'ready') {
    return (<span>Loading</span>);
  }

  let style = styles.UserList;
  if (isExpanded) {
    style += ` ${styles.expanded}`;
  }

  return (<div className={style}>
    <div
      className={styles.header}
      onClick={() => setExpanded(!isExpanded)}
    >
      {isExpanded ? '< Users' : 'Users >'}
    </div>
    <div className={styles.users}>
      {users.map(user => (<UserMenu user={user} key={user.id} hideMenu={!isExpanded}>
        <User user={user} isExpanded={isExpanded} />
      </UserMenu>
      ))}
    </div>
  </div>);
}