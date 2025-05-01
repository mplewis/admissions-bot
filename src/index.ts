import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import { CONFIG } from './config';
import { registerCommands } from './commands';
import { CMD, MODAL, BUTTON } from './constants';
import { handleEventCommand } from './handlers/commands';
import { handleEditModal, handleCreateModal, handleDeleteConfirmModal } from './handlers/modals';
import { handleDeleteEvent, handleEditEvent, handleNewEvent } from './handlers/events';

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
		switch (interaction.commandName) {
			case CMD.EVENT:
				await handleEventCommand(interaction);
				break;
		}
		return;
	}

	if (interaction.isModalSubmit()) {
		switch (interaction.customId) {
			case MODAL.CREATE_EVENT:
				await handleCreateModal(interaction);
				break;
			case MODAL.EDIT_EVENT:
				await handleEditModal(interaction);
				break;
			case MODAL.DELETE_EVENT:
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

client.on('error', console.error);

client.login(CONFIG.DISCORD_TOKEN);
