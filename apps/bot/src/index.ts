import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
config();

import { setup as setupCommands } from './handlers/commands';

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

main();
