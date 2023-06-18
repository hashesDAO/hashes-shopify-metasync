import React, { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  Button,
  LegacyCard,
  ResourceList,
  Spinner,
  Modal,
  Link,
} from '@shopify/polaris';
import useFetch from '../../hooks/useFetch';
import { navigate } from 'raviger';

const UploadToIPFS = () => {
  const [responseBody, setResponseBody] = useState('');
  const [savedProducts, setSavedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const fetch = useFetch();

  useEffect(() => {
    getSavedProducts();
  }, []);

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

      setIsPopupOpen(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  async function getSavedProducts() {
    setLoading(true);
    try {
      const res = await fetch('/admin/products/', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });
      const json = await res.json();
      setSavedProducts(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setResponseBody('');
  };

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const rows = savedProducts
    .filter((product) => product.ipfsUrl !== 'NA')
    .map((product) => ({
      id: product._id,
      extensionAddress: product.extensionAddress,
      manifoldId: product.manifoldId,
      productId: product.productId,
      redeemContractAddress: product.redeemContractAddress,
      ipfsUrl: product.ipfsUrl,
    }));
  return (
    <Page
      title="IPFS upload"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/metadata') }]}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <p>
              Upload all metadata to IPFS. This is to be done after the burn
              period and physical claim has ended.
            </p>
            <Button onClick={handleFetchMetadata} disabled={loading}>
              {loading ? <Spinner size="small" /> : 'Upload To IPFS'}
            </Button>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section>
          <LegacyCard title="Values for etherscan">
            <LegacyCard.Section title="Instructions for etherscan">
              For each item in the list do the following:
              <li>Click the Etherscan link</li>
              <li>Click Connect to Web3 on etherscan</li>
              <li>Go to the method updateTokenURI</li>
              <li>
                Paste the values in the appropriate fields and then click write
              </li>
              <li>Repeat for all items</li>
              <li>
                Go to this apps opensea refresh button, refresh, and check the
                values
              </li>
            </LegacyCard.Section>
            <ResourceList
              resourceName={resourceName}
              items={rows}
              renderItem={(item) => {
                const {
                  id,
                  extensionAddress,
                  manifoldId,
                  productId,
                  redeemContractAddress,
                  ipfsUrl,
                } = item;
                return (
                  <ResourceList.Item
                    id={id}
                    accessibilityLabel={`View details for ${productId}`}
                  >
                    <Link
                      external
                      url={`https://etherscan.io/address/${extensionAddress}#writeContract`}
                    >
                      Etherscan link
                    </Link>{' '}
                    <h3>creatorContractAddress: {redeemContractAddress}</h3>
                    <h3>instancedId: {manifoldId}</h3>
                    <div>storageProtocol: 3</div>
                    <div>identical: false</div>
                    <div>location: {new URL(ipfsUrl).pathname}</div>
                  </ResourceList.Item>
                );
              }}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
      <Modal
        open={isPopupOpen}
        onClose={handleClosePopup}
        title="Upload to IPFS Response"
        primaryAction={{
          content: 'OK',
          onAction: handleClosePopup,
        }}
      >
        <Modal.Section>
          <p style={{ color: responseColor }}>{responseBody}</p>
        </Modal.Section>
      </Modal>
    </Page>
  );
};

export default UploadToIPFS;
