import { GuildMember } from 'discord.js';
import { getGuildConfig } from '../config';
import log from '../logger';

export async function handleJoin(member: GuildMember) {
	const guildConfig = await getGuildConfig(member.guild.id);
	if (!guildConfig) {
		log.error({ guildID: member.guild.id }, 'No config found for guild');
		return;
	}

	const msg = guildConfig.welcomeMsg;
	try {
		await member.send(msg);
		log.info({ user: member.user.tag, guild: member.guild.name, content: msg }, 'Sent welcome DM');
	} catch (error) {
		log.error({ user: member.user.tag, err: error, content: msg }, 'Failed to send welcome DM');
	}
}
