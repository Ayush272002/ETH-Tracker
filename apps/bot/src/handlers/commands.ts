import {
  ApplicationCommand,
  AutocompleteInteraction,
  Client,
  CommandInteraction,
  Interaction,
  SlashCommandBuilder,
} from 'discord.js';
import fs from 'fs';

export type Command = {
  execute: (interaction: CommandInteraction) => {};
  autocomplete?: (interaction: AutocompleteInteraction) => {} | undefined;
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
  client.on('interactionCreate', onInteraction);
};

const onInteraction = (interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    commands.forEach((command) => {
      if (command.command.name == interaction.commandName) {
        command.execute(interaction);
      }
    });
  } else if (interaction.isAutocomplete()) {
    commands.forEach((command) => {
      if (
        command.autocomplete &&
        command.command.name == interaction.commandName
      ) {
        command.autocomplete(interaction);
      }
    });
  }
};

export { setup };
