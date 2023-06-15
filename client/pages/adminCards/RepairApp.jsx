import React, { useState } from 'react';
import { Page, LegacyCard, Button, Spinner } from '@shopify/polaris';
import { navigate } from 'raviger';

import useFetch from '../../hooks/useFetch';

const RepairApp = () => {
  const [responseBody, setResponseBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useFetch();

  const handleRepair = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/admin/repair', {
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
      title="Repair App"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/admin') }]}
    >
      <LegacyCard sectioned>
        <Button onClick={handleRepair} disabled={isLoading}>
          {isLoading ? <Spinner size="small" /> : 'Repair'}
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

export default RepairApp;
