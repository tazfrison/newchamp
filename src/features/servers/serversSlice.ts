import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CLASSES, TEAMS } from '../../app/types';

export interface ServerProps {
  ip: string;
  name: string;
  password: string;
  live: boolean;
  paused: boolean;
  time: string;
  map: string;
  score: {
    red: number;
    blu: number;
  };
  players: { [userId: number]: {
    userId: number;
    slotId: number;
    name: string;
    steamId: string;
    serverIp: string;
    mute: boolean;
    isLocked: boolean;
    team: TEAMS;
    class: CLASSES;
  } };
};

export interface ServersState {
  servers: { [ip: string]: ServerProps };
  maps: string[],
};

const initialState: ServersState = {
  servers: {},
  maps: [],
}

export const serversSlice = createSlice({
  name: 'servers',
  initialState,
  reducers: {
    updateServer: (state, action: PayloadAction<ServerProps>) => {
      state.servers[action.payload.ip] = action.payload;
    },
    setMaps: (state, action: PayloadAction<string[]>) => {
      state.maps = action.payload;
    },
  },
});

export const { updateServer, setMaps } = serversSlice.actions;

export const selectServer = (serverIp: string) => (state: RootState) => state.servers.servers[serverIp];
export const selectServers = (state: RootState) => state.servers.servers;
export const selectMaps = (state: RootState) => state.servers.maps;

export default serversSlice.reducer;
