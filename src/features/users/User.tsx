import React from 'react';
import styles from './Users.module.css';
import { UserProps } from './usersSlice';

export default function User({ user, isExpanded }: { user: UserProps, isExpanded: boolean }) {
  let style = styles.User;
  if (user.validated === true) {
    style += ' ' + styles.valid;
  } else if (user.validated === false) {
    style += ' ' + styles.invalid;
  }

  if (!isExpanded) {
    return (<div className={style}>
      <div className={styles.global}>
        <div>{user.name}</div>
      </div>
    </div>);
  }

  let mumble = (<div></div>);

  if (user.mumble) {
    const path = user.mumble.channel.path.slice(-2);
    let ele = (<div className={styles.nested}>{path.pop()}</div>);
    while (path.length) {
      ele = (<div className={styles.nested}>{path.pop()}{ele}</div>);
    }

    mumble = (<div className={styles.mumble}>
      <div className={styles.tree}>
        <div title={user.mumble.channel.path.join('\n')}>{ele}</div>
      </div>
    </div>);
  }

  let tf2 = (<div></div>);

  if (user.tf2) {
    const url = 'https://logs.tf/profile/' + user.tf2.steamId;
    tf2 = (<div className={styles.tf2}>
      <div><a href={url} target='_blank' rel='noreferrer'>{user.tf2.name}</a></div>
      <div>{user.tf2.serverIp}</div>
      <div className={styles[user.tf2.team]}>{user.tf2.class}</div>
    </div>);
  }

  return (<div className={style}>
    <div className={styles.global}>
      <div>{user.name}</div>
    </div>
    {mumble}
    {tf2}
  </div>);
}
