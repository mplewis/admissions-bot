# Discovent

A Discord bot for managing events with slash commands and interactive
components.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file with the following variables:

```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
```

3. Register the slash commands:

```bash
pnpm start
```

## Features

- `/event` slash command to create new events
- Interactive modal for event details
- Creates Discord events
- Posts event announcements in #events channel
- Thread creation for event discussion
- Edit/Delete buttons for event management

## Development

Run in development mode with hot reload:

```bash
pnpm dev
```

## Note

The bot will register commands globally, making them available in all servers
where the bot is invited. Make sure to create an #events channel in each server
where you want to use the bot.
