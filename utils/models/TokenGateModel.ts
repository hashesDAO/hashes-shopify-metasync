import mongoose from 'mongoose';

// Used to map contract addr to the product they tokengate
const tokenGateSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
});

const TokenGateModel = mongoose.model('token_gate', tokenGateSchema);

export default TokenGateModel;
