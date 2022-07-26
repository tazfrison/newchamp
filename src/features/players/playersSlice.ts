import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CLASSES } from '../../app/types';
import { LogPlayerProps } from '../logs/logsSlice';
import { AggregateClassStatProps } from './ClassStats';

export interface PlayerProps {
  id: number;
  steamId: string;
  name: string;
  logPlayers?: LogPlayerProps[];
  LogCount?: number;
  fetching: boolean;
}

export interface PlayersState {
  players: { [steamId: string]: PlayerProps },
  stats?: {[className in CLASSES]?: AggregateClassStatProps},
};

const initialState: PlayersState = {
  players: {},
};

export const fetchPlayerAction = createAsyncThunk('players/fetch', async (steamId: string, { dispatch, getState }) => {
  try {
    const state = getState() as RootState;
    if (state.players.players[steamId] && state.players.players[steamId].fetching) {
      return;
    }
  } catch (e) {
    console.log(e);
    return;
  }
  dispatch(setFetching({ steamId, fetching: true }));
  const response = await fetch(`/api/players/${steamId}`);
  dispatch(updatePlayer(await response.json()));
  dispatch(setFetching({ steamId, fetching: false }));
});

export const fetchStatsAction = createAsyncThunk('players/stats', async () => {
  const response = await fetch('/api/stats');
  return (await response.json()) as AggregateClassStatProps[];
});

export const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    updatePlayer: (state, action: PayloadAction<any>) => {
      action.payload.fetching = false;
      if (!action.payload.LogCount && action.payload.logPlayers) {
        action.payload.LogCount = action.payload.logPlayers.length;
      }
      state.players[action.payload.steamId] = action.payload;
    },
    setFetching: (state, action: PayloadAction<{ steamId: string, fetching: boolean }>) => {
      state.players[action.payload.steamId].fetching = action.payload.fetching;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatsAction.pending, (state) => {
        state.stats = {};
      })
      .addCase(fetchStatsAction.fulfilled, (state, action) => {
        state.stats = {};
        action.payload.forEach((stats) => state.stats![stats.className] = stats);
      });
  },
});

export const { updatePlayer, setFetching } = playersSlice.actions;

export const selectPlayer = (steamId: string) => (state: RootState) => state.players.players[steamId];
export const selectPlayers = (state: RootState) => state.players.players;
export const selectStats = (state: RootState) => state.players.stats;

export default playersSlice.reducer;
