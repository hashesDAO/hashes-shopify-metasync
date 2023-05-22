import React from 'react';

import ExitFrame from './ExitFrame';
import ActiveWebhooks from './pages/debugCards/ActiveWebhooks';
import DebugIndex from './pages/debugCards/DebugIndex';
import GetData from './pages/debugCards/GetData';
import Index from './pages/Index';

const routes = {
  '/': () => <Index />,
  '/exitframe': () => <ExitFrame />,
  //Debug Cards
  '/debug': () => <DebugIndex />,
  '/debug/activeWebhooks': () => <ActiveWebhooks />,
  '/debug/getData': () => <GetData />,
  //Add your routes here
  // "metadata/create"
};

export default routes;
