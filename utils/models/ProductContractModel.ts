import mongoose from 'mongoose';

const productContractSchema = new mongoose.Schema({
  //This is the asset being burned
  burnContractAddress: {
    type: String,
    required: true,
  },
  // This is the asset being claimed from the burn
  redeemContractAddress: {
    type: String,
    required: true,
  },
  // Url where burn happens
  burnTknUrl: {
    type: String,
    required: true,
  },
  // Extension address that logs the burns
  extensionAddress: {
    type: String,
    required: true,
  },
  // Shopify product ID associated with this
  productId: {
    type: Number,
    required: true,
  },
});

const ProductContractModel = mongoose.model(
  'product_contract',
  productContractSchema
);

export default ProductContractModel;
