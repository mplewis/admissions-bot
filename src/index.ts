import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
import { handleJoin } from './handlers/join';
import { handleDM } from './handlers/dm';
import log from './logger';
import { loadConfig, mustEnv } from './config';

dotenv.config();

const discordToken = mustEnv('DISCORD_TOKEN');

const intents = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.MessageContent,
];

async function main() {
	await loadConfig();
	const client = new Client({ intents });
	client.once(Events.ClientReady, () => {
		log.info({ user: client.user?.tag }, 'Bot logged in');
	});
	client.on(Events.GuildMemberAdd, handleJoin);
	client.on(Events.MessageCreate, handleDM);
	client.login(discordToken);
}

main();
