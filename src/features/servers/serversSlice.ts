import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface ServerProps {
  ip: string;
  live: boolean;
  paused: boolean;
  time: string;
  map: string;
  score: {
    red: number;
    blu: number;
  };
  players: { [userId: number]: {
    team: string;
    class: string;
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
