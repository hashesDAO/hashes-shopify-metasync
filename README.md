# Hashes DAO shopify app

This app is designed to be used within Hashes DAO shopify stores. This app aims to aid NFT redemption for physical goods. It's current design is to be used with the Verisart token gating and COA issuing Shopify plugin.

## Tech Stack

- React.js
  - `raviger` for routing.
- Express.js
- MongoDB
- Vite
- Ngrok
- Apollo/Client

### Setup

- [ ] Run `npm i --force` to install dependencies.

  - Substantial efforts have gone into ensuring we're using the latest package versions, and some incompatibility issues always pop up while installing. There are no negative effects on the functionality just yet, but if you find anything please open an issue.

  - Do not delete `shopify.app.toml` file since that's required by Shopify CLI 3.0 to function properly, even if the file is empty.

- [ ] Create a new app (Public or Custom) from your [Shopify Partner Dashboard](https://partners.shopify.com).

  - Copy clientID into `.env` SHOPIFY_API_KEY and clientSecret into `SHOPIFY_API_SECRET`
  - Run `npm run ngrok` to generate your subdomain. Copy the `https://<your-url>` domain and add it in `SHOPIFY_APP_URL` in your `.env` file.
  - Temp add `  "type": "module",` to package.json and run `npm run update:url`, remove that now.
  - On partner dashboard -> choose distribution -> single merchant install link -> paste link to store

- [ ] Build your `.env` file based on `.env.example`

  - `AWS_ACCESS_KEY`: Key name to aws bucket. Leave these out if just using the burn mech.
  - `AWS_SECRET`: Secret for aws bucket
  - `AWS_BUCKET`: Bucket where metadata is to be stored
  - `SHOPIFY_API_KEY`: App API key.
  - `SHOPIFY_API_SECRET`: App secret.
  - `SHOPIFY_API_SCOPES`: Scopes required by your Shopify app. A list of access scopes can be found [here](https://shopify.dev/api/usage/access-scopes)
  - `SHOPIFY_APP_URL`: URL generated from Ngrok or your host such as heroku.
  - `SHOPIFY_API_VERSION`: Pre-filled to the latest version. All the calls in the repo are based off this API version so if you're downgrading please refer to the official docs instead. The repo is always kept up to date with the newest practices so you can rely on the basic repo to almost always work without depriciation errors popping up.
  - `MAINNET_RPC`: RPC for eth mainnet such as infura
  - `SIMPLEHASH_API_KEY`: API key for https://simplehash.com/
  - `MONGO_URL`: Mongo connection URL. If you're using a locally hosted version, you can leave it blank or use `mongodb://127.0.0.1:27017/app-name-here`
  - `ENCRYPTION_STRING`: String to use for Cryption for encrypting sessions token. Add a random salt (or a random string of letters and numbers) and save it. If you loose the string you cannot decrypt your sessions and must be kept safely.

- [ ] (Local development) Run ngrok locally in one tab and mongo in another, putting th ngrok url as your SHOPIFY_APP_URL in .env

- [ ] Run `node devUtils/updateDashboard.js` to update the url on your shopify app or just update the values manually in your shopify app

- [ ] NPM Scripts

  - `update` and `update:check`: Depends on `npm-check-updates` to force update packages to the latest available version. Can potentially break things.
  - `dev`: Run in dev mode.
  - `preserve`: For Vite.
  - `build`: Use Vite to build React into `dist/client`. If you don't run build, you cannot serve anything in dev / production modes.
  - `start`: Run in production mode. Please run `npm run build` before to compile client side.
  - `pretty`: Run prettier across the entire project. I personally like my code to be readable and using prettier CLI makes things easier. Refer to `.prettierrc` for configuration and `.prettierignore` to ignore files and folders.
  - `ngrok:auth`: Add in your auth token from [Ngrok](https://ngrok.com) to use the service.
  - `ngrok`: Ngrok is used to expose specific ports of your machine to the internet and serve over https. Running `npm run ngrok` auto generates a URL for you. The URL that's generated here goes in `SHOPIFY_APP_URL` and in the URL section of your app in Partner Dashboard.
  - `update:url`: Update App URL and Whitelisted URLs to your Partner Dashboard from your `.env` file.
  - `shopify`: Run CLI 3.0 commands with `npm run shopify [command]`;
  - `s:e:create`: Create extension scaffolding using CLI 3.0. A new folder called `extensions` is created at root that uses the new folder structure.
  - `s:e:deploy`: Deploy extension(s) to Shopify.

### Production setup notes

- [ ] https://partners.shopify.com/ create app
- [ ] Create app manually
- [ ] Choose distribution
  - [ ] Single merchant install
  - [ ] Paste link to shopify store
  - [ ] Copy install link for later
- [ ] Create heroku account
- [ ] From command line install heroku if not already installed
- [ ] [Setup a mongo DB with atlas](https://www.mongodb.com/developer/products/atlas/use-atlas-on-heroku/#prerequisites)
  - [ ] Note the mongo setting is MONGO_URL in our app
- [ ] Setup env vars from heroku app settings / config vars **(make sure there are no quotes!!!!) ALSO (MAKE SURE URL DOES NOT END IN A /)**
  - [ ] Add a setting NODE_OPTIONS with value `--max_old_space_size=2560`
- [ ] Setup heroku app
  - [ ] `heroku create unique-project-name`
  - [ ] `git add . `
  - [ ] `git commit -m “setting up to push to Heroku”`
  - [ ] `git push heroku master`
  - [ ] `heroku ps:scale web=1
`
- [ ] Go to your app on shopify partners and go to urls:
  - [ ] App URL: heroku app url
  - [ ] Allowed redirect urls: `https://yourherokuurl/auth/tokens https://yourherokuurl/auth/callback`
  - [ ] App proxy - prefix `apps` subpath `proxy` proxy url `https://yourherokuurl/proxy`
- [ ] Paste the merchant install link into your browser the install app button will not be selectable
- [ ] Change the url to be `https://yourherokuurl/auth?shop=theurltoyourshopifyshop` ex `https://d03a-2600-1700-8c00-f50-a0f4-496f-da7c-225d.ngrok-free.app/auth?shop=e34460.myshopify.com`
- [ ] Paste the merchant install link again, and the green install button should work now
