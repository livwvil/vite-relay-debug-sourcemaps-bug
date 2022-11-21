import { lazy } from 'react';
import { loadQuery } from 'react-relay';

import type { Route, RouteMatch } from '@tanstack/react-location';
import { Navigate } from '@tanstack/react-location';

import { RelayEnvironment } from './RelayEnvironment';
import Home_FilmsQuery from './views/Home/__generated__/Home_FilmsQuery.graphql';
import type { HomeLocation } from './views/Home/location';

const Home = lazy(() => import('@/views/Home'));

export const routes: Route[] = [
  {
    path: '/',
    element: <Home />,
    loader: () => ({
      filesRef: loadQuery(RelayEnvironment, Home_FilmsQuery, {}),
    }),
    onMatch: (match: RouteMatch<HomeLocation>) => () =>
      match.data.filesRef?.dispose(),
  },
  {
    element: <Navigate to='/' />,
  },
];
