import React, { useState } from 'react';
import {
  Page,
  TextField,
  Button,
  LegacyCard,
  Modal,
  Spinner,
} from '@shopify/polaris';
import useFetch from '../../hooks/useFetch';
import { navigate } from 'raviger';

const MetadataPreview = () => {
  const [orderId, setOrderId] = useState('');
  const [responseBody, setResponseBody] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fetch = useFetch();

  const handleFetchMetadata = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/metadata_preview/${orderId}`);
      const json = await response.json();
      setResponseBody(JSON.stringify(json, null, 2));
      setIsPopupOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setResponseBody('');
  };

  return (
    <Page
      title="Metadata Preview"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/metadata') }]}
    >
      <LegacyCard sectioned>
        <TextField label="Order ID" value={orderId} onChange={setOrderId} />
        <Button onClick={handleFetchMetadata} disabled={isLoading}>
          {isLoading ? <Spinner size="small" /> : 'Fetch Metadata'}
        </Button>
      </LegacyCard>
      <Modal
        open={isPopupOpen}
        onClose={handleClosePopup}
        title="Metadata Preview Response"
        primaryAction={{
          content: 'OK',
          onAction: handleClosePopup,
        }}
      >
        <Modal.Section>
          <pre>{responseBody}</pre>
        </Modal.Section>
      </Modal>
    </Page>
  );
};

export default MetadataPreview;
