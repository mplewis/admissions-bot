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
import type {
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
} from "discord.js";

export async function handleEventCommand(interaction: CommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("event-modal")
    .setTitle("Create Event")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("title")
          .setLabel("Event Title")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("description")
          .setLabel("Event Description")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("date")
          .setLabel("Event Date (YYYY-MM-DD)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("time")
          .setLabel("Event Time (HH:MM)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("location")
          .setLabel("Event Location")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );

  await interaction.showModal(modal);
}

export async function handleEventModal(interaction: ModalSubmitInteraction) {
  const title = interaction.fields.getTextInputValue("title");
  const description = interaction.fields.getTextInputValue("description");
  const date = interaction.fields.getTextInputValue("date");
  const time = interaction.fields.getTextInputValue("time");
  const location = interaction.fields.getTextInputValue("location");

  const eventDateTime = new Date(`${date}T${time}`);

  // Create the Discord event
  const scheduledEvent = await interaction.guild?.scheduledEvents.create({
    name: title,
    description: description,
    scheduledStartTime: eventDateTime,
    privacyLevel: 2, // Guild only
    entityType: 3, // External
    entityMetadata: {
      location: location,
    },
  });

  // Find the events channel
  const eventsChannel = interaction.guild?.channels.cache.find(
    (channel) =>
      channel.name === "events" && channel.type === ChannelType.GuildText
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
      { name: "Location", value: location, inline: true }
    )
    .setColor("#0099ff");

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("edit-event")
      .setLabel("Edit Event")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("delete-event")
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

export async function handleEditEvent(interaction: ButtonInteraction) {
  const message = interaction.message;
  const embed = message.embeds[0];

  if (!embed) {
    await interaction.reply({
      content: "Could not find event details",
      ephemeral: true,
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId("edit-event-modal")
    .setTitle("Edit Event")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("title")
          .setLabel("Event Title")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setValue(embed.title || "")
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("description")
          .setLabel("Event Description")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setValue(embed.description || "")
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("date")
          .setLabel("Event Date (YYYY-MM-DD)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setValue(embed.fields.find((f) => f.name === "Date")?.value || "")
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("time")
          .setLabel("Event Time (HH:MM)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setValue(embed.fields.find((f) => f.name === "Time")?.value || "")
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("location")
          .setLabel("Event Location")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setValue(
            embed.fields.find((f) => f.name === "Location")?.value || ""
          )
      )
    );

  await interaction.showModal(modal);
}

export async function handleDeleteEvent(interaction: ButtonInteraction) {
  const message = interaction.message;

  // Delete the Discord event if it exists
  const events = await interaction.guild?.scheduledEvents.fetch();
  const event = events?.find((e) => e.name === message.embeds[0]?.title);

  if (event) {
    await event.delete();
  }

  // Delete the message and its thread
  await message.delete();

  await interaction.reply({
    content: "Event deleted successfully!",
    ephemeral: true,
  });
}

// Add handler for edit modal submission
export async function handleEditModal(interaction: ModalSubmitInteraction) {
  const title = interaction.fields.getTextInputValue("title");
  const description = interaction.fields.getTextInputValue("description");
  const date = interaction.fields.getTextInputValue("date");
  const time = interaction.fields.getTextInputValue("time");
  const location = interaction.fields.getTextInputValue("location");

  const eventDateTime = new Date(`${date}T${time}`);

  // Update the Discord event
  const events = await interaction.guild?.scheduledEvents.fetch();
  const event = events?.find(
    (e) => e.name === interaction.message?.embeds[0]?.title
  );

  if (event) {
    await event.edit({
      name: title,
      description: description,
      scheduledStartTime: eventDateTime,
      entityMetadata: {
        location: location,
      },
    });
  }

  // Update the message embed
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .addFields(
      { name: "Date", value: date, inline: true },
      { name: "Time", value: time, inline: true },
      { name: "Location", value: location, inline: true }
    )
    .setColor("#0099ff");

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("edit-event")
      .setLabel("Edit Event")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("delete-event")
      .setLabel("Delete Event")
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.message?.edit({
    embeds: [embed],
    components: [buttons],
  });

  await interaction.reply({
    content: "Event updated successfully!",
    ephemeral: true,
  });
}
