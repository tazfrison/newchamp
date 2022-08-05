import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { RootState } from '../../app/store';
import { DraftProps, updateDraft } from '../draft/draftSlice';
import { updateLog } from '../logs/logsSlice';
import { updatePlayer } from '../players/playersSlice';
import { ServerProps, setMaps, updateServer } from '../servers/serversSlice';
import { updateUser, UserProps } from '../users/usersSlice';

export interface ProfileState {
  steam?: {
    id: number;
    steamId: string;
    avatar: string,
    name: string,
    admin: boolean,
  },
  voice?: {},
  status: 'idle' | 'loading' | 'ready' | 'failure';
};

const initialState: ProfileState = {
  status: 'idle',
}

export const initialize = createAsyncThunk('profile/initialize', async (_params, { dispatch }) => {
  const fetchPromise = fetch('/api/state');
  const socket = io();
  socket.on('users/update', (user: UserProps) => {
    dispatch(updateUser(user));
  });
  socket.on('servers/update', (server: ServerProps) => {
    dispatch(updateServer(server));
  });
  socket.on('draft/update', (draft: DraftProps) => {
    dispatch(updateDraft(draft));
  });
  socket.on('logs/update', (log: any) => {
    dispatch(updateLog(log));
  });
  const response = await (await fetchPromise).json();
  response.servers.forEach((server: ServerProps) => {
    dispatch(updateServer(server));
  });
  response.users.forEach((user: UserProps) => {
    dispatch(updateUser(user));
  });
  response.logs.forEach((log: any) => {
    dispatch(updateLog(log));
  });
  response.players.forEach((player: any) => {
    player.player.LogCount = player.LogCount;
    dispatch(updatePlayer(player.player));
  });
  dispatch(setMaps(response.maps));
  dispatch(updateDraft(response.draft));
  return response.profile;
});

export const sendAction = createAsyncThunk('server/action', async (action: { route: string, body: any }) => {
  const { route, body } = action;
  const response = await fetch(`/api/${route}`, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return response.json();
});

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<any>) => {
      state.steam = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initialize.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initialize.fulfilled, (state, action) => {
        if (action.payload) {
          state.steam = action.payload;
        }
        state.status = 'ready';
      })
      .addCase(initialize.rejected, (state) => {
        state.status = 'failure';
      });
  },
});

export const { updateProfile } = profileSlice.actions;

export const selectProfile = (state: RootState) => state.profile.steam;
export const selectAdmin = (state: RootState) => !!state.profile.steam && !!state.profile.steam.admin;
export const selectStatus = (state: RootState) => state.profile.status;

export default profileSlice.reducer;
