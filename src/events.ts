import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ThreadAutoArchiveDuration,
} from "discord.js";
import type { ModalSubmitInteraction } from "discord.js";
import dayjs from "dayjs";
import { BUTTON, CHANNEL, FIELD } from "./constants";
import { parseDuration } from "./datetime";

export type EventData = {
  title: string;
  description: string;
  datetime: string;
  durationStr: string;
  location: string;
  existingEventName?: string;
};

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
    .setColor("#0099ff");
}

export function createEventButtons() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(BUTTON.EDIT_EVENT)
      .setLabel("Edit Event")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(BUTTON.DELETE_EVENT)
      .setLabel("Delete Event")
      .setStyle(ButtonStyle.Danger)
  );
}

export async function createOrUpdateEvent(
  interaction: ModalSubmitInteraction,
  eventData: EventData
) {
  const eventDateTime = new Date(eventData.datetime);
  const parsedDuration = parseDuration(eventData.durationStr);

  if (!parsedDuration.success) {
    await interaction.reply({ content: parsedDuration.error, ephemeral: true });
    return false;
  }
  const { duration } = parsedDuration;
  if (!duration) return false;
  console.log({ eventDateTime, duration });
  const endDateTime = dayjs(eventDateTime).add(duration).toDate();

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

  return true;
}

export async function findEventsChannel(interaction: ModalSubmitInteraction) {
  const eventsChannel = interaction.guild?.channels.cache.find(
    (channel) =>
      channel.name === CHANNEL.EVENTS && channel.type === ChannelType.GuildText
  );

  if (!eventsChannel || !("send" in eventsChannel)) {
    await interaction.reply({
      content: `Could not find the #${CHANNEL.EVENTS} channel to start a discussion thread for your new event. Please ask your server admin to create one.`,
      ephemeral: true,
    });
    return null;
  }

  return eventsChannel;
}

export async function createEventThread(message: any, title: string) {
  await message.startThread({
    name: `${title} Discussion`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
  });
}
