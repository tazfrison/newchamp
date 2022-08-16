import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { Drafter } from './features/draft/Drafter';
import Log from './features/logs/Log';
import { Importer, Index, Logs } from './features/logs/Logs';
import Player from './features/players/Player';
import { Players, Stats } from './features/players/Players';
import { Header } from './features/profile/Header';
import { initialize, selectStatus } from './features/profile/profileSlice';
import ManageServer from './features/servers/ManageServer';
import { ManageServers } from './features/servers/ManageServers';
import { ServerList } from './features/servers/ServerList';
import { UserList } from './features/users/UserList';

function Home() {
  return (<div className='content'>
    <UserList />
    <Drafter />
    <ServerList />
  </div>);
}

function Loading() {
  return (<div>Loading</div>);
}

function App() {
  const status = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(initialize());
    }
  }, [status, dispatch]);

  return (<BrowserRouter>
    <Header />
    <Routes>
      <Route path='/' element={status === 'ready' ? <Home /> : <Loading />} />
      <Route path='/players' element={status === 'ready' ? <Players /> : <Loading />}>
        <Route index element={<Stats />} />
        <Route path=':steamId' element={<Player />} />
      </Route>
      <Route path='/logs' element={status === 'ready' ? <Logs /> : <Loading />}>
        <Route index element={<Index />} />
        <Route path='import' element={<Importer />} />
        <Route path=':logId' element={<Log />} />
      </Route>
      <Route path='/servers' element={status === 'ready' ? <ManageServers /> : <Loading />}>
        <Route path='New' element={<ManageServer />} />
        <Route path=':configId' element={<ManageServer />} />
      </Route>
    </Routes>
  </BrowserRouter>);
}

export default App;
