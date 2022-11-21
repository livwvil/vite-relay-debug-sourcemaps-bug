import { createClient } from 'graphql-ws';
import { meros } from 'meros/browser';
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
} from 'relay-runtime';
import type {
  CacheConfig,
  FetchFunction,
  GraphQLResponse,
  RequestParameters,
  Uploadable,
  UploadableMap,
  Variables,
} from 'relay-runtime';

type FetchConfiguration = {
  headers: { [key: string]: string };
  endpoint: string;
  method: string;
  query: string | null | undefined;
  variables: Variables;
};

const fetchWithMultipartBody = (
  { endpoint, headers, method, query, variables }: FetchConfiguration,
  uploadables: UploadableMap,
) => {
  const acc: {
    files: { key: string; file: Uploadable }[];
    map: { [key: string]: string[] };
  } = { files: [], map: {} };

  const { files, map } = Object.entries(uploadables).reduce(
    (acc, [key, file], idx) => ({
      files: [
        ...acc.files,
        {
          key: `${idx}`,
          file,
        },
      ],
      map: {
        ...acc.map,
        [`${idx}`]: [`variables.${key}`],
      },
    }),
    acc,
  );

  const operations = {
    query,
    variables,
  };

  const formData = new FormData();

  formData.append('operations', JSON.stringify(operations));
  formData.append('map', JSON.stringify(map));
  files.forEach(item => {
    formData.append(item.key, item.file);
  });

  return fetch(endpoint, {
    headers,
    method,
    body: formData,
  });
};

const fetchWithDefaultBody = ({
  endpoint,
  headers,
  method,
  query,
  variables,
}: FetchConfiguration) => {
  const additionalHeaders = {
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify({
    query,
    variables,
  });

  return fetch(endpoint, {
    headers: { ...headers, ...additionalHeaders },
    method,
    body,
  });
};

/**
 * Relay requires developers to configure a "fetch" function that tells Relay how to load
 * the results of GraphQL queries from your server (or other data source). See more at
 * https://relay.dev/docs/en/quick-start-guide#relay-environment.
 */
const fetchQuery: FetchFunction = (
  params: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: UploadableMap | null,
) => {
  return Observable.create(sink => {
    (async () => {
      // Check that the auth token is configured
      const token = localStorage.getItem('token');
      const endpoint =
        'https://swapi-graphql.netlify.app/.netlify/functions/index';

      const fetchConfig: FetchConfiguration = {
        endpoint,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        method: 'POST',
        query: params.text,
        variables,
      };

      const response = await (uploadables
        ? fetchWithMultipartBody(fetchConfig, uploadables)
        : fetchWithDefaultBody(fetchConfig));

      const parts = await meros<GraphQLResponse>(response);

      if (isAsyncIterable(parts)) {
        for await (const part of parts) {
          if (!part.json) {
            sink.error(new Error('Failed to parse part as json.'));
            break;
          }

          const result = part.body;

          // Realyism
          if ('hasNext' in result) {
            /* eslint-disable */
            // @ts-ignore
            if (!result.extensions) result.extensions = {};
            // @ts-ignore
            result.extensions.is_final = !result.hasNext;
            // @ts-ignore
            delete result.hasNext;
            /* eslint-enable */
          }

          sink.next(result);
        }
      } else {
        const json = await parts.json();

        if (Array.isArray(json.errors)) {
          const errorsMessage: string = json.errors
            .filter(
              (error: { message?: string }) => error?.message !== undefined,
            )
            .map((error: { message: string }) => error.message)
            .join('\n');
          sink.error(new Error(errorsMessage));
        }

        sink.next(json);
      }

      sink.complete();
    })();
  });
};

function isAsyncIterable(input: unknown): input is AsyncIterable<unknown> {
  return (
    typeof input === 'object' &&
    input !== null &&
    // Some browsers still don't have Symbol.asyncIterator implemented (iOS Safari)
    // That means every custom AsyncIterable must be built using a AsyncGeneratorFunction
    // (async function * () {})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((input as any)[Symbol.toStringTag] === 'AsyncGenerator' ||
      Symbol.asyncIterator in input)
  );
}

const subscriptionsClient = createClient({
  url: 'ws://swapi-graphql.netlify.app/.netlify/functions/index',
  connectionParams: () => {
    return { token: localStorage.getItem('token') };
  },
});

const subscribe = (
  operation: RequestParameters,
  variables: Variables,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Observable<any> => {
  return Observable.create(sink => {
    if (!operation.text) {
      return sink.error(new Error('Operation text cannot be empty'));
    }
    return subscriptionsClient.subscribe(
      {
        operationName: operation.name,
        query: operation.text,
        variables,
      },
      sink,
    );
  });
};

const network = Network.create(fetchQuery, subscribe);

// Export a singleton instance of Relay Environment configured with our network layer:
export const RelayEnvironment = new Environment({
  network: network,
  store: new Store(new RecordSource(), {
    // This property tells Relay to not immediately clear its cache when the user
    // navigates around the app. Relay will hold onto the specified number of
    // query results, allowing the user to return to recently visited pages
    // and reusing cached data if its available/fresh.
    gcReleaseBufferSize: 10,
  }),
});
