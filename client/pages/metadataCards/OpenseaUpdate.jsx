import React, { useState } from 'react';
import { Page, LegacyCard, Button, Spinner } from '@shopify/polaris';
import { navigate } from 'raviger';

import useFetch from '../../hooks/useFetch';

const OpenseaUpdate = () => {
  const [responseBody, setResponseBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useFetch();

  const handleRepair = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/admin/updateOS', {
        method: 'POST',
      });
      const json = await response.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page
      title="Opensea refresh"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/metadata') }]}
    >
      <LegacyCard sectioned>
        <p>
          Send a request to update all metadata for the burn to redeem
          collections
        </p>
        <Button onClick={handleRepair} disabled={isLoading}>
          {isLoading ? <Spinner size="small" /> : 'Refresh metadata'}
        </Button>
      </LegacyCard>
      {responseBody && (
        <LegacyCard sectioned>
          <pre>{responseBody}</pre>
        </LegacyCard>
      )}
    </Page>
  );
};

export default OpenseaUpdate;
