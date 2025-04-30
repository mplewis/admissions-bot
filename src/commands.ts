import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { CONFIG } from "./config";
import { CMD } from "./constants";

const eventCommand = new SlashCommandBuilder()
  .setName(CMD.EVENT)
  .setDescription("Create a new event");

export async function registerCommands() {
  const rest = new REST().setToken(CONFIG.DISCORD_TOKEN);
  const commands = [eventCommand.toJSON()];

  try {
    console.log("Started refreshing global application (/) commands.");

    await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully registered new application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
