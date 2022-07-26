import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CLASSES, TEAMS } from '../../app/types';

export const CLASS_TITLES = {
  [CLASSES.scout]: 'Scout',
  [CLASSES.soldier]: 'Soldier',
  [CLASSES.pyro]: 'Pyro',
  [CLASSES.demoman]: 'Demoman',
  [CLASSES.heavyweapons]: 'Heavy',
  [CLASSES.engineer]: 'Engineer',
  [CLASSES.medic]: 'Medic',
  [CLASSES.sniper]: 'Sniper',
  [CLASSES.spy]: 'Spy',
}

export enum SKILLS {
  NO = 0,
  MINOR = 1,
  FREE = 2,
  PAID = 3,
}

export const SKILL_TITLES = {
  [SKILLS.NO]: 'No Competitive Experience',
  [SKILLS.MINOR]: 'Minor Competitive Experience',
  [SKILLS.FREE]: 'Free League Experience',
  [SKILLS.PAID]: 'Paid League Experience',
}

export enum DRAFT_TYPE {
  COACHED_MIX,
}

export interface DraftState {
  isOpen: boolean;
  draft: DraftProps;
};

export interface DraftProps {
  active: boolean;
  serverIp?: string;
  type?: DRAFT_TYPE;
  teams?: {
    [TEAMS.Red]: DraftSlot[];
    [TEAMS.Blue]: DraftSlot[];
  }
}

export interface DraftSlot {
  class: CLASSES;
  name: string;
  id?: number;
}

const initialState: DraftState = {
  isOpen: false,
  draft: {
    active: false,
  }
}

export const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    updateDraft: (state, action: PayloadAction<DraftProps>) => {
      state.draft = action.payload;
    },
    setIsOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { setIsOpen, updateDraft } = draftSlice.actions;

export const selectIsOpen = (state: RootState) => state.draft.isOpen;
export const selectDraft = (state: RootState) => state.draft.draft;

export default draftSlice.reducer;
