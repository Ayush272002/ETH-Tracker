import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { Command } from './handlers/commands';
import { config } from 'dotenv';
config();
const { BOT_TOKEN, BOT_ID } = process.env;

const deploy = async () => {
  const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  console.log(__dirname);
  const commandFiles: string[] = readdirSync('./dist/commands').filter((file) =>
    file.endsWith('.js')
  );

  for (const file of commandFiles) {
    const command: Command = require(`${__dirname}/commands/${file}`)
      .default as Command;
    const commandData = command.command.toJSON();
    console.log(commandData);
    commands.push(commandData);
  }

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN as string);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(BOT_ID as string), {
      body: [],
    });

    await rest.put(Routes.applicationCommands(BOT_ID as string), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};

deploy();
