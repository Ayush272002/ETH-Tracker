import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getUser } from '../lib/db';
import { Command } from '../handlers/commands';
import { getDefaultEmbed, getErrorEmbed } from '../lib/embed';

const execute = async (interaction: CommandInteraction) => {
  const user = await getUser(interaction.user.id);

  if (user.wallets.length == 0) {
    await interaction.reply({
      embeds: [
        getErrorEmbed().setDescription(
          'You have not started tracking any wallets'
        ),
      ],
    });

    return;
  }

  const addresses = user.wallets.map((w) => '- `' + w.address + '`').join('\n');

  await interaction.reply({
    embeds: [
      getDefaultEmbed()
        .setTitle(':house: Subscribed addresses')
        .setDescription(['Your subscribed address are:', addresses].join('\n')),
    ],
  });
};

const command = new SlashCommandBuilder()
  .setName('addresses')
  .setDescription('See your subscribed addresses');

export default {
  execute,
  command: command as SlashCommandBuilder,
} satisfies Command;
