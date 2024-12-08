import { CommandInteraction } from "discord.js"

type Command = {
    void execute(interaction: CommandInteraction)
};
