import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import {
  Layout,
  LegacyCard,
  Link,
  ResourceList,
  Page,
  TextField,
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
    redeemContractAddress: '',
    burnContractAddress: '',
    extensionAddress: '',
    burnTknUrl: '',
  });

  const fetch = useFetch();

  useEffect(() => {
    getSavedProducts();
  }, []);

  async function configureProductsPost() {
    setResponseDataPost('loading...');
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
      } else {
        setResponseDataPost(json.error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getSavedProducts() {
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
    }
  }

  function clearForm() {
    setProductData({
      productId: '',
      redeemContractAddress: '',
      burnContractAddress: '',
      extensionAddress: '',
      burnTknUrl: '',
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

  const columns = [
    {
      Header: 'Product ID',
      accessor: 'productId',
    },
    {
      Header: 'Redeem Contract Address',
      accessor: 'redeemContractAddress',
    },
    {
      Header: 'Burn Contract Address',
      accessor: 'burnContractAddress',
    },
    {
      Header: 'Extension Address',
      accessor: 'extensionAddress',
    },
    {
      Header: 'Burn Token URL',
      accessor: 'burnTknUrl',
    },
  ];

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
                  redeem for the product
                </Link>{' '}
              </li>
              <li>
                Your URL should be simlar to:{' '}
                <code>
                  https://studio.manifold.xyz/apps/2534903479/drop/1055983856/overview
                </code>
              </li>
              <li>Copy the value after /drop so in the example: 1055983856</li>
              <li>
                Copy the following url but replace 1055983856 with the value
                from last step:{' '}
                <code>
                  https://apps.api.manifoldxyz.dev/public/instance/data?id=1055983856
                </code>
              </li>
              <li>
                You should now have all the proper values to fill in the info
                below
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
            {responseDataPost && (
              <p style={{ color: responseColor }}>{responseDataPost}</p>
            )}
            <TextField
              label="Product ID"
              value={productData.productId}
              onChange={(newValue) =>
                setProductData({ ...productData, productId: newValue })
              }
              required={true}
            />
            <TextField
              label="Redeem Contract Address"
              value={productData.redeemContractAddress}
              onChange={(newValue) =>
                setProductData({
                  ...productData,
                  redeemContractAddress: newValue,
                })
              }
              required={true}
            />
            <TextField
              label="Burn Contract Address"
              value={productData.burnContractAddress}
              onChange={(newValue) =>
                setProductData({
                  ...productData,
                  burnContractAddress: newValue,
                })
              }
              required={true}
            />
            <TextField
              label="Extension Address"
              value={productData.extensionAddress}
              onChange={(newValue) =>
                setProductData({ ...productData, extensionAddress: newValue })
              }
              required={true}
            />
            <TextField
              label="Burn Token URL"
              value={productData.burnTknUrl}
              onChange={(newValue) =>
                setProductData({ ...productData, burnTknUrl: newValue })
              }
              required={true}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default ConfigureProducts;
