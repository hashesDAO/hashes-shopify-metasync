import React, { useState } from 'react';
import { Page, TextField, Button, LegacyCard, Spinner } from '@shopify/polaris';
import useFetch from '../../hooks/useFetch';
import { navigate } from 'raviger';

const UploadToIPFS = () => {
  const [responseBody, setResponseBody] = useState('');
  const [loading, setLoading] = useState(false);
  const fetch = useFetch();

  let responseColor = '';

  if (responseBody.includes('Metadata uploaded')) {
    responseColor = 'green';
  } else {
    responseColor = 'red';
  }

  const handleFetchMetadata = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/admin/upload_ipfs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();
      if (json.message) {
        setResponseBody('Metadata uploaded successfully');
        responseColor = 'green';
      } else {
        setResponseBody(json.error);
        responseColor = 'red';
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Page
      title="IPFS upload"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/metadata') }]}
    >
      {responseBody && (
        <LegacyCard sectioned>
          <p style={{ color: responseColor }}>{responseBody}</p>
        </LegacyCard>
      )}

      {loading ? (
        <Spinner accessibilityLabel="Loading" size="large" color="teal" />
      ) : (
        <LegacyCard sectioned>
          <p>
            Upload all metadata to IPFS. This is to be done after the burn
            period and physical claim has ended.
          </p>
          <Button onClick={handleFetchMetadata}>Upload To IPFS</Button>
        </LegacyCard>
      )}
    </Page>
  );
};

export default UploadToIPFS;
