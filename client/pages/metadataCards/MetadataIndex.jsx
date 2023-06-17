import { useAppBridge } from '@shopify/app-bridge-react';
import { Layout, LegacyCard, Page } from '@shopify/polaris';
import { navigate } from 'raviger';
import React from 'react';

const MetadataIndex = () => {
  const app = useAppBridge();
  return (
    <Page
      title="Metadata"
      subtitle="Metadata controls"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/') }]}
    >
      <Layout>
        <Layout.Section fullWidth>
          <LegacyCard
            sectioned
            title="Metadata preview"
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/metadata/preview');
              },
            }}
          >
            <p>Preview metadata for a given order</p>
          </LegacyCard>
          <LegacyCard
            sectioned
            title="Add custom metadata"
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/metadata/custom');
              },
            }}
          >
            <p>
              Add custom metdata on a per token basis. Used for verisart links
            </p>
          </LegacyCard>
          <LegacyCard
            sectioned
            title="Upload to IPFS"
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/metadata/ipfs');
              },
            }}
          >
            <p>
              Send a request to upload all redeem collections metadata to IPFS
            </p>
          </LegacyCard>
          <LegacyCard
            sectioned
            title="Refresh OS metadata"
            primaryFooterAction={{
              content: 'View',
              onAction: () => {
                navigate('/metadata/refresh');
              },
            }}
          >
            <p>Send a request to OS to refresh metadata for collections</p>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default MetadataIndex;
