import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getUser } from '../lib/db';

const execute = async (interaction: CommandInteraction) => {
  const user = await getUser(interaction.user.id);

  await interaction.reply(
    user.wallets.map((wallet) => wallet.address).join('\n')
  );
};

const command = new SlashCommandBuilder()
  .setName('addresses')
  .setDescription('See your subscribed addresses');

export default {
  execute,
  command: command as SlashCommandBuilder,
};
