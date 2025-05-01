// Handlers for interaction events

import {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	MessageFlags,
} from 'discord.js';
import type { ButtonInteraction } from 'discord.js';
import { MODAL } from '../constants';
import { buildEventModalBody } from '../ui';

/**
 * Handle the Create Event button for a new event.
 * @param interaction The interaction object to use when presenting the modal
 */
export async function handleCreateEvent(interaction: ButtonInteraction) {
	const modal = new ModalBuilder()
		.setCustomId(MODAL.CREATE_EVENT)
		.setTitle('Create Event')
		.addComponents(
			buildEventModalBody({
				userId: interaction.user.id,
			})
		);

	await interaction.showModal(modal);
}

/**
 * Handle the Edit Event button for an existing event.
 * @param interaction The interaction object to use when presenting the modal
 */
export async function handleEditEvent(interaction: ButtonInteraction) {
	const message = interaction.message;
	const embed = message.embeds[0];

	if (!embed) {
		await interaction.reply({
			content: 'Could not find event details',
			flags: [MessageFlags.Ephemeral],
		});
		return;
	}

	const modal = new ModalBuilder()
		.setCustomId(MODAL.EDIT_EVENT)
		.setTitle('Edit Event')
		.addComponents(
			buildEventModalBody({
				embed: embed.toJSON(),
				userId: interaction.user.id,
			})
		);

	await interaction.showModal(modal);
}

/**
 * Handle the Delete Event button for an existing event.
 * @param interaction The interaction object to use when presenting the modal
 */
export async function handleDeleteEvent(interaction: ButtonInteraction) {
	const modal = new ModalBuilder()
		.setCustomId(MODAL.DELETE_EVENT)
		.setTitle('Confirm Event Deletion')
		.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId('confirm')
					.setLabel('Type DELETE to confirm:')
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
					.setPlaceholder('DELETE')
			)
		);

	await interaction.showModal(modal);
}
