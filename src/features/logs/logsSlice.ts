import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CLASSES, TEAMS } from '../../app/types';

export interface LogProps {
  id: number;
  title: string;
  upload: string;
  map: string;
  duration: number;
  bluScore: number;
  redScore: number;
  winner?: TEAMS;
  rounds?: RoundProps[];
  players?: LogPlayerProps[];
  fetching: boolean;
  teamStats: {[team in TEAMS]: LogTeamStats};
}

export interface LogTeamStats {
  score: number;
  kills: number;
  deaths: number;
  dmg: number;
  charges: number;
  drops: number;
  firstcaps: number;
  caps: number;
}

export interface RoundProps {
  id: number;
  number: number;
  start_time: string;
  duration: number;
  winner?: TEAMS;
  firstCap?: TEAMS;
  logId: number;
  teamStats: {[team in TEAMS]: RoundTeamStats};
}

export interface RoundTeamStats {
  score: number;
  kills: number;
  dmg: number;
  ubers: number;
}

export interface LogPlayerProps {
  id: number;
  kills: number;
  assists: number;
  deaths: number;
  damage: number;
  damageTaken: number,
  playtime: number;
  team: TEAMS;
  healthPacks: number;
  airshots: number;
  captures: number;
  logId: number;
  playerId: number;
  player?: PlayerProps;
  log?: LogProps;
  logClassStats?: LogClassStatProps[];
}

export interface LogClassStatProps {
  id: number;
  kills: number;
  assists: number;
  deaths: number;
  damage: number;
  playtime: number;
  className: CLASSES;
  logPlayerId: number;
  logPlayer?: LogPlayerProps;
  playerId: number;
  player?: PlayerProps;
}

export interface PlayerProps {
  id: number;
  steamId: string;
  name: string;
}

export interface LogsState {
  logs: { [logId: number]: LogProps },
  uploaded?: any[],
};

const initialState: LogsState = {
  logs: {},
};

export const formatter = (date: Date) => {
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
  let hours = date.getHours() % 12;
  if (hours === 0) {
    hours = 12;
  }
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const meridian = date.getHours() > 12 ? 'PM' : 'AM';
  return `${month} ${date.getDate()}, ${date.getFullYear()} ${hours}:${minutes} ${meridian}`
}

export const duration = (length: number) => {
  return `${Math.floor(length / 60)}:${('0' + (length % 60)).slice(-2)}`;
}

export const round = (number: number) => {
  if (number <= 0) {
    return 0;
  }
  const exp = Math.floor(Math.log10(number));
  const scale = Math.pow(10, Math.max(2 - exp, 1));
  return Math.floor(scale * number) / scale;
}

export const fetchUploaderAction = createAsyncThunk('logs/uploader', async () => {
  const response = await fetch('https://logs.tf/api/v1/log?uploader=76561198027325929&limit=100');
  return (await response.json()).logs;
});

export const fetchLogAction = createAsyncThunk('logs/fetch', async (logId: number, { dispatch, getState }) => {
  try {
    const state = getState() as RootState;
    if (state.logs.logs[logId] && state.logs.logs[logId].fetching) {
      return;
    }
  } catch (e) {
    console.log(e);
    return;
  }
  dispatch(setFetching({ logId, fetching: true }));
  const response = await fetch(`/api/logs/${logId}`);
  dispatch(updateLog(await response.json()));
  dispatch(setFetching({ logId, fetching: false }));
});

export const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    updateLog: (state, action: PayloadAction<any>) => {
      action.payload.fetching = false;
      state.logs[action.payload.id] = action.payload;
    },
    setFetching: (state, action: PayloadAction<{ logId: number, fetching: boolean }>) => {
      state.logs[action.payload.logId].fetching = action.payload.fetching;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUploaderAction.pending, (state) => {
        state.uploaded = [];
      })
      .addCase(fetchUploaderAction.fulfilled, (state, action) => {
        state.uploaded = action.payload;
      });
  },
});

export const { updateLog, setFetching } = logsSlice.actions;

export const selectLog = (logId: number) => (state: RootState) => state.logs.logs[logId];
export const selectLogs = (state: RootState) => state.logs.logs;
export const selectUploaded = (state: RootState) => state.logs.uploaded;

export default logsSlice.reducer;
