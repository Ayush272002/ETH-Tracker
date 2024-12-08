import { Alchemy, AlchemySubscription, Network } from 'alchemy-sdk';
import dotenv from 'dotenv';
import kafkaClient from '@repo/kafka/client';
import prisma from '@repo/db/client';
import { BALANCES } from '@repo/topics/topics';

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
  await kafkaProducer.connect();
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
    console.error('Error sending to Kafka:', error);
  }
};

const trackTransactions = async () => {
  alchemy.ws.on(
    {
      method: AlchemySubscription.MINED_TRANSACTIONS,
      includeRemoved: true,
      hashesOnly: false,
    },
    async (tx) => {
      const { from, to, value, gas } = tx;
      const wallets = await prisma.wallet.findMany({
        where: {
          OR: [{ address: from.toLowerCase() }, { address: to.toLowerCase() }],
        },
      });

      if (wallets.length > 0) {
        const valueInEth = parseFloat(value) / 1e18;

        const transactionData = {
          from,
          to,
          value: valueInEth,
          gas,
          transactionHash: tx.hash,
        };

        await sendToKafka(transactionData);
      }
    }
  );
};

const startTracking = async () => {
  await initKafkaProducer();
  await trackTransactions();
};

startTracking();
