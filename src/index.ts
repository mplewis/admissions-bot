import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import { CONFIG } from './config';
import { registerCommands } from './commands';
import { CMD, MODAL, BUTTON, CHANNEL } from './constants';
import { handleEventCommand } from './handlers/commands';
import { handleEditModal, handleCreateModal, handleDeleteConfirmModal } from './handlers/modals';
import { handleCreateEvent, handleDeleteEvent, handleEditEvent } from './handlers/events';
import { refreshCreateEventButton } from './messages';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildScheduledEvents,
	],
});

function registerInteractionHandlers(client: Client) {
	client.on('interactionCreate', async (interaction) => {
		if (interaction.isCommand()) {
			switch (interaction.commandName) {
				case CMD.EVENT:
					await handleEventCommand(interaction);
					break;
				default:
					console.error(`Unhandled command interaction: ${interaction.commandName}`);
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
				default:
					console.error(`Unhandled modal interaction: ${interaction.customId}`);
			}
			return;
		}

		if (interaction.isButton()) {
			switch (interaction.customId) {
				case BUTTON.CREATE_EVENT:
					await handleCreateEvent(interaction);
					break;
				case BUTTON.EDIT_EVENT:
					await handleEditEvent(interaction);
					break;
				case BUTTON.DELETE_EVENT:
					await handleDeleteEvent(interaction);
					break;
				default:
					console.error(`Unhandled button interaction: ${interaction.customId}`);
			}
			return;
		}
	});

	console.log('Registered interaction handlers');
}

function main() {
	client.once('ready', async () => {
		console.log(`Logged in as ${client.user?.tag}`);

		console.log('Connected to the following guilds:');
		for (const guild of client.guilds.cache.values()) {
			const eventsChannel = guild.channels.cache.find(
				(channel) => channel.name === CHANNEL.EVENTS && channel.type === ChannelType.GuildText
			);
			console.log(`  ${guild.name} (${guild.id})${eventsChannel ? ' ✓' : ' ✗'}`);
		}

		await registerCommands();
		await registerInteractionHandlers(client);
		await refreshCreateEventButton(client);

		console.log('Ready to go!');
	});

	client.on('error', console.error);

	client.login(CONFIG.DISCORD_TOKEN);
}

main();
