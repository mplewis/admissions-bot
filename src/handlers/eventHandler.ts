import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ThreadAutoArchiveDuration,
} from "discord.js";
import type { CommandInteraction, ModalSubmitInteraction } from "discord.js";
import dayjs from "dayjs";
import duration, { Duration } from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { MODAL, BUTTON, CHANNEL, FIELD } from "../constants";

dayjs.extend(duration);
dayjs.extend(relativeTime);

function parseDuration(input: string): Duration {
  // Match patterns like "1 day", "2d", "3h", "30m"
  const match = input.match(/^(\d+)\s*([dhms])?$/);
  if (!match)
    throw new Error(
      "Invalid duration format. Use formats like '1 day', '2d', '3h', '30m'"
    );

  const [, amount, unit] = match;
  const numAmount = parseInt(amount, 10);

  switch (unit) {
    case "d":
      return dayjs.duration(numAmount, "day");
    case "h":
      return dayjs.duration(numAmount, "hour");
    case "m":
      return dayjs.duration(numAmount, "minute");
    case "s":
      return dayjs.duration(numAmount, "second");
    default:
      return dayjs.duration(numAmount, "day"); // Default to days if no unit specified
  }
}

export async function handleEventCommand(interaction: CommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId(MODAL.EVENT_CREATE)
    .setTitle("Create Event")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(FIELD.TITLE)
          .setLabel("Event Title")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(FIELD.DESC)
          .setLabel("Event Description")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(FIELD.DATE)
          .setLabel("Event Date (YYYY-MM-DD)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(FIELD.TIME)
          .setLabel("Event Time (HH:MM)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(FIELD.DURATION)
          .setLabel("Duration (e.g. 2h, 1 day, 30m)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(FIELD.LOCATION)
          .setLabel("Event Location")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );

  await interaction.showModal(modal);
}

export async function handleEventModal(interaction: ModalSubmitInteraction) {
  const title = interaction.fields.getTextInputValue(FIELD.TITLE);
  const description = interaction.fields.getTextInputValue(FIELD.DESC);
  const date = interaction.fields.getTextInputValue(FIELD.DATE);
  const time = interaction.fields.getTextInputValue(FIELD.TIME);
  const duration = interaction.fields.getTextInputValue(FIELD.DURATION);
  const location = interaction.fields.getTextInputValue(FIELD.LOCATION);

  const startTime = dayjs(`${date}T${time}`);
  const durationObj = parseDuration(duration);
  const endTime = startTime.add(durationObj);

  await interaction.guild?.scheduledEvents.create({
    name: title,
    description: description,
    scheduledStartTime: startTime.toDate(),
    scheduledEndTime: endTime.toDate(),
    privacyLevel: 2, // Guild only
    entityType: 3, // External
    entityMetadata: {
      location: location,
    },
  });

  // Find the events channel
  const eventsChannel = interaction.guild?.channels.cache.find(
    (channel) =>
      channel.name === CHANNEL.EVENTS && channel.type === ChannelType.GuildText
  );

  if (!eventsChannel || !("send" in eventsChannel)) {
    await interaction.reply({
      content: "Could not find #events channel",
      ephemeral: true,
    });
    return;
  }

  // Create the event message
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .addFields(
      { name: "Date", value: date, inline: true },
      { name: "Time", value: time, inline: true },
      { name: "Duration", value: duration, inline: true },
      { name: "Location", value: location, inline: true }
    )
    .setColor("#0099ff");

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(BUTTON.EDIT_EVENT)
      .setLabel("Edit Event")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(BUTTON.DELETE_EVENT)
      .setLabel("Delete Event")
      .setStyle(ButtonStyle.Danger)
  );

  const message = await eventsChannel.send({
    embeds: [embed],
    components: [buttons],
  });

  // Create a thread for discussion
  await message.startThread({
    name: `${title} Discussion`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
  });

  await interaction.reply({
    content: "Event created successfully!",
    ephemeral: true,
  });
}
