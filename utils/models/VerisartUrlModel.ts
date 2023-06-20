import mongoose from 'mongoose';

// Model for adding a custom metadata field on a token basis
const verisartUrlSchema = new mongoose.Schema({
  //This is the asset being burned
  tokenGateAddress: {
    type: String,
    required: true,
  },
  // This is the token Id that was burned
  tokenId: {
    type: String,
    required: true,
  },
  // metadata key
  url: {
    type: String,
    required: true,
  },
});

const VerisartUrlsModel = mongoose.model('verisart_urls', verisartUrlSchema);

export default VerisartUrlsModel;
