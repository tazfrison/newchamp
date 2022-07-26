import { Action, combineReducers, configureStore, ThunkAction } from '@reduxjs/toolkit';
import profileReducer from '../features/profile/profileSlice';
import serversReducer from '../features/servers/serversSlice';
import usersReducer from '../features/users/usersSlice';
import draftReducer from '../features/draft/draftSlice';
import logsReducer from '../features/logs/logsSlice';
import playersReducer from '../features/players/playersSlice';

const reducers = {
  users: usersReducer,
  profile: profileReducer,
  servers: serversReducer,
  draft: draftReducer,
  logs: logsReducer,
  players: playersReducer,
};

export const store = configureStore({
  reducer: reducers,
});

export type AppDispatch = typeof store.dispatch;
const rootReducer = combineReducers(reducers);
export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
