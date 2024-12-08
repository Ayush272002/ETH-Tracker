import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import { getCreateAddress } from 'ethers';
import dotenv from 'dotenv';
import kafkaClient from '@repo/kafka/client';
import prisma from '@repo/db/client';
import { CONTRACTS } from '@repo/topics/topics';

dotenv.config();

const API_KEY = process.env.ALCHEMY_SDK_API_KEY;
if (!API_KEY) {
  throw new Error('Missing Alchemy API Key in .env file');
}

const settings = {
  apiKey: API_KEY, // Replace with your Alchemy API key
  network: Network.ETH_SEPOLIA, // Replace with the desired network
};
const alchemy = new Alchemy(settings);

const kafkaProducer = kafkaClient.getInstance().producer();

const initKafkaProducer = async () => {
  try {
    await kafkaProducer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Error initializing Kafka producer:', error);
    throw error;
  }
};

const sendToKafka = async (contractData: any) => {
  try {
    await kafkaProducer.send({
      topic: CONTRACTS,
      messages: [
        {
          value: JSON.stringify(contractData),
        },
      ],
    });
    console.log('Contract data sent to Kafka:', contractData);
  } catch (error) {
    console.error('Error sending transaction to Kafka:', error);
  }
};

const trackContracts = async () => {
  alchemy.ws.on('block', async (blockNumber) => {
    console.log('New block number:', blockNumber);

    // Fetch the block with transactions
    const block = await alchemy.core.getBlockWithTransactions(blockNumber);

    // Filter transactions that are smart contract deployments
    const contractDeployments = block.transactions.filter(
      (tx) => !tx.to // `to` is null for contract deployments
    );

    // Log contract deployments and send them to Kafka
    for (const tx of contractDeployments) {
      try {
        // Generate the contract address
        const contractAddress = getCreateAddress({
          from: tx.from,
          nonce: tx.nonce,
        });

        // console.log(`Fetching contract code for address: ${contractAddress}`);
        // const code = await alchemy.core.getCode(contractAddress);

        // console.log(`Contract Code at ${contractAddress}:`, code);

        // Prepare the message for Kafka
        const kafkaMessage = {
          contractAddress,
          deployerAddress: tx.from,
          transactionHash: tx.hash,
          blockNumber: blockNumber,
          gasUsed: tx.gasLimit?.toString(),
          network: settings.network,
          timestamp: new Date().toISOString(),
          //   contractCode: code,
        };

        await sendToKafka(kafkaMessage);
      } catch (error) {
        console.error('Error processing contract deployment:', error);
      }
    }
  });
};

export const startTrackingContracts = async () => {
  try {
    await initKafkaProducer();
    console.log('Starting to track Contracts...');
    await trackContracts();
  } catch (error) {
    console.error('Error starting Contract tracking:', error);
  }
};
