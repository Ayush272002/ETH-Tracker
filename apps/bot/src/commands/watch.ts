import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';
import prisma from '@repo/db/client';
import { decrypt } from 'dotenv';
import { getUser } from '../lib/db';
import { Command } from '../handlers/commands';
import { getDefaultEmbed, getErrorEmbed } from '../lib/embed';

const execute = async (interaction: CommandInteraction) => {
  const address = interaction.options.get('address')!.value as string;
  const user = await getUser(interaction.user.id);

  const re = new RegExp('^0x[a-fA-F0-9]{40}$');
  if (!re.test(address)) {
    await interaction.reply({
      embeds: [
        getErrorEmbed().setDescription('That is not a valid wallet address'),
      ],
    });
    return;
  }

  if (
    user.wallets.find((w) => w.address.toLowerCase() == address.toLowerCase())
  ) {
    await interaction.reply({
      embeds: [
        getErrorEmbed().setDescription('You already are tracking this wallet'),
      ],
    });
    return;
  }

  await prisma.wallet.create({
    data: {
      address: address,
      userId: user.id,
    },
  });

  await interaction.reply({
    embeds: [
      getDefaultEmbed()
        .setTitle(':tada: Success')
        .setDescription('You started tracking `' + address + '`'),
    ],
  });
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
} satisfies Command;
