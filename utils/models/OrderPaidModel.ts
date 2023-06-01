import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  globalId: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: Number,
    required: true,
  },
  productId: {
    type: Number,
    required: true,
  },
  walletUsed: {
    type: String,
    required: true,
  },
  // Token id used for tokengate ie: the burnToken
  tokenId: {
    type: Number,
    required: true,
  },
  tokenGateId: {
    type: String,
    required: true,
  },
  fufilled: {
    type: Boolean,
    required: true,
  },
  burned: {
    type: Boolean,
    required: true,
  },
});

const OrderPaidModel = mongoose.model('Order_Paid', orderSchema);

export default OrderPaidModel;
