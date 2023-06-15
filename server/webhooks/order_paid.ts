import OrderPaidModel from '../../utils/models/OrderPaidModel';

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

    const productId = item.product_id;

    await OrderPaidModel.create({
      globalId: id,
      productId: productId,
      orderNumber: orderNumber,
      walletUsed: walletUsed,
      tokenId: tokenId,
      tokenGateId: tokenGateId,
      fufilled: false,
      burned: false,
    });
  });
};

export default orderPaidHandler;
