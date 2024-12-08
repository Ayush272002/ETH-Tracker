import {
  ApplicationCommand,
  Client,
  CommandInteraction,
  Interaction,
  SlashCommandBuilder,
} from 'discord.js';
import fs from 'fs';

export type Command = {
  execute: (interaction: CommandInteraction) => {};
  command: SlashCommandBuilder;
};

const commands: Command[] = [];

fs.readdirSync('dist/commands')
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const command = require(__dirname + '/commands/' + file).default as Command;
    commands.push(command);
  });

const setup = async (client: Client) => {
  client.on('interactionCreate', onCommand);
};

const onCommand = (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(interaction.commandName);
  commands.forEach((command) => {
    if (command.command.name == interaction.commandName) {
      console.log('name matches');
      command.execute(interaction);
    }
  });
};

export { setup };
