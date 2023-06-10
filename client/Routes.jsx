import React from 'react';

import ExitFrame from './ExitFrame';
import ActiveWebhooks from './pages/debugCards/ActiveWebhooks';
import DebugIndex from './pages/debugCards/DebugIndex';
import GetData from './pages/debugCards/GetData';
import Index from './pages/Index';
import AdminIndex from './pages/adminCards/AdminIndex';
import ConfigureProducts from './pages/adminCards/ConfigureProducts';
import BurnEvents from './pages/adminCards/BurnEvents';

const routes = {
  '/': () => <Index />,
  '/exitframe': () => <ExitFrame />,
  //Admin cards
  '/admin': () => <AdminIndex />,
  '/admin/configure': () => <ConfigureProducts />,
  //Debug Cards
  '/debug': () => <DebugIndex />,
  '/debug/activeWebhooks': () => <ActiveWebhooks />,
  '/debug/getData': () => <GetData />,
  //Add your routes here
  // "metadata/create"
};

export default routes;
