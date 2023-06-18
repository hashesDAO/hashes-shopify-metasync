import React, { useState } from 'react';
import {
  Page,
  LegacyCard,
  TextField,
  Button,
  Modal,
  TextContainer,
} from '@shopify/polaris';
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
  const [modalActive, setModalActive] = useState(false);
  const [jsonText, setJsonText] = useState(
    JSON.stringify(jsonObjectPost, null, 2)
  );
  const fetch = useFetch();

  let responseColor = '';

  if (responseBody.includes('Custom metadata')) {
    responseColor = 'green';
  } else {
    responseColor = 'red';
  }

  const handlePostMetadata = async () => {
    try {
      const updatedJsonObjectPost = JSON.parse(jsonText);
      const response = await fetch('/metadata/custom_metadata', {
        method: 'POST',
        body: JSON.stringify(updatedJsonObjectPost),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();
      if (json.message) {
        setResponseBody('Custom metadata configured');
      } else {
        setResponseBody(json.error);
      }
      setModalActive(true);
    } catch (error) {
      setResponseBody(JSON.stringify(error, null, 2));
      setModalActive(true);
    }
  };

  const handleDeleteMetadata = async () => {
    try {
      const updatedJsonObjectDelete = JSON.parse(jsonText);
      const response = await fetch('/metadata/custom_metadata', {
        method: 'DELETE',
        body: JSON.stringify(updatedJsonObjectDelete),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      setResponseBody(JSON.stringify(json.message, null, 2));
      setModalActive(true);
    } catch (error) {
      setResponseBody(JSON.stringify(error, null, 2));
      setModalActive(true);
    }
  };

  const closeModal = () => {
    setModalActive(false);
  };

  const handleJsonTextChange = (value) => {
    setJsonText(value);
    try {
      const parsedJson = JSON.parse(value);
      setJsonObjectPost(parsedJson);
      setJsonObjectDelete(parsedJson);
    } catch (error) {
      // Handle JSON parsing error
    }
  };

  return (
    <Page
      title="Custom Metadata Page"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/metadata') }]}
    >
      <Modal
        open={modalActive}
        onClose={closeModal}
        title="Response"
        primaryAction={{
          content: 'Close',
          onAction: closeModal,
        }}
      >
        <Modal.Section>
          <TextContainer>
            <p style={{ color: responseColor }}>{responseBody}</p>
          </TextContainer>
        </Modal.Section>
      </Modal>

      <LegacyCard sectioned>
        <TextField
          label="Custom metadata"
          multiline={10}
          value={jsonText}
          onChange={handleJsonTextChange}
        />
        <Button onClick={handlePostMetadata}>Post Metadata</Button>
      </LegacyCard>
      <LegacyCard sectioned>
        <TextField
          label="Delete custom field"
          multiline={10}
          value={jsonText}
          onChange={handleJsonTextChange}
        />
        <Button onClick={handleDeleteMetadata}>Delete Metadata</Button>
      </LegacyCard>
    </Page>
  );
};

export default CustomMetadataPage;
