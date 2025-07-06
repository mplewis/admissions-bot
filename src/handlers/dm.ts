import { Message, TextChannel, ChannelType, DMChannel } from 'discord.js';
import { getGuildConfig } from '../config';
import log from '../logger';

export async function handleDM(message: Message) {
	if (message.guild || message.channel.type !== ChannelType.DM) return;

	const guilds = message.client.guilds.cache;
	let targetGuild = null;
	let latestJoinDate = new Date(0);
	for (const guild of guilds.values()) {
		const member = await guild.members.fetch(message.author.id).catch(() => null);
		if (member && member.joinedAt && member.joinedAt > latestJoinDate) {
			targetGuild = guild;
			latestJoinDate = member.joinedAt;
		}
	}

	if (!targetGuild) {
		log.error({ user: message.author.id }, 'User not found in any guild');
		return;
	}

	const guildConfig = await getGuildConfig(targetGuild.id);
	if (!guildConfig) {
		log.error({ guildID: targetGuild.id }, 'No guild config found for DM');
		return;
	}

	try {
		const channel = message.client.channels.cache.find(
			(channel): channel is TextChannel =>
				channel instanceof TextChannel &&
				channel.guild.id === targetGuild.id &&
				channel.name === guildConfig.channelName
		);

		if (!channel) {
			log.error(
				{ channel: guildConfig.channelName, guildID: targetGuild.id },
				'Channel not found in guild'
			);
			return;
		}

		const isBot = message.author.bot;
		let from: string;
		let to: string;
		if (isBot) {
			from = 'me';
			if (message.channel instanceof DMChannel) {
				to = message.channel.recipient?.tag ?? '<unknown user>';
			} else {
				to = '<unknown user>';
			}
		} else {
			from = message.author.tag;
			to = 'me';
		}

		const embed = {
			color: 0x0099ff,
			description: message.content,
			fields: [
				{
					name: 'From',
					value: from,
					inline: true,
				},
				{
					name: 'To',
					value: to,
					inline: true,
				},
			],
			timestamp: new Date().toISOString(),
		};

		await channel.send({ embeds: [embed] });
		log.info(
			{ author: message.author.tag, channel: channel.name, content: message.content },
			'Posted message to channel'
		);
	} catch (error) {
		log.error(
			{ err: error, author: message.author.tag, content: message.content },
			'Failed to post message to channel'
		);
	}
}
