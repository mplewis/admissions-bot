# Discord Admissions Bot

A Discord bot that welcomes new users and forwards their introductions to designated channels based on guild configuration.

## Features

- **Multi-Guild Support**: Configure different welcome messages and channels per guild
- **Welcome DMs**: Automatically sends customizable welcome messages to new users
- **Introduction Forwarding**: Forwards user responses from DMs to configured channels
- **Rich Embeds**: Displays user introductions in formatted embeds with user info
- **YAML Configuration**: Easy-to-edit YAML config files for guild settings

## Setup

1. **Create a Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and create a bot
   - Copy the bot token

2. **Configure Environment Variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` and add:
   - `DISCORD_TOKEN`: Your bot token
   - `CONFIG_PATH`: Path to your YAML config file

3. **Create Configuration File**

   ```bash
   cp config.example.yaml config.yaml
   ```

   Edit `config.yaml` with your guild settings:

   ```yaml
   guilds:
     - id: 'YOUR_GUILD_ID'
       channelName: 'introductions'
       welcomeMsg: 'Welcome! Please introduce yourself in a DM to me.'
   ```

4. **Install Dependencies**

   ```bash
   pnpm install
   ```

5. **Invite Bot to Server**
   - Go to OAuth2 > URL Generator in your Discord application
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Read Message History`, `Use Slash Commands`
   - Use the generated URL to invite the bot

6. **Run the Bot**

   ```bash
   # Development
   pnpm dev

   # Production
   pnpm build
   pnpm start
   ```

## Configuration

The bot uses YAML configuration files to define guild-specific settings:

```yaml
guilds:
  - id: 'GUILD_ID'
    channelName: 'channel-name'
    welcomeMsg: 'Custom welcome message'
```

- `id`: Discord guild (server) ID
- `channelName`: Name of the channel where introductions will be posted
- `welcomeMsg`: Custom welcome message sent to new users

## Bot Permissions Required

- Send Messages
- Read Message History
- Use Slash Commands
- Send Messages in DMs

## How It Works

1. When a new user joins a configured guild, the bot sends them the configured welcome message
2. When the user responds to the DM, the bot forwards their message to the configured channel
3. The forwarded message includes user information and is formatted as an embed

## Development

```bash
# Run with hot reload
pnpm dev:watch

# Lint and format
pnpm lint:fix

# Run tests
pnpm test
```

## Note

The bot will register commands globally, making them available in all servers
where the bot is invited. Make sure to create an #events channel in each server
where you want to use the bot.
