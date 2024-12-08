import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';
import prisma from '@repo/db/client';
import { decrypt } from 'dotenv';
import { getUser } from '../lib/db';

const execute = async (interaction: CommandInteraction) => {
  const address = interaction.options.get('address')!.value as string;
  const user = await getUser(interaction.user.id);
  await prisma.wallet.create({
    data: {
      address: address,
      userId: user.id,
    },
  });

  await interaction.reply('wallet added');
};

const command = new SlashCommandBuilder()
  .setName('watch')
  .setDescription('Watch an address')
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('address')
      .setDescription('The address to watch')
      .setRequired(true)
  );

export default {
  execute,
  command: command as SlashCommandBuilder,
};
