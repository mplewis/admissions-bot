import type { ModalSubmitInteraction } from "discord.js";
import { FIELD } from "../constants";
import {
  EventData,
  createEventEmbed,
  createEventButtons,
  createOrUpdateEvent,
  findEventsChannel,
  createEventThread,
} from "../events";
import {
  clearLastUserSubmittedEvent,
  setLastUserSubmittedEvent,
} from "../cache";

export async function handleCreateModal(interaction: ModalSubmitInteraction) {
  const eventData: EventData = {
    title: interaction.fields.getTextInputValue(FIELD.TITLE),
    description: interaction.fields.getTextInputValue(FIELD.DESC),
    datetime: interaction.fields.getTextInputValue(FIELD.DATETIME),
    durationStr: interaction.fields.getTextInputValue(FIELD.DURATION),
    location: interaction.fields.getTextInputValue(FIELD.LOCATION),
  };
  setLastUserSubmittedEvent(interaction.user.id, eventData);

  const success = await createOrUpdateEvent(interaction, eventData);
  if (!success) return;

  const eventsChannel = await findEventsChannel(interaction);
  if (!eventsChannel) return;

  const embed = createEventEmbed(eventData);
  const buttons = createEventButtons();

  const message = await eventsChannel.send({
    embeds: [embed],
    components: [buttons],
  });

  await createEventThread(message, eventData.title);

  await interaction.reply({
    content: "Event created successfully!",
    ephemeral: true,
  });

  clearLastUserSubmittedEvent(interaction.user.id);
}

export async function handleEditModal(interaction: ModalSubmitInteraction) {
  const eventData: EventData = {
    title: interaction.fields.getTextInputValue(FIELD.TITLE),
    description: interaction.fields.getTextInputValue(FIELD.DESC),
    datetime: interaction.fields.getTextInputValue(FIELD.DATETIME),
    durationStr: interaction.fields.getTextInputValue(FIELD.DURATION),
    location: interaction.fields.getTextInputValue(FIELD.LOCATION),
    existingEventName: interaction.message?.embeds[0]?.title ?? undefined,
  };
  setLastUserSubmittedEvent(interaction.user.id, eventData);

  const success = await createOrUpdateEvent(interaction, eventData);
  if (!success) return;

  const embed = createEventEmbed(eventData);
  const buttons = createEventButtons();

  await interaction.message?.edit({ embeds: [embed], components: [buttons] });

  await interaction.reply({
    content: "Event updated successfully!",
    ephemeral: true,
  });

  clearLastUserSubmittedEvent(interaction.user.id);
}
