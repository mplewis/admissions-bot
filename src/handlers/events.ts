// Handlers for interaction events

import {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	MessageFlags,
	ChannelType,
} from 'discord.js';
import type { ButtonInteraction, Guild } from 'discord.js';
import { CHANNEL, MODAL } from '../constants';
import { buildEventModalBody } from '../ui';

/**
 * Check if a user is the creator of an event.
 * @param userId The ID of the user to check
 * @param message The message containing the event embed
 * @returns Whether the user is the creator of the event
 */
function isEventCreator(
	userId: string,
	message: { embeds: Array<{ fields?: Array<{ name: string; value: string }> }> }
) {
	const creatorField = message.embeds[0]?.fields?.find((field) => field.name === 'Created by');
	if (!creatorField) return false;
	const match = creatorField.value.match(/<@(\d+)>/);
	return match?.[1] === userId;
}

/**
 * Check if a user can send messages in the events channel.
 * @param userId The ID of the user to check
 * @param channel The events channel to check permissions in
 * @returns Whether the user can send messages in the channel
 */
function canSendMessages(userId: string, guild: Guild) {
	const channel = guild.channels.cache.find(
		(channel) => channel.name === CHANNEL.EVENTS && channel.type === ChannelType.GuildText
	);
	return channel?.permissionsFor(userId)?.has('SendMessages') ?? false;
}

/**
 * Check if a user can manage an event.
 * @param interaction The interaction object attached to the event being managed
 * @returns Whether the user can manage the event
 */
function canManageEvent(interaction: ButtonInteraction) {
	const message = interaction.message;
	if (isEventCreator(interaction.user.id, message)) return true;
	if (canSendMessages(interaction.user.id, interaction.guild!)) return true;
	interaction.reply({
		content: "Only an event's creator and server admins can manage an event.",
		flags: [MessageFlags.Ephemeral],
	});
	return false;
}

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
	if (!canManageEvent(interaction)) return;

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
	if (!canManageEvent(interaction)) return;

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
