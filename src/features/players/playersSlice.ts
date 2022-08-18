import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CLASSES } from '../../app/types';
import { LogPlayerProps } from '../logs/logsSlice';

export interface PlayerProps {
  id: number;
  steamId: string;
  name: string;
  logPlayers?: LogPlayerProps[];
  aggregatedClassStats?: AggregatedClassStatProps[];
  total?: number;
  wins?: number;
  ties?: number;
  losses?: number;
  fetching: boolean;
}

export interface PlayersState {
  players: { [steamId: string]: PlayerProps | null },
  globalStats: { [className in CLASSES]?: GlobalClassStatProps },
  //  playerStats: { [playerId: number]: { [className in CLASSES]?: AggregatedClassStatProps } },
};

export interface AggregatedClassStatProps {
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

export interface GlobalClassStatProps extends AggregatedClassStatProps {
  ka_d_sd: number;
  k_d_sd: number;
  k_m_sd: number;
  a_m_sd: number;
  de_m_sd: number;
  da_m_sd: number;
}

const initialState: PlayersState = {
  players: {},
  globalStats: {},
};

export const fetchPlayerAction = createAsyncThunk('player/fetch', async ({ steamId, lazy }: { steamId: string, lazy?: boolean }, { dispatch, getState }) => {
  const state = getState() as RootState;
  if (state.players.players[steamId] === null || state.players.players[steamId]?.fetching) {
    return;
  }

  if (state.players.players[steamId] && lazy) {
    return;
  }

  dispatch(setFetching(steamId));
  const response = await fetch(`/api/players/${steamId}`);
  return await response.json() as PlayerProps;
});

export const fetchPlayersAction = createAsyncThunk('players/fetch', async (steamIds: string[], { dispatch, getState }) => {
  const state = getState() as RootState;
  const fetchIds = steamIds.filter(steamId => {
    if (state.players.players[steamId] && !state.players.players[steamId]!.fetching) {
      dispatch(setFetching(steamId));
      return true;
    }
    return false;
  });

  if (fetchIds.length === 0) {
    return;
  }

  const url = new URL(`/api/players`, window.location.origin);
  fetchIds.forEach(steamId => url.searchParams.append('steamIds', steamId));

  const response = await fetch(url);
  return await response.json() as PlayerProps[];
});

export const fetchStatsAction = createAsyncThunk('players/stats', async (_payload, { dispatch }) => {
  const response = await fetch('/api/stats');
  dispatch(updateGlobals(await response.json()));
});

export const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    updatePlayer: (state, action: PayloadAction<PlayerProps | null>) => {
      if (action.payload) {
        action.payload.fetching = false;
        state.players[action.payload.steamId] = action.payload;
      }
    },
    setFetching: (state, action: PayloadAction<string>) => {
      if (state.players[action.payload] && state.players[action.payload] !== null) {
        state.players[action.payload]!.fetching = true;
      } else {
        state.players[action.payload] = null;
      }
    },
    updateGlobals: (state, action: PayloadAction<AggregatedClassStatProps[]>) => {
      const avgs: { [className in CLASSES]?: AggregatedClassStatProps } = {};
      const deviations: { [className in CLASSES]?: AggregatedClassStatProps } = {};
      action.payload.forEach((stats) => {
        if (stats.playerId) {
          return;
        }
        if (stats.count === 0) {
          deviations[stats.className] = stats;
        } else {
          avgs[stats.className] = stats;
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
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayerAction.fulfilled, (state, action) => {
        if (action.payload) {
          action.payload.fetching = false;
          state.players[action.payload.steamId] = action.payload;
        }
      })
      .addCase(fetchPlayersAction.fulfilled, (state, action) => {
        if (action.payload) {
          action.payload.forEach((player: PlayerProps) => {
            player.fetching = false;
            state.players[player.steamId] = player;
          });
        }
      });
  },
});

export const { updatePlayer, setFetching, updateGlobals } = playersSlice.actions;

export const selectPlayer = (steamId?: string) => (state: RootState) => steamId ? state.players.players[steamId] : undefined;
export const selectPlayers = (state: RootState) => state.players.players;
export const selectGlobalStats = (state: RootState) => state.players.globalStats;

export default playersSlice.reducer;
