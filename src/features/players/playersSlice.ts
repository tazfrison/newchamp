import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CLASSES } from '../../app/types';
import { LogPlayerProps } from '../logs/logsSlice';

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
  globalStats?: { [className in CLASSES]?: GlobalClassStatProps },
  playerStats: { [playerId: number]: { [className in CLASSES]?: AggregateClassStatProps } },
};

export interface AggregateClassStatProps {
  playerId?: number;
  className: CLASSES;
  count: number;
  playtime: number;
  wins: number;
  losses: number;
  ka_d: number;
  k_d: number;
  k_m: number;
  a_m: number;
  de_m: number;
  da_m: number;
}

export interface GlobalClassStatProps extends AggregateClassStatProps {
  ka_d_sd: number;
  k_d_sd: number;
  k_m_sd: number;
  a_m_sd: number;
  de_m_sd: number;
  da_m_sd: number;
}

const initialState: PlayersState = {
  players: {},
  playerStats: {},
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
        state.globalStats = {};
      })
      .addCase(fetchStatsAction.fulfilled, (state, action) => {
        const avgs: { [className in CLASSES]?: AggregateClassStatProps } = {};
        const deviations: { [className in CLASSES]?: AggregateClassStatProps } = {};
        action.payload.forEach((stats) => {
          if (stats.playerId) {
            if (!state.playerStats[stats.playerId]) {
              state.playerStats[stats.playerId] = {};
            }
            state.playerStats[stats.playerId][stats.className] = stats;
          } else {
            if (stats.count === 0) {
              deviations[stats.className] = stats;
            } else {
              avgs[stats.className] = stats;
            }
          }
        });
        for (const className of Object.values(CLASSES)) {
          if (avgs[className] && deviations[className]) {
            const avg = avgs[className]!;
            const deviation = deviations[className]!;
            state.globalStats![className] = {
              className,
              count: avg.count,
              playtime: avg.playtime,
              wins: 0,
              losses: 0,
              ka_d: avg.ka_d,
              k_d: avg.k_d,
              k_m: avg.k_m,
              a_m: avg.a_m,
              de_m: avg.de_m,
              da_m: avg.da_m,
              ka_d_sd: deviation.ka_d,
              k_d_sd: deviation.k_d,
              k_m_sd: deviation.k_m,
              a_m_sd: deviation.a_m,
              de_m_sd: deviation.de_m,
              da_m_sd: deviation.da_m,
            }
          }
        }
      });
  },
});

export const { updatePlayer, setFetching } = playersSlice.actions;

export const selectPlayer = (steamId?: string) => (state: RootState) => steamId ? state.players.players[steamId] : undefined;
export const selectPlayers = (state: RootState) => state.players.players;
export const selectGlobalStats = (state: RootState) => state.players.globalStats;
export const selectPlayerStats = (playerId?: number) => (state: RootState) => playerId ? state.players.playerStats[playerId] : undefined;

export default playersSlice.reducer;
