import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import {
  Layout,
  LegacyCard,
  Link,
  ResourceList,
  Page,
  TextField,
} from '@shopify/polaris';
import { navigate } from 'raviger';
import React, { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';

const ConfigureProducts = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [responseDataPost, setResponseDataPost] = useState('');

  const fetch = useFetch();

  useEffect(() => {
    getBurnEvents();
  }, []);

  async function refreshBurns() {
    setResponseDataPost('loading...');
    try {
      const res = await fetch('/admin/refresh_burns/', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const json = await res.json();

      if (json.message) {
        setResponseDataPost(json.message);
      } else {
        setResponseDataPost(json.error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getBurnEvents() {
    try {
      const res = await fetch('/admin/burns/', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });
      const json = await res.json();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Page
      title="Burn Events"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/admin') }]}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard title="Saved Products">
            <ResourceList />
          </LegacyCard>
        </Layout.Section>
        <Layout.Section>
          <LegacyCard
            sectioned
            primaryFooterAction={{
              content: 'Check for new burns',
              onAction: () => {
                refreshBurns();
              },
            }}
          ></LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default BurnEvents;
