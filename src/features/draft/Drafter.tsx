import { useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { CLASSES, CLASS_NAMES } from '../../app/types';
import { selectStatus } from '../profile/profileSlice';
import { UserMenu } from '../users/UserMenu';
import { selectUsers } from '../users/usersSlice';
import Draftee from './Draftee';
import styles from './Drafter.module.css';
import { DraftPopup } from './DraftPopup';

function DraftZone(props: { class: CLASSES }) {
  const users = Object.values(useAppSelector(selectUsers));
  const [open, setOpen] = useState(true);
  const filtered = users
    .filter(user =>
      user.validated && user.mumble && user.mumble.tags
      && user.mumble.tags.draft
      && user.mumble.tags[props.class] !== undefined
    )
    .sort((a, b) => a.mumble!.tags[props.class]! - b.mumble!.tags[props.class]!);

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
