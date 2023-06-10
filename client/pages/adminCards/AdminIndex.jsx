import { useAppBridge } from '@shopify/app-bridge-react';
import { Layout, LegacyCard, Page } from '@shopify/polaris';
import { navigate } from 'raviger';
import React from 'react';

const AdminIndex = () => {
  const app = useAppBridge();
  return (
    <Page
      title="Admin"
      subtitle="Configuration and admin controls"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/') }]}
    >
      <Layout>
        <Layout.Section fullWidth>
          <LegacyCard
            sectioned
            title="Configure Products"
            primaryFooterAction={{
              content: 'Configure',
              onAction: () => {
                navigate('/admin/configure');
              },
            }}
          >
            <p>Check products configured and configure/update products</p>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default AdminIndex;
