import mongoose from 'mongoose';

// Model for adding a custom metadata field on a token basis
const tokenMetadataFieldSchema = new mongoose.Schema({
  //This is the asset being burned
  burnContractAddress: {
    type: String,
    required: true,
  },
  // This is the token Id that was burned
  tokenId: {
    type: String,
    required: true,
  },
  // metadata key
  metadataKey: {
    type: String,
    required: true,
  },
  // metadata value
  metadataValue: {
    type: String,
    required: true,
  },
});

const TokenMetadataFieldModel = mongoose.model(
  'token_metadata',
  tokenMetadataFieldSchema
);

export default TokenMetadataFieldModel;
