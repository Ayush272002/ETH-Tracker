import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import kafkaClient from '@repo/kafka/client';
config();

import { setup as setupCommands } from './handlers/commands';
import { BALANCES } from '@repo/topics/topics';
import { getDefaultEmbed } from './lib/embed';

let client: Client | undefined = undefined;

const main = async () => {
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  await client.login(process.env.BOT_TOKEN);
  await setupCommands(client);
};

type Transaction = {
  from: string;
  to: string;
  value: number;
  gas: number;
  transactionHash: string;
  discordId: string;
};

const getData = async () => {
  const consumer = kafkaClient
    .getInstance()
    .consumer({ groupId: 'test-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: BALANCES, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const string = message.value?.toString() || '';
      const tx = JSON.parse(string) as Transaction;

      const user = await client?.users.fetch(tx.discordId);
      if (!user) return;

      await user.send({
        embeds: [
          getDefaultEmbed()
            .setTitle(":tada: A wallet you're tracking received Ethereum")
            .setDescription(
              [
                '> Receiving wallet: `' + tx.to + '`',
                '> Sending wallet: `' + tx.from + '`',
                '> Amount: `' + tx.value + ' ETH`',
                '> Gas Fees: `' + tx.gas + ' gwei`',
                '> Hash: `' + tx.transactionHash + '`',
                '',
                '[Etherscan](https://etherscan.io/tx/' +
                  tx.transactionHash +
                  ')',
              ].join('\n')
            ),
        ],
      });
    },
  });

  console.log(`Consuming messages from topic"...`);
};

main();
getData();
