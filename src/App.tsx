import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { Drafter } from './features/draft/Drafter';
import Log from './features/logs/Log';
import { Importer, Index, Logs } from './features/logs/Logs';
import Player from './features/players/Player';
import { Players, Stats } from './features/players/Players';
import { Header } from './features/profile/Header';
import { initialize, selectProfile, selectStatus } from './features/profile/profileSlice';
import ManageServer from './features/servers/ManageServer';
import { ManageServers } from './features/servers/ManageServers';
import { ServerList } from './features/servers/ServerList';

function Home() {
  return (<div className='content'>
    <Drafter />
    <ServerList />
  </div>);
}

function Loading() {
  return (<div>Loading</div>);
}

function NotFound() {
  return (<div>Route not found<br /><Link to='/'>Return to Home</Link></div>)
}

function App() {
  const status = useAppSelector(selectStatus);
  const profile = useAppSelector(selectProfile);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(initialize());
    }
  }, [status, dispatch]);

  const routes = [
    (<Route key='root' path='/' element={status === 'ready' ? <Home /> : <Loading />} />),
    (<Route key='players' path='/players/:steamId' element={status === 'ready' ? <Player /> : <Loading />} />),
    (<Route key='logs' path='/logs' element={status === 'ready' ? <Logs /> : <Loading />}>
      <Route index element={<Index />} />
      <Route path='import' element={<Importer />} />
      <Route path=':logId' element={<Log />} />
    </Route>),
  ];

  if (profile) {
    routes.push((<Route key='profile' path='/profile' element={status === 'ready' ? <Player /> : <Loading />} />))
    if (profile.admin) {
      routes.push(
        (<Route key='servers' path='/servers' element={status === 'ready' ? <ManageServers /> : <Loading />}>
          <Route path='New' element={<ManageServer />} />
          <Route path=':configId' element={<ManageServer />} />
        </Route>),
        (<Route key='users' path='/users' element={status === 'ready' ? <Players /> : <Loading />}>
          <Route index element={<Stats />} />
          <Route path=':steamId' element={<Player />} />
        </Route>),
      );
    }
  }

  routes.push((<Route key='catch' path='*' element={<NotFound />} />));

  return (<BrowserRouter>
    <Header />
    <Routes>
      {routes}
    </Routes>
  </BrowserRouter>);
}

export default App;
