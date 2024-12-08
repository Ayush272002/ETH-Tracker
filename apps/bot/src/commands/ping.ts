import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

const execute = async (interaction: CommandInteraction) => {
  await interaction.reply('Pong');
};

const command = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('ping');

export default {
  execute,
  command,
};
