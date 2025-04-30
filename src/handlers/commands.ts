import { ModalBuilder } from "discord.js";
import type { CommandInteraction } from "discord.js";
import { MODAL } from "../constants";
import { createEventModalBody } from "../ui";

export async function handleEventCommand(interaction: CommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId(MODAL.EVENT_CREATE)
    .setTitle("Create Event")
    .addComponents(createEventModalBody());

  await interaction.showModal(modal);
}
