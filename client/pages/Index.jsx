import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { Layout, LegacyCard, Page } from '@shopify/polaris';
import { navigate } from 'raviger';
import React from 'react';

const HomePage = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  return (
    <Page title="Home">
      <Layout>
        <Layout.Section oneHalf>
          <LegacyCard
            title="Admin"
            sectioned
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/admin');
              },
            }}
          >
            <p>Admin controls</p>
          </LegacyCard>
          <LegacyCard
            title="Metadata"
            sectioned
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/metadata');
              },
            }}
          >
            <p>Metadata controls</p>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section oneHalf>
          <LegacyCard
            title="Debug"
            sectioned
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/debug');
              },
            }}
          >
            <p>Debug endpoints</p>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default HomePage;
