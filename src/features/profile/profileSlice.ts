import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { RootState } from '../../app/store';
import { DraftProps, updateDraft } from '../draft/draftSlice';
import { LogProps, updateLog } from '../logs/logsSlice';
import { AggregatedClassStatProps, fetchPlayerAction, fetchPlayersAction, fetchStatsAction, PlayerProps } from '../players/playersSlice';
import { deleteServer, LiveServerProps, updateServer } from '../servers/serversSlice';
import { deleteUser, FullUserProps, updateFull, updateUser, UserProps } from '../users/usersSlice';

export interface ApiState {
  servers: LiveServerProps[],
  logs: LogProps[],
  players: PlayerProps[],
  users: UserProps[],
  maps: string[],
  draft: DraftProps,
  globalStats: AggregatedClassStatProps[],
  profile?: ProfileProps,
}

export interface ProfileProps {
  id: number;
  steamId: string;
  avatar: string;
  name: string;
  admin: boolean;
}

export interface ProfileState {
  steam?: ProfileProps,
  voice?: {},
  status: 'idle' | 'loading' | 'ready' | 'failure';
};

const initialState: ProfileState = {
  status: 'idle',
}

export const initialize = createAsyncThunk('profile/initialize', async (_params, { dispatch }) => {
  const fetchPromise = fetch('/api/state');
  const socket = io();
  socket.on('update', ({ type, data }: { type: string, data: any}) => {
    switch(type) {
      case 'User':
        const full = data as FullUserProps;
        dispatch(updateFull(full));
        break;
      case 'user':
        const user = data as UserProps;
        dispatch(updateUser(user));
        if (user.steamId) {
          dispatch(fetchPlayerAction({ steamId: user.steamId, lazy: true }));
        }
        break;
      case 'server':
        dispatch(updateServer(data as LiveServerProps));
        break;
      case 'draft':
        dispatch(updateDraft(data as DraftProps));
        break;
      case 'log':
        const log = data as LogProps;
        dispatch(updateLog(log));
        dispatch(fetchStatsAction());
        if (log.players) {
          const steamIds: string[] = [];
          log.players.forEach(player => {
            if (player.player) {
              steamIds.push(player.player.steamId);
            }
          });
          dispatch(fetchPlayersAction(steamIds));
        }
        break;
      default:
        break;
    }
  });
  socket.on('delete', ({ type, data }: { type: string, data: any}) => {
    switch(type) {
      case 'user':
        const user = data as UserProps;
        dispatch(deleteUser(user));
        break;
      case 'server':
        const server = data as LiveServerProps;
        dispatch(deleteServer(server.model.id!));
        break;
      default:
        break;
    }
  });
  const response = await (await fetchPromise).json();
  response.users.forEach((user: UserProps) => {
    if (user.steamId) { //Done here so that I can dispatch
      dispatch(fetchPlayerAction({ steamId: user.steamId, lazy: true }));
    }
  });
  return response as ApiState;
});

export const sendAction = createAsyncThunk('profile/action', async (action: { route: string, body: any }) => {
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

export const logoutAction = createAsyncThunk('profile/logout', async () => {
  await fetch(`/auth/logout`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
});

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<ProfileProps>) => {
      state.steam = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initialize.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initialize.fulfilled, (state, action) => {
        if (action.payload && action.payload.profile) {
          state.steam = action.payload.profile;
        }
        state.status = 'ready';
      })
      .addCase(initialize.rejected, (state) => {
        state.status = 'failure';
      })
      .addCase(logoutAction.fulfilled, () => {
        window.location.reload();
      });
  },
});

export const { updateProfile } = profileSlice.actions;

export const selectProfile = (state: RootState) => state.profile.steam;
export const selectAdmin = (state: RootState) => !!state.profile.steam && !!state.profile.steam.admin;
export const selectStatus = (state: RootState) => state.profile.status;

export default profileSlice.reducer;
