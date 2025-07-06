# admissions-bot

A Discord bot that welcomes new members and forwards their self-introductions to a designated channel.

Also available as a [Docker container](https://hub.docker.com/repository/docker/mplewis/admissions-bot).

# Setup

## Create a Discord application & bot

1.  Open the [Discord Developer Portal](https://discord.com/developers/applications) and create an app.
2.  In **Bot → Reset Token**, copy the token.
3.  Under **Bot**, enable **Server Members** and **Message Content** intents.
4.  Under **Installation,** enable **Guild Install** and configure it with **Bot** scope and **Send Messages** permission.
5.  Invite the bot to your server using the **Install Link.**

## Clone & install dependencies

```bash
git clone https://github.com/YOUR_ORG/admissions-bot.git
cd admissions-bot
pnpm install
```

## Create a configuration file

`config.yaml` example:

```yaml
clientID: 'YOUR_CLIENT_ID'
guilds:
  - id: 'YOUR_GUILD_ID'
    channel: introductions
    msg: |
			Welcome! Please introduce yourself by replying to this DM.
```

- `id` – Guild/server ID
- `channel` – Channel where DMs from users are forwarded
- `msg` – DM sent to new members

# Usage

```bash
export DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
export CONFIG_PATH=./config.yaml
pnpm dev
```
