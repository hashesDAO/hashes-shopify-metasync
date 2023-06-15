import React, { useState } from 'react';
import { Page, TextField, Button, LegacyCard } from '@shopify/polaris';
import useFetch from '../../hooks/useFetch';
import { navigate } from 'raviger';

const MetadataPreview = () => {
  const [orderId, setOrderId] = useState('');
  const [responseBody, setResponseBody] = useState('');
  const fetch = useFetch();

  const handleFetchMetadata = async () => {
    try {
      const response = await fetch(`/metadata_preview/${orderId}`);
      const json = await response.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Page
      title="Metadata Preview"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/metadata') }]}
    >
      <LegacyCard sectioned>
        <TextField label="Order ID" value={orderId} onChange={setOrderId} />
        <Button onClick={handleFetchMetadata}>Fetch Metadata</Button>
      </LegacyCard>
      {responseBody && (
        <LegacyCard sectioned>
          <pre>{responseBody}</pre>
        </LegacyCard>
      )}
    </Page>
  );
};

export default MetadataPreview;
