import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CLASSES, TEAMS, SKILLS } from '../../app/types';
import { PlayerProps } from '../players/playersSlice';
import { initialize } from '../profile/profileSlice';

export interface UserProps {
  id: number;
  name: string;
  tags: { [className in CLASSES]?: SKILLS };
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
    tags: { [className in CLASSES | 'draft']?: SKILLS };
  };
  player?: {
    id: number;
    steamId: string;
  };
  tf2?: {
    steamId: string;
    name: string;
    userId: number;
    slotId: number;
    server: {
      id: number;
      name: string;
    }
    mute: boolean;
    isLocked?: boolean;
    team?: TEAMS;
    class?: CLASSES;
  };
};

export interface FullUserProps {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  ipCheck?: {
    id: number;
    ip: string;
    validated?: boolean;
    createdAt: string;
    updatedAt: string;
  };
  voiceAccount?: {
    id: number;
    name: string;
    hash: string;
    type: string;
    tags: { [name: string]: string };
  };
  player?: PlayerProps;
}

export interface UsersState {
  full?: { [id: number]: FullUserProps };
  users: { [id: number]: UserProps };
  focus?: number;
};

const initialState: UsersState = {
  users: {},
}

export const fetchUsersAction = createAsyncThunk('users/fetch', async () => {
  const response = await fetch('/api/users');
  return await response.json() as FullUserProps[];
});

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateFull: (state, action: PayloadAction<FullUserProps>) => {
      if (state.full) {
        state.full[action.payload.id] = action.payload;
      }
    },
    updateUser: (state, action: PayloadAction<UserProps>) => {
      state.users[action.payload.id] = action.payload;
    },
    deleteUser: (state, action: PayloadAction<UserProps>) => {
      delete state.users[action.payload.id];
    },
    setFocus: (state, action: PayloadAction<number | undefined>) => {
      state.focus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initialize.fulfilled, (state, action) => {
        action.payload.users.forEach((user: UserProps) => {
          state.users[user.id] = user;
        });
      })
      .addCase(fetchUsersAction.pending, (state) => {
        state.full = {};
      })
      .addCase(fetchUsersAction.fulfilled, (state, action) => {
        state.full = {};
        action.payload.forEach(user => {
          state.full![user.id] = user;
        });
      });
  },
});

export const { updateFull, updateUser, deleteUser, setFocus } = usersSlice.actions;

export const selectUser = (userId: number) => (state: RootState) => state.users.users[userId];
export const selectUsers = (state: RootState) => state.users.users;
export const selectFullUser = (userId: number) => (state: RootState) => state.users.full ? state.users.full[userId] : undefined;
export const selectFullUsers = (state: RootState) => state.users.full;
export const selectFocus = (state: RootState) => state.users.focus;

export default usersSlice.reducer;
