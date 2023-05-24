import mongoose from 'mongoose';

/*
    Used for debugging and error handeling, to ensure all customers orders
    go smooth
*/
const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: Number,
    required: true,
  },
  walletUsed: {
    type: String,
    required: true,
  },
  tokenId: {
    type: Number,
    required: true,
  },
  tokenGateId: {
    type: String,
    required: true,
  },
  contractAddress: {
    type: String,
    required: true,
  },
});

const OrderPaidModel = mongoose.model('Order_Paid', orderSchema);

export default OrderPaidModel;
