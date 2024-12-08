import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

const execute = async (interaction: CommandInteraction) => {
  await interaction.reply('hi2');
};

const command = new SlashCommandBuilder()
  .setName('test123')
  .setDescription('ping');

export default {
  execute,
  command,
};
