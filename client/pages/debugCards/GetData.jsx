import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { Layout, LegacyCard, Link, Page, TextField } from '@shopify/polaris';
import { navigate } from 'raviger';
import React, { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';

const defaultPostBody = JSON.stringify(
  {
    content: 'Body of POST request',
  },
  null,
  2
);

const GetData = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [responseData, setResponseData] = useState('');
  const [responseDataPost, setResponseDataPost] = useState('');
  const [responseDataGQL, setResponseDataGQL] = useState('');
  const [postBody, setPostBody] = useState(defaultPostBody);
  const [isPostBodyValid, setIsPostBodyValid] = useState(true);
  const fetch = useFetch();

  async function fetchContent() {
    setResponseData('loading...');
    const res = await fetch('/api');
    const { text } = await res.json();
    setResponseData(text);
  }

  async function fetchContentPost() {
    setResponseDataPost('loading...');
    try {
      const parsedPostBody = JSON.parse(postBody);
      setIsPostBodyValid(true);
      const res = await fetch('/api', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(parsedPostBody),
      });

      const { content } = await res.json();
      setResponseDataPost(content);
    } catch (error) {
      setIsPostBodyValid(false);
      console.error(error);
    }
  }

  async function fetchContentGQL() {
    setResponseDataGQL('loading...');
    const res = await fetch('/api/gql');
    const response = await res.json();
    setResponseDataGQL(response.body.data.shop.name);
  }

  useEffect(() => {
    fetchContent();
    fetchContentPost();
    fetchContentGQL();
  }, []);

  return (
    <Page
      title="Data Fetching"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/debug') }]}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard
            sectioned
            primaryFooterAction={{
              content: 'Refetch',
              onAction: () => {
                fetchContent();
              },
            }}
          >
            <p>
              GET <code>"/apps/api"</code>: {responseData}
            </p>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section>
          <LegacyCard
            sectioned
            primaryFooterAction={{
              content: 'Submit',
              onAction: () => {
                fetchContentPost();
              },
            }}
          >
            <p>
              POST <code>"/apps/api" </code>
            </p>
            <TextField
              label="POST Response"
              value={responseDataPost}
              readOnly={true}
            />
            <TextField
              label="Post Body"
              value={postBody}
              onChange={(newValue) => setPostBody(newValue)}
              multiline={5} // Set the number of visible rows in the text box
              error={!isPostBodyValid}
              helpText={!isPostBodyValid && 'Invalid JSON format'}
            />
          </LegacyCard>
        </Layout.Section>
        <Layout.Section>
          <LegacyCard
            sectioned
            primaryFooterAction={{
              content: 'Refetch',
              onAction: () => {
                fetchContentGQL();
              },
            }}
          >
            <p>
              GET <code>"/apps/api/gql"</code>: {responseDataGQL}
            </p>
          </LegacyCard>
          <LegacyCard title="Developer Notes">
            <LegacyCard.Section title="Making Requests">
              <li>
                Create a new route in <code>/server/routes</code> and add it to
                your <code>index.js</code> to expose it behind{' '}
                <code>verifyRequest</code>.
              </li>
              <li>
                Create a new instance of <code>useFetch()</code> and use that to
                make a request to <code>/api/your-route/goes-here/</code>
              </li>
              <li>
                [Optional] Use a library like{' '}
                <Link
                  onClick={() => {
                    redirect.dispatch(Redirect.Action.REMOTE, {
                      url: 'https://tanstack.com/query/latest',
                      newContext: true,
                    });
                  }}
                >
                  <code>@tanstack/react-query</code>
                </Link>{' '}
                or{' '}
                <Link
                  onClick={() => {
                    redirect.dispatch(Redirect.Action.REMOTE, {
                      url: 'https://swr.vercel.app',
                      newContext: true,
                    });
                  }}
                >
                  <code>swr</code>
                </Link>{' '}
                for client-side data fetching state management.
              </li>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default GetData;
