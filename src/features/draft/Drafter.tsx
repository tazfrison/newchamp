import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import app from '../../app/App.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLASSES, CLASS_NAMES } from '../../app/types';
import { selectAdmin, selectStatus } from '../profile/profileSlice';
import { UserMenu } from '../users/UserMenu';
import { selectUsers, UserProps } from '../users/usersSlice';
import styles from './Drafter.module.css';
import { DraftPopup } from './DraftPopup';
import { setIsOpen, SKILL_TITLES } from './draftSlice';

function DraftZone(props: { class: CLASSES }) {
  const users = Object.values(useAppSelector(selectUsers));
  const [open, setOpen] = useState(true);
  const filtered = users
    .filter(user => user.validated && user.tags && user.tags[props.class] !== undefined)
    .sort((a, b) => a.tags[props.class]! - b.tags[props.class]!);

  if (!open) {
    return (<div
      className={styles.DraftZone}
    >
      <b onClick={() => setOpen(!open)}>{CLASS_NAMES[props.class]} ({filtered.length})</b>
      <div>...</div>
    </div>);
  }

  return (<div
    className={styles.DraftZone}
  >
    <b onClick={() => setOpen(!open)}>{CLASS_NAMES[props.class]} ({filtered.length})</b>
    {filtered.map((user) => (<UserMenu user={user} key={user.id}>
      <Draftee
        {...user}
        draftClass={props.class}
      />
    </UserMenu>))}
  </div>);
}

interface DrafteeProps extends UserProps {
  draftClass: CLASSES;
}

function Draftee(props: DrafteeProps) {
  const isAdmin = useAppSelector(selectAdmin);
  const dispatch = useAppDispatch();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    dispatch(setIsOpen(true));
    event.dataTransfer.setData('name', props.name);
    event.dataTransfer.setData('userid', props.id.toString());
    event.dataTransfer.setData('skill', props.tags[props.draftClass]!.toString());
    event.dataTransfer.setData(props.draftClass, props.draftClass);
  };

  const onDragEnd = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    dispatch(setIsOpen(false));
  };

  let name = (<div>{props.name}</div>);
  if (props.steamId) {
    name = (<Link to={`/players/${props.steamId}`}>{props.name}</Link>);
  }

  return (<div
    className={`${styles.Draftee} ${app[props.draftClass]}`}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    draggable={isAdmin}
  >
    {name}
    <div>{SKILL_TITLES[props.tags[props.draftClass]!]}</div>
  </div>);
}

export function Drafter() {
  const status = useAppSelector(selectStatus);

  if (status !== 'ready') {
    return (<span>Loading</span>);
  }

  return (<div className={styles.Drafter}>
    <div className={styles.zones}>
      <div>
        <DraftZone class={CLASSES.demoman} />
        <DraftZone class={CLASSES.medic} />
      </div>
      <DraftZone class={CLASSES.scout} />
      <DraftZone class={CLASSES.soldier} />
    </div>
    <DraftPopup />
  </div>);
}
