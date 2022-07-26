import { MouseEventHandler, useState } from 'react';
import app from '../../app/App.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { BLU, RED, TEAMS } from '../../app/types';
import { selectAdmin, sendAction } from '../profile/profileSlice';
import { selectServers } from '../servers/serversSlice';
import { selectUser } from '../users/usersSlice';
import styles from './Drafter.module.css';
import { DraftSlot, selectDraft, selectIsOpen, setIsOpen, SKILLS, SKILL_TITLES } from './draftSlice';

function Team(props: { name: TEAMS, slots: DraftSlot[] }) {
  return (<div className={styles.Team + ' ' + app[props.name]}>
    {props.slots.map((slot, i) => (<Slot
      key={i}
      {...slot}
      index={i}
      team={props.name}
    />))}
  </div>);
}

interface SlotProps extends DraftSlot {
  index: number;
  team: TEAMS;
}

function Slot(props: SlotProps) {
  const user = useAppSelector(selectUser(props.id || -1));
  let defaultSkill = '';
  if (user && user.tags[props.class] !== undefined) {
    defaultSkill = SKILL_TITLES[user.tags[props.class]!];
  }
  const [skill, storeSkill] = useState<string>(defaultSkill);
  const dispatch = useAppDispatch();
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    const incomingClass = event.dataTransfer.getData(props.class);
    if (incomingClass === props.class) {
      return event.preventDefault();
    }
    if (event.dataTransfer.types.indexOf(props.class) !== -1) {
      return event.preventDefault();
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.getData(props.class) !== props.class) {
      return;
    }
    const newId = parseInt(event.dataTransfer.getData('userid'));
    dispatch(sendAction({
      route: 'draft/draft',
      body: [props.team, props.index, newId],
    }));
    storeSkill(SKILL_TITLES[parseInt(event.dataTransfer.getData('skill')) as SKILLS]);
  };

  let style = styles.Slot + ' ' + app[props.class];
  if (!props.id) {
    style += ' ' + styles.empty;
  }

  let name = (<div>{props.name}</div>);
  if (user) {
    if (user.steamId) {
      name = (<div>
        {props.name}
        <a href={`https://logs.tf/profile/${user.steamId}`} target='_blank' rel='noreferrer'>
          {user.name}
        </a>
      </div>);
    } else {
      name = (<div>{props.name} {user.name}</div>);
    }
  }

  return (<div
    className={style}
    onDragOver={onDragOver}
    onDrop={onDrop}
  >
    {name}
    <div>
      {skill}
    </div>
  </div>);
}

export function DraftPopup() {
  const draft = useAppSelector(selectDraft);
  const isOpen = useAppSelector(selectIsOpen);
  const isAdmin = useAppSelector(selectAdmin);
  const ips = Object.keys(useAppSelector(selectServers));
  const [server, changeServer] = useState(ips[0]);
  const [active, storeActive] = useState(draft.active);
  const dispatch = useAppDispatch();

  let style = styles.TeamDrawer;
  if (!draft.active || !isOpen) {
    style += ` ${styles.closed}`;
  }

  if (draft.active && !active) {
    /*const audio = new Audio('audio/rko.mp3');
    audio.load();
    audio.play();*/
  }

  if (draft.active !== active) {
    storeActive(draft.active);
  }


  if (!draft.active) {
    if (isAdmin) {
      const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        dispatch(sendAction({
          route: 'draft/start',
          body: [server],
        }));
      };

      return (<div className={style}>
        <div className={styles.header}>
          <select
            value={server}
            onChange={event => changeServer(event.target.value)}
          >
            {ips.map(ip => (<option key={ip} value={ip}>{ip}</option>))}
          </select>
          <button
            onClick={onClick}
          >Start Draft</button>
        </div>
      </div>);
    }
    return (<div className={style}>
      <div className={styles.header}>
        No draft in progress
      </div>
    </div>);
  }

  let cancel = null;
  let end = null;
  if (isAdmin) {
    const onClick = (route: string): MouseEventHandler<HTMLButtonElement> => () => {
      dispatch(sendAction({
        route,
        body: [],
      }));
      dispatch(setIsOpen(false));
    };

    cancel = (<button
      onClick={onClick('draft/cancel')}
    >Cancel Draft</button>);

    end = (<button
      onClick={onClick('draft/end')}
    >End Draft</button>);
  }

  return (<div className={style}
    onMouseEnter={e => dispatch(setIsOpen(true))}
    onMouseLeave={e => dispatch(setIsOpen(false))}
  >
    <div className={styles.header}>
      {draft.serverIp} {end} {cancel}
    </div>
    <div className={styles.teams}>
      <Team name={RED} slots={draft.teams![RED]} />
      <Team name={BLU} slots={draft.teams![BLU]} />
    </div>
  </div>);
};