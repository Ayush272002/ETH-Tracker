import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';
import prisma from '@repo/db/client';
import { getUser } from '../lib/db';

const execute = async (interaction: CommandInteraction) => {
  const address = interaction.options.get('address')!.value as string;
  const user = await getUser(interaction.user.id);

  const wallet = user.wallets.find((w) => w.address == address);
  if (!wallet) {
    interaction.reply("That wallet doesn't exist");
    return;
  }

  await prisma.wallet.delete({
    where: {
      id: wallet.id,
    },
  });

  await interaction.reply('wallet deleted');
};

const command = new SlashCommandBuilder()
  .setName('unwatch')
  .setDescription('Stop watching an address')
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('address')
      .setDescription('The address to stop watching')
      .setRequired(true)
  );

export default {
  execute,
  command: command as SlashCommandBuilder,
};
