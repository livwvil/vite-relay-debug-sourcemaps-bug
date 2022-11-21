import { Suspense } from 'react';
import type { FC } from 'react';

import { Outlet, ReactLocation, Router } from '@tanstack/react-location';

import { FullPageLoading } from '@/components/FullPageLoading';

import { routes } from './routes';

const location = new ReactLocation();

export const App: FC = () => (
  <div className='h-screen overflow-auto bg-background-secondary dark:bg-d-background-primary'>
    <Router location={location} routes={routes}>
      <Suspense fallback={<FullPageLoading />}>
        <Outlet />
      </Suspense>
    </Router>
  </div>
);
