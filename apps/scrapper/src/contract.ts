import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import { getCreateAddress } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.ALCHEMY_SDK_API_KEY;
if (!API_KEY) {
  throw new Error('Missing Alchemy API Key in .env file');
}

const settings = {
  apiKey: API_KEY,
  network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(settings);

// alchemy.ws.on("block", (blockNumber) =>
//     console.log("Latest block:", blockNumber)
// );

// alchemy.ws.on("newHeads", async (blockHeader) => {
//     try {
//       console.log(`New block detected: ${parseInt(blockHeader.number, 16)}`);

//       // Fetch full block details
//       const block = await alchemy.core.getBlockWithTransactions(blockHeader.hash);

//       console.log(block)

//   // Process transactions in the block
//   for (const tx of block.transactions) {
//     if (!tx.to) {
//       // Compute contract address
//       const contractAddress = getCreateAddress({
//         from: tx.from,
//         nonce: tx.nonce,
//       });

//       // Verify contract deployment by checking its code
//       const code = await alchemy.core.getCode(contractAddress);
//       if (code !== "0x") {
//         console.log("New Contract Deployed:");
//         console.log(`- Deployer: ${tx.from}`);
//         console.log(`- Contract Address: ${contractAddress}`);
//         console.log(`- Transaction Hash: ${tx.hash}`);
//       }
//     }
//   }
//     } catch (error) {
//       console.error("Error processing block:", error);
//     }
//   });

alchemy.ws.on('block', async (blockNumber) => {
  console.log('New block number:', blockNumber);
  const block = await alchemy.core.getBlockWithTransactions(blockNumber);
  console.log('Full Block Details:', block);
});
