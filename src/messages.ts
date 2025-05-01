import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Client,
	ComponentType,
	TextChannel,
} from 'discord.js';
import { BUTTON, CHANNEL } from './constants';

export async function refreshCreateEventButton(client: Client) {
	await deleteCreateEventButton(client);
	await createCreateEventButton(client);
}

function isActionRow(component: {
	type?: number;
}): component is { type: number; components: Array<{ customId: string }> } {
	return component?.type === ComponentType.ActionRow;
}

async function createCreateEventButton(client: Client) {
	const eventsChannel = client.channels.cache.find(
		(channel): channel is TextChannel =>
			channel instanceof TextChannel && channel.name === CHANNEL.EVENTS
	);
	if (!eventsChannel) return;

	const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(BUTTON.CREATE_EVENT)
			.setLabel('Create Event')
			.setStyle(ButtonStyle.Success)
	);

	await eventsChannel.send({ components: [button] });
}

async function deleteCreateEventButton(client: Client) {
	const eventsChannel = client.channels.cache.find(
		(channel): channel is TextChannel =>
			channel instanceof TextChannel && channel.name === CHANNEL.EVENTS
	);
	if (!eventsChannel) return;

	const messages = await eventsChannel.messages.fetch();
	const createButtonMsg = messages.find((msg) => {
		const row = msg.components[0];
		return (
			isActionRow(row) &&
			row.components.length === 1 &&
			row.components[0].customId === BUTTON.CREATE_EVENT
		);
	});
	if (createButtonMsg) await createButtonMsg.delete();
}
