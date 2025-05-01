// Handlers for modal interactions

import type { ModalSubmitInteraction } from 'discord.js';
import { FIELD } from '../constants';
import { MessageFlags, ThreadAutoArchiveDuration } from 'discord.js';
import {
	EventData,
	createEventEmbed,
	createEventButtons,
	createOrUpdateEvent,
	findEventsChannel,
} from '../events';
import { clearLastUserSubmittedEvent, setLastUserSubmittedEvent } from '../cache';

/**
 * Handle submitted data from the Create Event modal.
 * @param interaction The interaction object to use when presenting the modal
 */
export async function handleCreateModal(interaction: ModalSubmitInteraction) {
	const eventData: EventData = {
		title: interaction.fields.getTextInputValue(FIELD.TITLE),
		description: interaction.fields.getTextInputValue(FIELD.DESC),
		datetime: interaction.fields.getTextInputValue(FIELD.DATETIME),
		durationStr: interaction.fields.getTextInputValue(FIELD.DURATION),
		location: interaction.fields.getTextInputValue(FIELD.LOCATION),
	};
	setLastUserSubmittedEvent(interaction.user.id, eventData);

	const success = await createOrUpdateEvent(interaction, eventData);
	if (!success) return;

	const eventsChannel = await findEventsChannel(interaction);
	if (!eventsChannel) return;

	const embed = createEventEmbed(eventData);
	const buttons = createEventButtons();

	const message = await eventsChannel.send({
		embeds: [embed],
		components: [buttons],
	});

	await message.startThread({
		name: `${eventData.title} Discussion`,
		autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
	});

	await interaction.reply({
		content: 'Event created successfully!',
		flags: [MessageFlags.Ephemeral],
	});

	clearLastUserSubmittedEvent(interaction.user.id);
}

/**
 * Handle submitted data from the Edit Event modal.
 * @param interaction The interaction object to use when presenting the modal
 */
export async function handleEditModal(interaction: ModalSubmitInteraction) {
	const eventData: EventData = {
		title: interaction.fields.getTextInputValue(FIELD.TITLE),
		description: interaction.fields.getTextInputValue(FIELD.DESC),
		datetime: interaction.fields.getTextInputValue(FIELD.DATETIME),
		durationStr: interaction.fields.getTextInputValue(FIELD.DURATION),
		location: interaction.fields.getTextInputValue(FIELD.LOCATION),
		existingEventName: interaction.message?.embeds[0]?.title ?? undefined,
	};
	setLastUserSubmittedEvent(interaction.user.id, eventData);

	const success = await createOrUpdateEvent(interaction, eventData);
	if (!success) return;

	const embed = createEventEmbed(eventData);
	const buttons = createEventButtons();

	await interaction.message?.edit({ embeds: [embed], components: [buttons] });

	if (interaction.message?.thread)
		await interaction.message.thread.setName(`${eventData.title} Discussion`);

	await interaction.reply({
		content: 'Event updated successfully!',
		flags: [MessageFlags.Ephemeral],
	});

	clearLastUserSubmittedEvent(interaction.user.id);
}

/**
 * Handle submitted data from the Confirm Delete Event modal.
 * @param interaction The interaction object to use when presenting the modal
 */
export async function handleDeleteConfirmModal(interaction: ModalSubmitInteraction) {
	const confirm = interaction.fields.getTextInputValue('confirm');
	if (confirm.trim() !== 'DELETE') {
		await interaction.reply({
			content: `Instead of DELETE, I read: "${confirm}". I have not deleted your event.`,
			flags: [MessageFlags.Ephemeral],
		});
		return;
	}

	const message = interaction.message;
	if (!message) {
		await interaction.reply({
			content: 'Could not find event message',
			flags: [MessageFlags.Ephemeral],
		});
		return;
	}

	const events = await interaction.guild?.scheduledEvents.fetch();
	const event = events?.find((e) => e.name === message.embeds[0]?.title);

	if (event) await event.delete();
	await message.delete();

	await interaction.reply({
		content: 'Event deleted successfully!',
		flags: [MessageFlags.Ephemeral],
	});
}
