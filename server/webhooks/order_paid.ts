import OrderPaidModel from '../../utils/models/OrderPaidModel';
import TokenGateModel from '../../utils/models/TokenGateModel';

import {
  createMetadataForCollection,
  getMetadataByTokenId,
  updateMetadataForToken,
} from '../services/NftService';

/* 
  UPON CHECKOUT AND PAYMENT
    - Parse order details we need
    - Get metadata from samples/contractAddress folder
    - Update/add metadata we want
    - Push metadata to drops/burnRedeemAddress
    - Save orderId,contractAddress etc to database
  */
const orderPaidHandler = async (
  topic: string,
  shop: string,
  webhookRequestBody: string,
  webhookId: string
) => {
  const jsonReponse = JSON.parse(webhookRequestBody);
  const id = jsonReponse.id;
  const orderNumber = jsonReponse.order_number;

  jsonReponse?.line_items.forEach(async (item: any) => {
    const walletUsed = item.properties.find(
      (prop: any) => prop.name === '_wallet'
    )?.value;

    const tokenId = item.properties.find(
      (prop: any) => prop.name === 'Token ID'
    )?.value;

    const tokenGateId = item.properties.find(
      (prop: any) => prop.name === '_token_gate_id'
    )?.value;

    const productName = item.name.toLowerCase().trim();

    const tknGate = await TokenGateModel.findOne({
      productName: productName,
    });

    if (!tknGate) {
      console.error('Product name not found');
    } else {
      const contractAddress = tknGate.contractAddress;

      await OrderPaidModel.create({
        id,
        orderNumber,
        walletUsed,
        tokenId,
        tokenGateId,
        burnContractAddress: contractAddress,
      });

      await getMetadataByTokenId(contractAddress, tokenId).then(
        async (json: any) => {
          json.attributes.push({
            trait_type: 'Order Number',
            value: orderNumber,
          });

          json.attributes.push({
            trait_type: 'Claimee',
            value: walletUsed,
          });

          json.attributes.push({
            trait_type: 'Claim Token Address',
            value: contractAddress,
          });

          json.attributes.push({
            trait_type: 'Claim Token ID',
            value: tokenId,
          });

          await updateMetadataForToken(
            contractAddress,
            tokenId,
            JSON.stringify(json)
          )
            .then((result) => {
              console.log(
                `JSON data updated for ${contractAddress}-${tokenId}`
              );
            })
            .catch((error) => {
              console.error(
                `Couldn't update metadata for ${contractAddress}-${tokenId}: ${error}`
              );
            });
        }
      );
    }
  });
};

export default orderPaidHandler;
