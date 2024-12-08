import { Alchemy, AlchemySubscription, Network } from "alchemy-sdk";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.ALCHEMY_SDK_API_KEY;
if (!API_KEY) {
  throw new Error("Missing Alchemy API Key in .env file");
}

const alchemy = new Alchemy({
  apiKey: API_KEY,
  network: Network.ETH_SEPOLIA,
});

const trackTransactions = async () => {
  alchemy.ws.on(
    {
      method: AlchemySubscription.MINED_TRANSACTIONS,
      includeRemoved: true,
      hashesOnly: false,
    },
    (tx) => console.log(tx)
  );
};

trackTransactions();
