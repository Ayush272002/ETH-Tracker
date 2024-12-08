import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';

const execute = async (interaction: CommandInteraction) => {
  const string = interaction.options.get('address')!.value as String;

  const user = undefined;
  if (!user) {
    user = undefined;
  }

  user.addresses.add();
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
