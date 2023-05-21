import crypto from "crypto";

const verifyProxy = (req: any, res: any, next: any) => {
  const { signature } = req.query;

  const queryURI = req._parsedUrl.query
    .replace("/?", "")
    .replace(/&signature=[^&]*/, "")
    .split("&")
    .map((x: any) => decodeURIComponent(x))
    .sort()
    .join("");

  const calculatedSignature = crypto
    // @ts-ignore
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(queryURI, "utf-8")
    .digest("hex");

  if (calculatedSignature === signature) {
    res.locals.user_shop = req.query.shop;
    next();
  } else {
    res.send(401);
  }
};

export default verifyProxy;
