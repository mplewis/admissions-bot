import { z } from 'zod';
import { parse } from 'yaml';
import { readFile } from 'fs/promises';

const GuildConfigSchema = z.object({
	id: z.string(),
	channelName: z.string(),
	welcomeMsg: z.string(),
});

const ConfigSchema = z.object({
	clientID: z.string(),
	guilds: z.array(GuildConfigSchema),
});

export type GuildConfig = z.infer<typeof GuildConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

let _guildConfig: Config | undefined;

export function mustEnv(key: string): string {
	const value = process.env[key];
	if (!value) throw new Error(`${key} environment variable is required`);
	return value;
}

export async function loadConfig(): Promise<Config> {
	if (_guildConfig) return _guildConfig;

	const configPath = mustEnv('CONFIG_PATH');
	const fileContent = await readFile(configPath, 'utf-8');
	const rawConfig = parse(fileContent);
	_guildConfig = ConfigSchema.parse(rawConfig);
	return _guildConfig;
}

export async function getGuildConfig(guildID: string): Promise<GuildConfig | undefined> {
	const config = await loadConfig();
	return config.guilds.find((guild) => guild.id === guildID);
}
