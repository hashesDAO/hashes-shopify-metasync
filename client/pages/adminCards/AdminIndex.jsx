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
          <LegacyCard
            sectioned
            title="Burn Events"
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/admin/burn');
              },
            }}
          >
            <p>View burns and force refresh burn events</p>
          </LegacyCard>
          <LegacyCard
            sectioned
            title="Customer Emails"
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/admin/email');
              },
            }}
          >
            <p>Gets customers emails</p>
          </LegacyCard>
          <LegacyCard
            sectioned
            title="Repair app"
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/admin/repair');
              },
            }}
          >
            <p>Update the apps database with all missed events</p>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default AdminIndex;
