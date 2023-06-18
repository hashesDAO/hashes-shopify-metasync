import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import {
  Layout,
  LegacyCard,
  Link,
  ResourceList,
  Page,
  TextField,
  Spinner,
  Modal,
  TextContainer,
} from '@shopify/polaris';
import { navigate } from 'raviger';
import React, { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';

const ConfigureProducts = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [responseDataPost, setResponseDataPost] = useState('');
  const [savedProducts, setSavedProducts] = useState([]);
  const [productData, setProductData] = useState({
    productId: '',
    manifoldId: '',
  });
  const [loading, setLoading] = useState(false);
  const [modalActive, setModalActive] = useState(false); // Add modal state
  const fetch = useFetch();

  useEffect(() => {
    getSavedProducts();
  }, []);

  async function configureProductsPost() {
    setResponseDataPost('loading...');
    setLoading(true);
    try {
      const res = await fetch('/admin/configure_products/', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          products: [productData],
        }),
      });

      const json = await res.json();

      if (json.message) {
        setResponseDataPost(json.message);
        await getSavedProducts();
      } else {
        setResponseDataPost(json.error);
      }
      setModalActive(true); // Open the modal
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

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

  function clearForm() {
    setProductData({
      productId: '',
      manifoldId: '',
    });
    setResponseDataPost('');
  }

  const isSubmitDisabled =
    Object.values(productData).some((value) => value === '') ||
    responseDataPost === 'loading...';

  let responseColor = '';

  if (responseDataPost.includes('Products successfully configured')) {
    responseColor = 'green';
  } else {
    responseColor = 'red';
  }

  const rows = savedProducts.map((product) => ({
    id: product._id,
    manifoldId: product.manifoldId,
    productId: product.productId,
    redeemContractAddress: product.redeemContractAddress,
    burnContractAddress: product.burnContractAddress,
    extensionAddress: product.extensionAddress,
    burnTknUrl: product.burnTknUrl,
  }));

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const closeModal = () => {
    setModalActive(false);
  };

  return (
    <Page
      title="Configure products"
      breadcrumbs={[{ content: 'Home', onAction: () => navigate('/admin') }]}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard title="Notes">
            <LegacyCard.Section title="Setting up a product">
              <h2>
                To update a product, just paste in the product ID with new
                values like you're setting up a new product
              </h2>
              <li>
                From the admin view of your shopify store, click on a product
              </li>
              <li>
                You will see its productId in the url EX:{' '}
                <code>e34460.myshopify.com/admin/products/8283989147930</code>{' '}
                the product id is <code>8283989147930</code>
              </li>
              <li>
                <Link
                  onClick={() => {
                    redirect.dispatch(Redirect.Action.REMOTE, {
                      url: 'https://studio.manifold.xyz/apps/2534903479',
                      newContext: true,
                    });
                  }}
                >
                  From manifold studios burn redeem app page, click the burn
                  redeem that matches the product we're configuring
                </Link>{' '}
              </li>
              <li>
                Your URL should be simlar to:{' '}
                <code>
                  https://studio.manifold.xyz/apps/2534903479/drop/1055983856/overview
                </code>
              </li>
              <li>
                Copy the value after /drop so in the example: 1055983856 - this
                is your manifold burn app id
              </li>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section>
          <LegacyCard title="Saved Products">
            <ResourceList
              resourceName={resourceName}
              items={rows}
              renderItem={(item) => {
                const {
                  id,
                  manifoldId,
                  productId,
                  redeemContractAddress,
                  burnContractAddress,
                  extensionAddress,
                  burnTknUrl,
                } = item;
                return (
                  <ResourceList.Item
                    id={id}
                    accessibilityLabel={`View details for ${productId}`}
                  >
                    <h3>ProductId: {productId}</h3>
                    <h3>Manifold Id: {manifoldId}</h3>
                    <div>Redeem Contract Address: {redeemContractAddress}</div>
                    <div>Burn Contract Address: {burnContractAddress}</div>
                    <div>Extension Address: {extensionAddress}</div>
                    <div>Burn Token URL: {burnTknUrl}</div>
                  </ResourceList.Item>
                );
              }}
            />
          </LegacyCard>
        </Layout.Section>
        <Layout.Section>
          {loading ? (
            <Spinner accessibilityLabel="Loading" size="large" color="teal" />
          ) : (
            <LegacyCard
              sectioned
              primaryFooterAction={{
                content: 'Submit',
                onAction: () => {
                  configureProductsPost();
                },
                disabled: isSubmitDisabled,
              }}
              secondaryFooterActions={[
                {
                  content: 'Clear',
                  onAction: clearForm,
                },
              ]}
            >
              <TextField
                label="Product ID"
                value={productData.productId}
                onChange={(newValue) =>
                  setProductData({ ...productData, productId: newValue })
                }
                required={true}
              />
              <TextField
                label="Manifold Burn app ID"
                value={productData.manifoldId}
                onChange={(newValue) =>
                  setProductData({
                    ...productData,
                    manifoldId: newValue,
                  })
                }
                required={true}
              />
            </LegacyCard>
          )}
        </Layout.Section>
      </Layout>

      {/* Modal for displaying responseDataPost */}
      {modalActive && (
        <Modal
          open={modalActive}
          onClose={closeModal}
          title="Response Data"
          primaryAction={{
            content: 'OK',
            onAction: closeModal,
          }}
        >
          <Modal.Section>
            <TextContainer>
              <p style={{ color: responseColor }}>{responseDataPost}</p>
            </TextContainer>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
};

export default ConfigureProducts;
