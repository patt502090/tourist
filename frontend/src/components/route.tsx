import { createBrowserRouter } from 'react-router-dom';
import Home from './Pages/Home';
import Problem from './Pages/Problem/Index';
import SignIn from './Pages/SignIn/Index';
import SignUp from './Pages/SignUp/Index';
// import Contest from './Pages/Contest';
import ProfilePage from './Pages/Profile';
import Scoreboard from './Pages/Contests';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/problems/:problemname',
    element: <Problem />,
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/contests',
    element: <Scoreboard/>,
  },
  // {
  //   path: '/contests/:contestId',
  //   element: <Contest />,
  // },
  {
    path: '*',
    element: <Home />,
  },
  {
    path: 'profile',
    element: <ProfilePage />,
  },
]);
export default router;
