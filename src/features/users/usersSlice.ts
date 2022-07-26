import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CLASSES } from '../../app/types';
import { SKILLS } from '../draft/draftSlice';

export interface UserProps {
  id: number;
  name: string;
  tags: { [className in CLASSES]?: SKILLS },
  validated?: boolean;
  steamId?: string;
  mumble?: {
    hash: string;
    name: string;
    mute: boolean;
    deaf: boolean;
    session: number;
    channel: {
      id: number;
      name: string;
      path: string[];
    };
  };
  tf2?: {
    steamId: string;
    name: string;
    userId: string;
    serverIp: string;
    mute: boolean;
    isLocked: boolean;
    team: string;
    class: string;
  };
};

export interface UsersState {
  users: { [id: number]: UserProps };
  focus?: number;
};

const initialState: UsersState = {
  users: {},
}

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<UserProps>) => {
      state.users[action.payload.id] = action.payload;
    },
    setFocus: (state, action: PayloadAction<number | undefined>) => {
      state.focus = action.payload;
    },
  },
});

export const { updateUser, setFocus } = usersSlice.actions;

export const selectUser = (userId: number) => (state: RootState) => state.users.users[userId];
export const selectUsers = (state: RootState) => state.users.users;
export const selectFocus = (state: RootState) => state.users.focus;

export default usersSlice.reducer;
