import React, { useState } from 'react';
import { Page, TextField, Button, LegacyCard } from '@shopify/polaris';
import useFetch from '../../hooks/useFetch';
import { navigate } from 'raviger';

const UploadToIPFS = () => {
  const [responseBody, setResponseBody] = useState('');
  const fetch = useFetch();

  const handleFetchMetadata = async () => {
    try {
      const response = await fetch(`/admin/upload_ipfs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Page
      title="IPFS upload"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/metadata') }]}
    >
      <LegacyCard sectioned>
        <p>
          Upload all metadata to IPFS. This is to be done after the burn period
          and physical claim has ended.
        </p>
        <Button onClick={handleFetchMetadata}>Upload To IPFS</Button>
      </LegacyCard>
      {responseBody && (
        <LegacyCard sectioned>
          <pre>{responseBody}</pre>
        </LegacyCard>
      )}
    </Page>
  );
};

export default UploadToIPFS;
