import { MenuButton } from '@szhsin/react-menu';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Menu, MenuItem } from '../../app/Menu';
import { selectUsers } from '../users/usersSlice';
import styles from './Profile.module.css';
import { logoutAction, selectProfile, selectStatus } from './profileSlice';

export function Header() {
  const navigate = useNavigate();
  const status = useAppSelector(selectStatus);
  const profile = useAppSelector(selectProfile);
  const users = useAppSelector(selectUsers);
  const dispatch = useAppDispatch();

  if (status !== 'ready') {
    return (<span>Loading</span>);
  }

  let profileItem = (<a href='http://50.45.230.50:27960/auth/steam'>
    <img alt='Sign in through Steam' src='../images/steamLogin.png' />
  </a>);
  let admin;

  if (!!profile) {
    profileItem = (<Menu
      menuButton={<MenuButton>
        <img alt="avatar" src={profile.avatar} title={profile.name} />
      </MenuButton>}
    >
      <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
      <MenuItem onClick={() => dispatch(logoutAction())}>Logout</MenuItem>
    </Menu>);

    const counts: { [key: string]: number } = {
      true: 0,
      undefined: 0,
      false: 0,
    };

    Object.values(users).forEach(user => {
      ++counts[user.validated + ''];
    });

    if (profile.admin) {
      admin = (<div className={styles.admin}>
        <Link to='/users'>
          <span className={styles.true}>{counts.true}</span>/
          <span className={styles.undefined}>{counts.undefined}</span>/
          <span className={styles.false}>{counts.false}</span>
        </Link>
        <Link to='/servers'>Servers</Link>
      </div>);
    }
  }
  return (<div className={styles.Header}>
    <div className={styles.user}>
      <Link to='/'>Home</Link>
      <Link to='/logs'>Logs</Link>
      {profileItem}
    </div>
    {admin}
  </div>);
}
