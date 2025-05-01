import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import { CONFIG } from './config';
import { registerCommands } from './commands';
import { CMD, MODAL, BUTTON } from './constants';
import { handleEventCommand } from './handlers/commands';
import { handleEditModal, handleCreateModal, handleDeleteConfirmModal } from './handlers/modals';
import { handleDeleteEvent, handleEditEvent } from './handlers/events';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildScheduledEvents,
	],
});

client.once('ready', async () => {
	console.log(`Logged in as ${client.user?.tag}`);

	console.log('Connected to the following guilds:');
	for (const guild of client.guilds.cache.values()) {
		const eventsChannel = guild.channels.cache.find(
			(channel) => channel.name === 'events' && channel.type === ChannelType.GuildText
		);
		console.log(`  ${guild.name} (${guild.id})${eventsChannel ? ' ✓' : ' ✗'}`);
	}

	await registerCommands();
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isCommand()) {
		if (interaction.commandName !== CMD.EVENT) return;
		await handleEventCommand(interaction);
		return;
	}

	if (interaction.isModalSubmit()) {
		switch (interaction.customId) {
			case MODAL.EVENT_CREATE:
				await handleCreateModal(interaction);
				break;
			case MODAL.EVENT_EDIT:
				await handleEditModal(interaction);
				break;
			case MODAL.EVENT_DELETE:
				await handleDeleteConfirmModal(interaction);
				break;
		}
		return;
	}

	if (interaction.isButton()) {
		switch (interaction.customId) {
			case BUTTON.EDIT_EVENT:
				await handleEditEvent(interaction);
				break;
			case BUTTON.DELETE_EVENT:
				await handleDeleteEvent(interaction);
				break;
		}
		return;
	}
});

client.login(CONFIG.DISCORD_TOKEN);
