// Handlers for slash commands

import { ModalBuilder } from 'discord.js';
import type { CommandInteraction } from 'discord.js';
import { MODAL } from '../constants';
import { buildEventModalBody } from '../ui';

/**
 * Handle `/event` and show the modal for creating an event.
 * @param interaction The interaction object to use when presenting the modal
 */
export async function handleEventCommand(interaction: CommandInteraction) {
	const modal = new ModalBuilder()
		.setCustomId(MODAL.EVENT_CREATE)
		.setTitle('Create Event')
		.addComponents(buildEventModalBody({ userId: interaction.user.id }));

	await interaction.showModal(modal);
}
