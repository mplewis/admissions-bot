import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import type { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { MODAL } from "../constants";
import { createEventModalBody } from "../ui";

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
    .setCustomId(MODAL.EVENT_EDIT)
    .setTitle("Edit Event")
    .addComponents(createEventModalBody(embed.toJSON()));

  await interaction.showModal(modal);
}

export async function handleDeleteEvent(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId(MODAL.EVENT_DELETE)
    .setTitle("Confirm Event Deletion")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("confirm")
          .setLabel("Type 'delete' to confirm")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("delete")
      )
    );

  await interaction.showModal(modal);
}

export async function handleDeleteConfirm(interaction: ModalSubmitInteraction) {
  const confirm = interaction.fields.getTextInputValue("confirm");
  if (confirm.toLowerCase() !== "delete") {
    await interaction.reply({ content: "Deletion cancelled", ephemeral: true });
    return;
  }

  const message = interaction.message;
  if (!message) {
    await interaction.reply({
      content: "Could not find event message",
      ephemeral: true,
    });
    return;
  }

  const events = await interaction.guild?.scheduledEvents.fetch();
  const event = events?.find((e) => e.name === message.embeds[0]?.title);

  if (event) await event.delete();
  await message.delete();

  await interaction.reply({
    content: "Event deleted successfully!",
    ephemeral: true,
  });
}
