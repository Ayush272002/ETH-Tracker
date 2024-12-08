import {
  AutocompleteInteraction,
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';
import prisma from '@repo/db/client';
import { getUser } from '../lib/db';
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

  const wallet = user.wallets.find((w) => w.address == address);
  if (!wallet) {
    await interaction.reply({
      embeds: [
        getErrorEmbed().setDescription('You are not tracking this wallet'),
      ],
    });
    return;
  }

  await prisma.wallet.delete({
    where: {
      id: wallet.id,
    },
  });

  await interaction.reply({
    embeds: [
      getDefaultEmbed()
        .setTitle(':tada: Success')
        .setDescription('You stopped tracking `' + address + '`'),
    ],
  });
};

const autocomplete = async (interaction: AutocompleteInteraction) => {
  const user = await getUser(interaction.user.id);
  const focused = interaction.options.getFocused();

  await interaction.respond(
    user.wallets
      .filter((w) => w.address.startsWith(focused))
      .map((w) => ({
        name: w.address,
        value: w.address,
      }))
  );
};

const command = new SlashCommandBuilder()
  .setName('unwatch')
  .setDescription('Stop watching an address')
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('address')
      .setDescription('The address to stop watching')
      .setRequired(true)
      .setAutocomplete(true)
  );

export default {
  execute,
  autocomplete,
  command: command as SlashCommandBuilder,
};
