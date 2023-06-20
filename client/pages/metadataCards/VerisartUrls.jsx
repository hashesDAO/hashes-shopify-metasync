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

const VerisartUrlPage = () => {
  const initialJsonObjectPost = {
    tokens: [
      {
        tokenGateAddress: '0xee19aab41dab3726fcbde668674db6aacb971b69',
        tokenId: '20',
        url: 'https://someverisarturl',
      },
      {
        tokenGateAddress: '0xee19aab41dab3726fcbde668674db6aacb971b69',
        tokenId: '4',
        url: 'https://someotherverisarturl',
      },
    ],
  };

  const initialJsonObjectDelete = {
    tokens: [
      {
        tokenGateAddress: '0xee19aab41dab3726fcbde668674db6aacb971b69',
        tokenId: '20',
        url: 'https://someverisarturl',
      },
      {
        tokenGateAddress: '0xee19aab41dab3726fcbde668674db6aacb971b69',
        tokenId: '4',
        url: 'https://someotherverisarturl',
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

  if (responseBody.includes('Verisart url')) {
    responseColor = 'green';
  } else {
    responseColor = 'red';
  }

  const handlePostMetadata = async () => {
    try {
      const updatedJsonObjectPost = JSON.parse(jsonText);
      const response = await fetch('/metadata/verisart_url', {
        method: 'POST',
        body: JSON.stringify(updatedJsonObjectPost),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();
      if (json.message) {
        setResponseBody('Verisart urls added');
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
      const response = await fetch('/metadata/verisart_url', {
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
      title="Verisart url config"
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
          label="Add verisart urls for tokens"
          multiline={10}
          value={jsonText}
          onChange={handleJsonTextChange}
        />
        <Button onClick={handlePostMetadata}>Add</Button>
      </LegacyCard>
      <LegacyCard sectioned>
        <TextField
          label="Delete verisart urls for tokens"
          multiline={10}
          value={jsonText}
          onChange={handleJsonTextChange}
        />
        <Button onClick={handleDeleteMetadata}>Delete</Button>
      </LegacyCard>
    </Page>
  );
};

export default VerisartUrlPage;
