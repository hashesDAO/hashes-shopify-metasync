import StoreModel from "../../utils/models/StoreModel";

const isShopActive = async  (req: any, res: any, next: any) => {
  const { shop, host } = req.query;

  if (!shop) {
    next();
    return;
  }

  const isShopAvaialble = await StoreModel.findOne({ shop });

  if (isShopAvaialble === null || !isShopAvaialble.isActive) {
    if (isShopAvaialble === null) {
      await StoreModel.create({ shop, isActive: false });
    } else if (!isShopAvaialble.isActive) {
      await StoreModel.findOneAndUpdate({ shop }, { isActive: false });
    }
    res.redirect(`/auth?shop=${shop}&host=${host}`);
  } else {
    next();
  }
};

export default isShopActive;
