import type { FC } from 'react';

interface IFullPageLoading {
  status?: string;
}

export const FullPageLoading: FC<IFullPageLoading> = ({ status }) => (
  <div className='flex h-full flex-col items-center justify-center gap-2'>
    <div className='box-border inline-block h-18 w-18 animate-spin rounded-full border-4 border-solid border-gray-600/20 border-b-gray-600 dark:border-d-gray-600/20 dark:border-b-d-gray-600'></div>
    {status}
  </div>
);
