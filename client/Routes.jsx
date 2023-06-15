import React from 'react';

import ExitFrame from './ExitFrame';
import ActiveWebhooks from './pages/debugCards/ActiveWebhooks';
import DebugIndex from './pages/debugCards/DebugIndex';
import GetData from './pages/debugCards/GetData';
import Index from './pages/Index';
import AdminIndex from './pages/adminCards/AdminIndex';
import ConfigureProducts from './pages/adminCards/ConfigureProducts';
import BurnEvents from './pages/adminCards/BurnEvents';
import MetadataPreview from './pages/metadataCards/MetadataPreview';
import MetadataIndex from './pages/metadataCards/MetadataIndex';
import CustomMetadataPage from './pages/metadataCards/CustomMetadata';
import RepairApp from './pages/adminCards/RepairApp';

const routes = {
  '/': () => <Index />,
  '/exitframe': () => <ExitFrame />,
  //Admin cards
  '/admin': () => <AdminIndex />,
  '/admin/configure': () => <ConfigureProducts />,
  '/admin/burn': () => <BurnEvents />,
  '/admin/repair': () => <RepairApp />,
  // Metadata Cards
  '/metadata': () => <MetadataIndex />,
  '/metadata/preview': () => <MetadataPreview />,
  '/metadata/custom': () => <CustomMetadataPage />,
  //Debug Cards
  '/debug': () => <DebugIndex />,
  '/debug/activeWebhooks': () => <ActiveWebhooks />,
  '/debug/getData': () => <GetData />,
  //Add your routes here
  // "metadata/create"
};

export default routes;
