import mongoose, { Schema } from 'mongoose';

const burnToRedeemSchema = new mongoose.Schema({
  orderPaidModel: {
    type: Schema.Types.ObjectId,
    ref: 'Order_Paid',
  },
  orderNumber: {
    type: Number,
    required: true,
  },
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
  burnedTokenId: {
    type: Number,
    required: true,
  },
  redeemedTokenId: {
    type: Number,
    required: true,
  },
  claimTx: {
    type: String,
    required: true,
  },
});

const BurnToRedeemModel = mongoose.model('burn_redeem', burnToRedeemSchema);

export default BurnToRedeemModel;
