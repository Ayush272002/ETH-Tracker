import { Alchemy, AlchemySubscription, Network } from 'alchemy-sdk';
import dotenv from 'dotenv';
import kafkaClient from '@repo/kafka/client';
import prisma from '@repo/db/client';
import { BALANCES } from '@repo/topics/topics';
import { startTrackingContracts } from './contract';

dotenv.config();

const API_KEY = process.env.ALCHEMY_SDK_API_KEY;
if (!API_KEY) {
  throw new Error('Missing Alchemy API Key in .env file');
}

const alchemy = new Alchemy({
  apiKey: API_KEY,
  network: Network.ETH_SEPOLIA,
});

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

const trackTransactions = async () => {
  alchemy.ws.on(
    {
      method: AlchemySubscription.MINED_TRANSACTIONS,
      includeRemoved: false,
      hashesOnly: false,
    },
    async (tx) => {
      try {
        const transaction = tx.transaction;
        const fromAddress = transaction.from?.toLowerCase() || null;
        const toAddress = transaction.to?.toLowerCase() || null;

        if (!fromAddress && !toAddress) {
          console.log(
            'Skipping transaction due to completely missing addresses:',
            transaction.hash
          );
          return;
        }

        const wallets = await prisma.wallet.findMany({
          include: { user: true },
        });

        const walletMap = new Map(
          wallets.map((wallet) => [
            wallet.address.toLowerCase(),
            wallet.user.discordId,
          ])
        );

        const fromDiscordId = walletMap.get(fromAddress);
        const toDiscordId = walletMap.get(toAddress);

        if (fromDiscordId || toDiscordId) {
          const valueInEth = parseFloat(transaction.value) / 1e18;

          const transactionData = {
            from: fromAddress,
            to: toAddress,
            value: valueInEth,
            gas: transaction.gas,
            transactionHash: transaction.hash,
            discordId: fromDiscordId || toDiscordId,
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
startTrackingContracts();
