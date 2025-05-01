// Work with events against the Discord API

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	ThreadAutoArchiveDuration,
	MessageFlags,
} from 'discord.js';
import type { Message, ModalSubmitInteraction } from 'discord.js';
import dayjs from 'dayjs';
import { BUTTON, CHANNEL, FIELD } from './constants';
import { parseDuration } from './datetime';

/** Data for a new or existing event. */
export type EventData = {
	title: string;
	description: string;
	datetime: string;
	durationStr: string;
	location: string;
	existingEventName?: string;
};

type DiscordError = {
	_errors: Array<{ message: string; code: string }>;
};

/**
 * Handle a Discord error that might occur when creating or updating an event.
 * @param error The error to handle
 * @param interaction The interaction object to use when presenting the error message to the user
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDiscordError(error: any, interaction: ModalSubmitInteraction) {
	console.error('Error creating/updating event:', error);
	let errorCount: number | undefined;
	const errors = error.rawError?.errors || {};
	const messages = Object.values(errors)
		.map((e) => (e as DiscordError)._errors?.[0]?.message)
		.filter(Boolean);

	if (messages.length > 0) errorCount = messages.length;
	const countMsg = errorCount
		? `${errorCount} error${errorCount === 1 ? '' : 's'} occurred`
		: 'An error occurred';

	const errorMsg = messages.join(', ') || error.rawError?.message || 'Sorry, something went wrong.';

	await interaction.reply({
		content: `${countMsg}: ${errorMsg}`,
		flags: [MessageFlags.Ephemeral],
	});
}

/**
 * Create a message embed containing an event's data.
 * @param eventData The event data from which to create the embed
 * @returns The data for the embed
 */
export function createEventEmbed({
	title,
	description,
	datetime,
	durationStr,
	location,
}: EventData) {
	return new EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.addFields(
			{ name: FIELD.DATETIME, value: datetime, inline: true },
			{ name: FIELD.DURATION, value: durationStr, inline: true },
			{ name: FIELD.LOCATION, value: location, inline: true }
		)
		.setColor('#0099ff');
}

/**
 * Create the additional buttons for an event message.
 * @returns The data for the buttons
 */
export function createEventButtons() {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(BUTTON.EDIT_EVENT)
			.setLabel('Edit Event')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(BUTTON.DELETE_EVENT)
			.setLabel('Delete Event')
			.setStyle(ButtonStyle.Danger)
	);
}

/**
 * Create or update an event in a Discord server.
 * @param interaction The interaction object to use when presenting messages to the user
 * @param eventData The event data from which to create or update the event
 * @returns Whether the event was created or updated successfully
 */
export async function createOrUpdateEvent(
	interaction: ModalSubmitInteraction,
	eventData: EventData
) {
	const eventDateTime = new Date(eventData.datetime);
	const parsedDuration = parseDuration(eventData.durationStr);

	if (!parsedDuration.success) {
		await interaction.reply({
			content: parsedDuration.error,
			flags: [MessageFlags.Ephemeral],
		});
		return false;
	}
	const endDateTime = dayjs(eventDateTime).add(parsedDuration.durationSecs, 'seconds').toDate();

	try {
		if (eventData.existingEventName) {
			const events = await interaction.guild?.scheduledEvents.fetch();
			const event = events?.find((e) => e.name === eventData.existingEventName);
			if (event) {
				await event.edit({
					name: eventData.title,
					description: eventData.description,
					scheduledStartTime: eventDateTime,
					scheduledEndTime: endDateTime,
					entityMetadata: { location: eventData.location },
				});
			}
		} else {
			await interaction.guild?.scheduledEvents.create({
				name: eventData.title,
				description: eventData.description,
				scheduledStartTime: eventDateTime,
				scheduledEndTime: endDateTime,
				privacyLevel: 2, // Guild only
				entityType: 3, // External
				entityMetadata: { location: eventData.location },
			});
		}
	} catch (error) {
		await handleDiscordError(error, interaction);
		return false;
	}

	return true;
}

/**
 * Locate the events channel in a Discord server.
 * @param interaction The interaction object to use when presenting messages to the user
 * @returns The events channel, or null if it is not found
 */
export async function findEventsChannel(interaction: ModalSubmitInteraction) {
	const eventsChannel = interaction.guild?.channels.cache.find(
		(channel) => channel.name === CHANNEL.EVENTS && channel.type === ChannelType.GuildText
	);

	if (!eventsChannel || !('send' in eventsChannel)) {
		await interaction.reply({
			content: `Could not find the #${CHANNEL.EVENTS} channel to start a discussion thread for your new event. Please ask your server admin to create one.`,
			flags: [MessageFlags.Ephemeral],
		});
		return null;
	}

	return eventsChannel;
}

/**
 * Create a thread for an event attached to the event's message.
 * @param message The message object to use when creating the thread
 * @param title The title of the thread
 */
export async function createEventThread(message: Message<boolean>, title: string) {
	await message.startThread({
		name: `${title} Discussion`,
		autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
	});
}
