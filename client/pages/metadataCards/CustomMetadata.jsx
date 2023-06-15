import React, { useState } from 'react';
import { Page, LegacyCard, TextField, Button } from '@shopify/polaris';
import useFetch from '../../hooks/useFetch';
import { navigate } from 'raviger';

const CustomMetadataPage = () => {
  const initialJsonObjectPost = {
    tokens: [
      {
        tokenGateAddress: '0xee19aab41dab3726fcbde668674db6aacb971b69',
        tokenId: '20',
        metadataKey: 'verisart url',
        metadataValue: 'https://someurl',
      },
      {
        tokenGateAddress: '0xee19aab41dab3726fcbde668674db6aacb971b69',
        tokenId: '4',
        metadataKey: 'verisart url',
        metadataValue: 'https://someotherurl',
      },
    ],
  };

  const initialJsonObjectDelete = {
    tokens: [
      {
        tokenGateAddress: '0xee19aab41dab3726fcbde668674db6aacb971b69',
        tokenId: '20',
        metadataKey: 'verisart url',
      },
      {
        tokenGateAddress: '0xee19aab41dab3726fcbde668674db6aacb971b69',
        tokenId: '4',
        metadataKey: 'verisart url',
      },
    ],
  };

  const [jsonObjectPost, setJsonObjectPost] = useState(initialJsonObjectPost);
  const [jsonObjectDelete, setJsonObjectDelete] = useState(
    initialJsonObjectDelete
  );
  const [responseBody, setResponseBody] = useState('');
  const fetch = useFetch();

  const handlePostMetadata = async () => {
    try {
      const response = await fetch('/metadata/custom_metadata', {
        method: 'POST',
        body: JSON.stringify(jsonObjectPost),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (error) {
      setResponseBody(JSON.stringify(error, null, 2));
    }
  };

  const handleDeleteMetadata = async () => {
    try {
      const response = await fetch('/metadata/custom_metadata', {
        method: 'DELETE',
        body: JSON.stringify(jsonObjectDelete),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (error) {
      setResponseBody(JSON.stringify(error, null, 2));
    }
  };

  return (
    <Page
      title="Custom Metadata Page"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/metadata') }]}
    >
      <LegacyCard sectioned>
        <TextField
          label="Custom metadata"
          multiline={10}
          value={JSON.stringify(jsonObjectPost, null, 2)}
          onChange={(value) => setJsonObjectPost(JSON.parse(value))}
        />
        <Button onClick={handlePostMetadata}>Post Metadata</Button>
      </LegacyCard>
      <LegacyCard sectioned>
        <TextField
          label="Delete custom field"
          multiline={10}
          value={JSON.stringify(jsonObjectDelete, null, 2)}
          onChange={(value) => setJsonObjectDelete(JSON.parse(value))}
        />
        <Button onClick={handleDeleteMetadata}>Delete Metadata</Button>
      </LegacyCard>
      {responseBody && (
        <LegacyCard sectioned>
          <pre>{responseBody}</pre>
        </LegacyCard>
      )}
    </Page>
  );
};

export default CustomMetadataPage;
