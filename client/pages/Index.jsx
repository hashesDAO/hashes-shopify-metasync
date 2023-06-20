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
        <Layout.Section fullWidth>
          <LegacyCard title="Instructions for use">
            <LegacyCard.Section>
              <li>
                Configure products via the admins Configure Products section
              </li>
              <li>
                Check burn events every so often via the admins Burn Events
                section
              </li>
              <li>
                Go to shopify Orders section and manually review all orders
                marked as "Burned"
              </li>
              <br></br>
              <h2>Once the claim period and burn period have ended:</h2>
              <li>
                Do a final check for burns, by going to Admins burns section and
                clicking refresh
              </li>
              <li>Fufill orders marked "burned"</li>
              <li>
                Go to metadata preview and type in an order number to ensure
                everything is working
              </li>
              <li>
                Add verisart urls. We add these based off the tokengate address
                and tokenId used.
              </li>
              <li>
                Check metadata preview again to ensure the values were taken
              </li>
              <li>
                Go to the metadata "Upload to IPFS" section and follow
                instructions
              </li>
              <br></br>
              <h2>
                If something is broken or you forget to configure products:
              </h2>
              <li>Get the app back up and running</li>
              <li>
                Go to admin, and click the repair button. This will loop through
                all the shopify stores orders and attempt to fix everything, and
                check for burns
              </li>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
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
