import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { graphql, usePreloadedQuery } from 'react-relay';

import { useMatch } from '@tanstack/react-location';

import type { HomeLocation } from './location';

import type { Home_FilmsQuery } from './__generated__/Home_FilmsQuery.graphql';

export const Home: FC = () => {
  const {
    data: { filesRef },
  } = useMatch<HomeLocation>();

  const data = usePreloadedQuery<Home_FilmsQuery>(
    graphql`
      query Home_FilmsQuery {
        allFilms {
          films {
            title
          }
        }
      }
    `,
    filesRef!,
  );

  const [a, setA] = useState(10);

  useEffect(() => {
    const foo = () => {
      let res = 0;
      for (let i = 0; i < 10; i++) {
        res += i;
      }

      return res * 2;
    };

    // breakpoint place
    const test = false;

    const num = test ? 33 : foo();

    setA(num);
  }, []);

  console.log(a);
  console.log(data.allFilms?.films);

  return (
    <div className='flex min-h-full w-full flex-col overflow-y-auto px-4 py-5'>
      <div className='flex w-full grow flex-col items-center justify-center py-8 text-center'>
        <h1 className='mb-2 text-2xl underline'>StarWars films list:</h1>
        <ul className='flex flex-col items-start gap-1'>
          {data.allFilms?.films?.map(film => (
            <li className='before:mr-2 before:content-["-"]' key={film?.title}>
              {film?.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
