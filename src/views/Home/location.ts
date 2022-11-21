import type { PreloadedQuery } from 'react-relay';

import type { MakeGenerics } from '@tanstack/react-location';

import type { Home_FilmsQuery as Home_FilmsQueryType } from './__generated__/Home_FilmsQuery.graphql';

export type HomeLocation = MakeGenerics<{
  LoaderData: {
    filesRef: PreloadedQuery<Home_FilmsQueryType>;
  };
}>;
