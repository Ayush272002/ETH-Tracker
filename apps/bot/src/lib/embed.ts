import { EmbedBuilder } from 'discord.js';

const getDefaultEmbed = () => {
  return new EmbedBuilder().setColor('#CF9FFF');
};

const getErrorEmbed = () => {
  return new EmbedBuilder().setTitle(':x: Error').setColor('#c92c2c');
};

export { getDefaultEmbed, getErrorEmbed };
