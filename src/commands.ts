// Slash command setup

import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { CONFIG } from './config';
import { CMD } from './constants';

const eventCommand = new SlashCommandBuilder()
	.setName(CMD.EVENT)
	.setDescription('Create a new event');

/**
 * Register slash commands with Discord.
 */
export async function registerCommands() {
	const rest = new REST().setToken(CONFIG.DISCORD_TOKEN);
	const commands = [eventCommand.toJSON()];
	await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), {
		body: commands,
	});
	console.log('Successfully registered slash commands');
}
