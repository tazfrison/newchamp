import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CLASSES, TEAMS } from '../../app/types';
import { initialize } from '../profile/profileSlice';

export interface LiveServerProps {
  map: string;
  players: {
    [userId: number]: LivePlayerProps;
  };
  model: ServerConfig;
};

export interface LivePlayerProps {
  userId: number;
  slotId: number;
  name: string;
  steamId: string;
  serverIp: string;
  mute: boolean;
};

export interface AdvancedLiveServerProps extends LiveServerProps {
  live: boolean;
  paused: boolean;
  time: string;
  score: {
    Red: number;
    Blue: number;
  };
  players: {
    [userId: number]: AdvancedLivePlayerProps
  };
}

export interface AdvancedLivePlayerProps extends LivePlayerProps {
  isLocked: boolean;
  team: TEAMS;
  class: CLASSES;
}

export interface ServerConfig {
  id?: number;
  name: string;
  ip: string;
  port: number;
  password: string;
  rcon: string;
  advancedStats: boolean;
  channels: { [team in TEAMS]?: number };
}

export interface MumbleChannelProps {
  id: number;
  name: string;
  children: number[];
  tags?: { [key: string]: any };
  collapse?: boolean;
}

export interface ServersState {
  expand: boolean;
  mumble?: { [id: number]: MumbleChannelProps };
  configs?: { [id: number]: ServerConfig };
  live: { [id: number]: LiveServerProps };
  maps: string[],
};

const initialState: ServersState = {
  expand: false,
  live: {},
  maps: [],
}

export const fetchMumbleAction = createAsyncThunk('mumble/channels', async () => {
  const response = await fetch('/api/mumble');
  return (await response.json()) as MumbleChannelProps[];
});

export const updateChannelAction = createAsyncThunk('mumble/channel', async ({ id, tags }: { id: number, tags: any }, { getState }) => {
  const state = getState() as RootState;
  let route = `/api/mumble/${id}`;
  let method = 'PATCH';
  let body = tags;
  if (!state.servers.mumble) {
    return;
  }
  const channel = state.servers.mumble[id];
  if (!channel || !channel.tags) {
    if (tags === '') {
      return;
    }
    method = 'POST';
  } else if (tags === '') {
    method = 'DELETE';
    body = undefined;
  } else {
    method = 'PATCH';
  }

  await fetch(route, {
    method,
    body,
    headers: {
      'Content-type': 'application/json',
    },
  });
  const response = await fetch('/api/mumble');
  return (await response.json()) as MumbleChannelProps[];
});

export const updateConfigAction = createAsyncThunk('servers/update', async (action: ServerConfig) => {
  let route = '/api/servers';
  if (action.id) {
    route += `/${action.id}`;
  }
  const response = await fetch(route, {
    body: JSON.stringify(action),
    method: action.id ? 'PATCH' : 'POST',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await response.json() as ServerConfig;
});

export const configFunctionAction = createAsyncThunk('servers/function', async (action: { command: string, id: number }) => {
  let route = `/api/servers/${action.id}`;
  let method = 'GET';

  switch (action.command) {
    case 'delete':
      method = 'DELETE';
      break;
    case 'connect':
      route += '/connect';
      break;
    case 'disconnect':
      route += '/disconnect';
      break;
    default:
      throw new Error('Invalid action');
  }

  await fetch(route, {
    method,
    headers: {
      'Content-type': 'application/json',
    },
  });
});

export const fetchConfigsAction = createAsyncThunk('servers/configs', async () => {
  const response = await fetch('/api/servers');
  return (await response.json()) as ServerConfig[];
});

export const serversSlice = createSlice({
  name: 'servers',
  initialState,
  reducers: {
    updateServer: (state, action: PayloadAction<LiveServerProps>) => {
      state.live[action.payload.model.id!] = action.payload;
    },
    deleteServer: (state, action: PayloadAction<number>) => {
      delete state.live[action.payload];
    },
    setMaps: (state, action: PayloadAction<string[]>) => {
      state.maps = action.payload;
    },
    toggleSidebar: (state, action: PayloadAction<boolean>) => {
      state.expand = action.payload;
    },
    toggleChannel: (state, action: PayloadAction<number>) => {
      if (state.mumble && state.mumble[action.payload]) {
        state.mumble[action.payload].collapse = !state.mumble[action.payload].collapse;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initialize.fulfilled, (state, action) => {
        state.maps = action.payload.maps;
        action.payload.servers.forEach(server => {
          state.live[server.model.id!] = server;
        });
      })
      .addCase(fetchConfigsAction.pending, (state) => {
        state.configs = {};
      })
      .addCase(fetchConfigsAction.fulfilled, (state, action) => {
        state.configs = {};
        action.payload.forEach((config) => {
          if (config.id) {
            state.configs![config.id] = config;
          }
        });
      })
      .addCase(fetchMumbleAction.pending, (state) => {
        state.mumble = {};
      })
      .addCase(fetchMumbleAction.fulfilled, (state, action) => {
        state.mumble = {};
        action.payload.forEach((mumble) => {
          state.mumble![mumble.id] = mumble;
        });
      })
      .addCase(configFunctionAction.fulfilled, (state, action) => {
        if (state.configs && action.meta.arg.command === 'delete') {
          delete state.configs[action.meta.arg.id];
        }
      })
      .addCase(updateConfigAction.fulfilled, (state, action) => {
        if (action.payload.id) {
          state.configs![action.payload.id] = action.payload;
        }
      });
  },
});

export const { updateServer, deleteServer, setMaps, toggleChannel, toggleSidebar } = serversSlice.actions;

export const selectMaps = (state: RootState) => state.servers.maps;

export const selectServer = (serverId: number) => (state: RootState) => state.servers.live[serverId];
export const selectServers = (state: RootState) => state.servers.live;

export const selectServerConfigs = (state: RootState) => state.servers.configs;
export const selectServerConfig = (id: number) => (state: RootState) => state.servers.configs ? state.servers.configs[id] : undefined;

export const selectMumbleRoot = (state: RootState) => state.servers.mumble ? state.servers.mumble[0] : undefined;
export const selectMumbleChannel = (id: number) => (state: RootState) => state.servers.mumble ? state.servers.mumble[id] : undefined;

export const selectExpand = (state: RootState) => state.servers.expand;

export default serversSlice.reducer;
