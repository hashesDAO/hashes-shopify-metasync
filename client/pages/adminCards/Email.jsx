import { useAppBridge } from '@shopify/app-bridge-react';
import {
  Layout,
  LegacyCard,
  Page,
  Spinner,
  Button,
  Stack,
  TextField,
} from '@shopify/polaris';
import { navigate } from 'raviger';
import React, { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';

const EmailListPage = () => {
  const app = useAppBridge();
  const [emails, setEmails] = useState([]);
  const [unburnedEmails, setUnburnedEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fetch = useFetch();

  useEffect(() => {
    fetchEmails();
    fetchUnburnedEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/admin/emails/', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      const json = await response.json();

      if (json) {
        setEmails(json);
      } else {
        setEmails([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnburnedEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/admin/emails_unburned/', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      const json = await response.json();

      if (json) {
        setUnburnedEmails(json);
      } else {
        setUnburnedEmails([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const copyEmailsToClipboard = () => {
    const emailList = emails.map((email) => email.email).join(', ');
    navigator.clipboard
      .writeText(emailList)
      .then(() => {
        setCopySuccess(true);
      })
      .catch((error) => {
        console.error('Error copying emails to clipboard:', error);
      });
  };

  const copyUnburnedEmailsToClipboard = () => {
    const emailList = unburnedEmails.map((email) => email.email).join(', ');
    navigator.clipboard
      .writeText(emailList)
      .then(() => {
        setCopySuccess(true);
      })
      .catch((error) => {
        console.error('Error copying emails to clipboard:', error);
      });
  };

  return (
    <Page
      title="Customer Emails"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/admin') }]}
    >
      <Layout>
        <Layout.Section>
          {loading ? (
            <Spinner accessibilityLabel="Loading" size="large" color="teal" />
          ) : (
            <LegacyCard sectioned>
              <Stack vertical>
                {emails.length > 0 && (
                  <Stack vertical>
                    <TextField
                      readOnly
                      value={emails.map((email) => email.email).join(', ')}
                      label="All customer emails"
                    />
                    <Button primary onClick={copyEmailsToClipboard}>
                      {copySuccess ? 'Copied!' : 'Copy Emails'}
                    </Button>
                  </Stack>
                )}
              </Stack>
              <Stack vertical>
                {emails.length > 0 && (
                  <Stack vertical>
                    <TextField
                      readOnly
                      value={unburnedEmails
                        .map((email) => email.email)
                        .join(', ')}
                      label="Customers who have not burned tokens"
                    />
                    <Button primary onClick={copyUnburnedEmailsToClipboard}>
                      {copySuccess ? 'Copied!' : 'Copy Emails'}
                    </Button>
                  </Stack>
                )}
              </Stack>
            </LegacyCard>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default EmailListPage;
