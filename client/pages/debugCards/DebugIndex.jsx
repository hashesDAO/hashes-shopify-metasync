import { useAppBridge } from '@shopify/app-bridge-react';
import { Layout, LegacyCard, Page } from '@shopify/polaris';
import { navigate } from 'raviger';
import React from 'react';

const DebugIndex = () => {
  const app = useAppBridge();
  return (
    <Page
      title="Debug Cards"
      subtitle="Interact and explore the current installation"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/') }]}
    >
      <Layout>
        <Layout.Section oneHalf>
          <LegacyCard
            sectioned
            title="Webhooks"
            primaryFooterAction={{
              content: 'Explore',
              onAction: () => {
                navigate('/debug/activeWebhooks');
              },
            }}
          >
            <p>Explore registered webhooks and endpoints.</p>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default DebugIndex;
