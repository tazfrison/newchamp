import { ClickEvent, ControlledMenu, useMenuState } from '@szhsin/react-menu';
import "@szhsin/react-menu/dist/core.css";
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { menuClassName, MenuItem, SubMenu } from '../../app/Menu';
import { selectAdmin, sendAction } from '../profile/profileSlice';
import styles from './Users.module.css';
import { selectFocus, setFocus, UserProps } from './usersSlice';

type Props = {
  user: UserProps;
  hideMenu?: boolean;
  children: JSX.Element | JSX.Element[];
};

export const UserMenu: React.FC<Props> = ({
  user,
  hideMenu,
  children,
}) => {
  const [menuProps, toggleMenu] = useMenuState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const dispatch = useAppDispatch();

  const focus = useAppSelector(selectFocus);
  const isAdmin = useAppSelector(selectAdmin);

  const style = styles.wrapper + (focus === user.id ? (' ' + styles.focus) : '');

  if (!isAdmin || hideMenu) {
    return (<div
      onContextMenu={e => {
        e.preventDefault();
      }}
      onMouseEnter={e => dispatch(setFocus(user.id))}
      onMouseLeave={e => dispatch(setFocus())}
      className={style}
    >
      {children}
    </div>);
  }

  const handleClick = (event: ClickEvent) => {
    const { route, body, doConfirm } = event.value;

    const payload = {
      body,
      route: `users/${user.id}/${route}`,
    };

    if (doConfirm) {
      if (window.confirm(doConfirm)) {
        dispatch(sendAction(payload));
      }
    } else {
      dispatch(sendAction(payload));
    }
  }

  return (<div
    onContextMenu={e => {
      e.preventDefault();
      setAnchorPoint({ x: e.clientX, y: e.clientY });
      toggleMenu(true);
    }}
    onMouseEnter={e => dispatch(setFocus(user.id))}
    onMouseLeave={e => dispatch(setFocus())}
    className={style}
  >
    {children}
    <ControlledMenu
      {...menuProps}
      anchorPoint={anchorPoint}
      onItemClick={handleClick}
      onClose={() => toggleMenu(false)}
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
      }}

      transition
      menuClassName={menuClassName}
    >
      <SubMenu label='Global'>
        <MenuItem value={{
          route: 'setMute',
          body: [true]
        }}>Mute</MenuItem>
        <MenuItem value={{
          route: 'kick',
          body: ['']
        }}>Kick</MenuItem>
        <MenuItem value={{
          route: 'ban',
          doConfirm: 'Ban ' + user.name + '?',
          body: ['']
        }}>Ban</MenuItem>
      </SubMenu>
      {!user.mumble ? '' : <SubMenu label='Mumble'>
        <MenuItem value={{
          route: 'mumble/setMute',
          body: [!user.mumble.mute]
        }}>{user.mumble.mute ? 'Unmute' : 'Mute'}</MenuItem>
        <MenuItem value={{
          route: 'mumble/setDeaf',
          body: [!user.mumble.deaf]
        }}>{user.mumble.deaf ? 'Undeafen' : 'Deafen'}</MenuItem>
        <MenuItem value={{
          route: 'mumble/kick',
          body: [''],
        }}>Kick</MenuItem>
        <MenuItem value={{
          route: 'mumble/ban',
          doConfirm: 'Ban ' + user.mumble.name + '?',
          body: [''],
        }}>Ban</MenuItem>
      </SubMenu>}
      {!user.tf2 ? '' : <SubMenu label='Tf2'>
        <MenuItem value={{
          route: 'tf2/setMute',
          body: [!user.tf2.mute]
        }}>{user.tf2.mute ? 'Unmute' : 'Mute'}</MenuItem>
        <MenuItem value={{
          route: 'tf2/setSpec',
          body: [!user.tf2.isLocked]
        }}>{user.tf2.isLocked ? 'Spec Unlock' : 'Spec Lock'}</MenuItem>
        <MenuItem value={{
          route: 'tf2/kick',
          body: [''],
        }}>Kick</MenuItem>
        <MenuItem value={{
          route: 'tf2/ban',
          doConfirm: 'Ban ' + user.tf2.name + '?',
          body: [''],
        }}>Ban</MenuItem>
      </SubMenu>}
    </ControlledMenu>
  </div>);
}
