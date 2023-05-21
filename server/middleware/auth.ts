import {
  CookieNotFound,
  InvalidOAuthError,
  InvalidSession,
} from "@shopify/shopify-api";
import authRedirect from "../../utils/authRedirect";
import SessionModel from "../../utils/models/SessionModel";
import StoreModel from "../../utils/models/StoreModel";
import sessionHandler from "../../utils/sessionHandler";
import shopify from "../../utils/shopifyConfig";

const authMiddleware = (app: { get: (arg0: string, arg1: { (req: any, res: any): Promise<void>; (req: any, res: any): Promise<any>; (req: any, res: any): Promise<void>; }) => void; }) => {
  app.get("/auth", async (req, res) => {
    try {
      await authRedirect(req, res);
    } catch (e: any) {
      console.error(`---> Error at /auth`, e);
      const { shop } = req.query;
      switch (true) {
        case e instanceof InvalidOAuthError:
          res.status(400).send(e.message);
          break;
        case e instanceof CookieNotFound:
        case e instanceof InvalidSession:
          await StoreModel.findOneAndUpdate(
            { shop },
            { isActive: false },
            { upsert: true }
          );
          await SessionModel.deleteMany({ shop });
          res.redirect(`/auth?shop=${shop}`);
          break;
        default:
          res.status(500).send(e.message);
          break;
      }
    }
  });

  app.get("/auth/tokens", async (req, res) => {
    try {
      const callbackResponse = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
      });

      const { session } = callbackResponse;

      await sessionHandler.storeSession(session);

      const webhookRegisterResponse = await shopify.webhooks.register({
        session,
      }); //Register all webhooks with offline token
      console.log(webhookRegisterResponse); //This is an array that includes all registry responses.
      // fs.writeFile(`${process.cwd()}/response.txt`, JSON.stringify(webhookRegisterResponse), (err, data)=> {
      //   if (err){ 
      //     return console.error("Eh")
      //   }
      //   console.log("----> Written to file");
      // })

      return await shopify.auth.begin({
        shop: session.shop,
        callbackPath: "/auth/callback",
        isOnline: true,
        rawRequest: req,
        rawResponse: res,
      });
    } catch (e: any) {
      console.error(`---> Error at /auth/tokens`, e);
      const { shop } = req.query;
      switch (true) {
        case e instanceof InvalidOAuthError:
          res.status(400).send(e.message);
          break;
        case e instanceof CookieNotFound:
        case e instanceof InvalidSession:
          await StoreModel.findOneAndUpdate(
            { shop },
            { isActive: false },
            { upsert: true }
          );
          await SessionModel.deleteMany({ shop });
          res.redirect(`/auth?shop=${shop}`);
          break;
        default:
          res.status(500).send(e.message);
          break;
      }
    }
  });

  app.get("/auth/callback", async (req, res) => {
    try {
      const callbackResponse = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
      });

      const { session } = callbackResponse;
      await sessionHandler.storeSession(session);

      const host = req.query.host;
      const { shop } = session;

      await StoreModel.findOneAndUpdate(
        { shop },
        { isActive: true },
        { upsert: true }
      ); //Update store to true after auth has happened, or it'll cause reinstall issues.

      // Redirect to app with shop parameter upon auth
      res.redirect(`/?shop=${shop}&host=${host}`);
    } catch (e: any) {
      console.error(`---> Error at /auth/callback`, e);
      const { shop } = req.query;
      switch (true) {
        case e instanceof InvalidOAuthError:
          res.status(400).send(e.message);
          break;
        case e instanceof CookieNotFound:
        case e instanceof InvalidSession:
          await StoreModel.findOneAndUpdate(
            { shop },
            { isActive: false },
            { upsert: true }
          );
          await SessionModel.deleteMany({ shop });
          res.redirect(`/auth?shop=${shop}`);
          break;
        default:
          res.status(500).send(e.message);
          break;
      }
    }
  });
};

export default authMiddleware;
