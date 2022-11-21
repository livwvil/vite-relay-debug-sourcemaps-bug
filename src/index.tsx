import { render } from 'react-dom';
import { RelayEnvironmentProvider } from 'react-relay';

import { App } from '@/App';

import { RelayEnvironment } from './RelayEnvironment';
import './index.css';

const RelayApp = () => {
  return <App />;
};

render(
  <RelayEnvironmentProvider environment={RelayEnvironment}>
    <RelayApp />
  </RelayEnvironmentProvider>,
  document.getElementById('app'),
);
