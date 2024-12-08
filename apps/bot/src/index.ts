import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import kafkaClient from '@repo/kafka/client';
config();

import { setup as setupCommands } from './handlers/commands';
import { BALANCES } from '@repo/topics/topics';

const main = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  await client.login(process.env.BOT_TOKEN);
  await setupCommands(client);
};

async function getData() {
  const consumer = kafkaClient
    .getInstance()
    .consumer({ groupId: 'test-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: BALANCES, fromBeginning: true });

  await consumer.run({
    //   @ts-ignore
    eachMessage: async ({ topic, partition, message }) => {
      const messageValue = message.value?.toString() || '';
      console.log(`Received message: ${messageValue}`);
    },
  });

  console.log(`Consuming messages from topic"...`);
}

// main();
getData();
