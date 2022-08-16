import { ClickEvent, MenuButton } from '@szhsin/react-menu';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import styles from './Profile.module.css';
import { selectProfile, selectStatus } from './profileSlice';
import { Menu, MenuItem } from '../../app/Menu';

export function Header() {
  const status = useAppSelector(selectStatus);
  const profile = useAppSelector(selectProfile);

  if (status !== 'ready') {
    return (<span>Loading</span>);
  }

  let profileItem = (<a href='http://50.45.230.50:27960/auth/steam'>
    <img alt='Sign in through Steam' src='../images/steamLogin.png' />
  </a>);

  if (!!profile) {
    const profileLink = `https://steamcommunity.com/profiles/${profile.steamId}`;
    const logsLink = `https://logs.tf/profile/${profile.steamId}`;
    const logoutLink = `/auth/logout`;
    const onClick = (newTab: boolean) => (e: ClickEvent) => {
      if (newTab) {
        window.open(e.value, '_blank');
      } else {
        window.location = e.value;
      }
      e.stopPropagation = true;
    }
    profileItem = (<Menu
      menuButton={<MenuButton>
        <img alt="avatar" src={profile.avatar} />
        <span>{profile.name}</span>
      </MenuButton>}
    >
      <MenuItem value={profileLink} onClick={onClick(true)}>Steam Profile</MenuItem>
      <MenuItem value={logsLink} onClick={onClick(true)}>logs.tf</MenuItem>
      <MenuItem value={logoutLink} onClick={onClick(false)}>Logout</MenuItem>
    </Menu>);
  }
  return (<div className={styles.Header}>
    <Link to='/'>Home</Link>
    <Link to='/logs'>Logs</Link>
    <Link to='/players'>Players</Link>
    <Link to='/servers'>Servers</Link>
    {profileItem}
  </div>);
}
