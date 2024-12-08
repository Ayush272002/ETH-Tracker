import { Alchemy, AlchemySubscription, Network } from 'alchemy-sdk';
import dotenv from 'dotenv';
import kafkaClient from '@repo/kafka/client';
import prisma from '@repo/db/client';
import { BALANCES } from '@repo/topics/topics';

dotenv.config();

// Validate Alchemy API Key
const API_KEY = process.env.ALCHEMY_SDK_API_KEY;
if (!API_KEY) {
  throw new Error('Missing Alchemy API Key in .env file');
}

// Initialize Alchemy SDK
const alchemy = new Alchemy({
  apiKey: API_KEY,
  network: Network.ETH_SEPOLIA,
});

// Initialize Kafka producer
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

// Send transaction data to Kafka
const sendToKafka = async (transactionData: any) => {
  try {
    await kafkaProducer.send({
      topic: BALANCES,
      messages: [
        {
          value: JSON.stringify(transactionData),
        },
      ],
    });
    console.log('Transaction data sent to Kafka:', transactionData);
  } catch (error) {
    console.error('Error sending transaction to Kafka:', error);
  }
};

// Track and process transactions
const trackTransactions = async () => {
  alchemy.ws.on(
    {
      method: AlchemySubscription.MINED_TRANSACTIONS,
      includeRemoved: false,
      hashesOnly: false,
    },
    async (tx) => {
      try {
        // Access the nested transaction object
        const transaction = tx.transaction;

        // Extract addresses from the transaction object
        const fromAddress = transaction.from?.toLowerCase() || null;
        const toAddress = transaction.to?.toLowerCase() || null;

        // console.log("Received transaction:", transaction);

        if (!fromAddress && !toAddress) {
          console.log(
            'Skipping transaction due to completely missing addresses:',
            transaction.hash
          );
          return;
        }

        // Fetch database wallets (use caching for optimization if necessary)
        const wallets = await prisma.wallet.findMany();
        const walletAddresses = wallets.map((wallet) =>
          wallet.address.toLowerCase()
        );

        // Check if the transaction involves any known wallets
        if (
          (fromAddress && walletAddresses.includes(fromAddress)) ||
          (toAddress && walletAddresses.includes(toAddress))
        ) {
          const valueInEth = parseFloat(transaction.value) / 1e18;

          const transactionData = {
            from: fromAddress,
            to: toAddress,
            value: valueInEth,
            gas: transaction.gas,
            transactionHash: transaction.hash,
          };

          await sendToKafka(transactionData);
        } else {
          // console.log("Transaction not related to known wallets:", {
          //   transactionHash: transaction.hash,
          //   fromAddress,
          //   toAddress,
          // });
        }
      } catch (error) {
        console.error('Error processing transaction:', error);
      }
    }
  );
};

// Start tracking transactions
const startTracking = async () => {
  try {
    await initKafkaProducer();
    console.log('Starting to track transactions...');
    await trackTransactions();
  } catch (error) {
    console.error('Error starting transaction tracking:', error);
  }
};

startTracking();
