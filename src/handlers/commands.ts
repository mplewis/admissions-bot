import { ModalBuilder } from "discord.js";
import type { CommandInteraction } from "discord.js";
import { MODAL } from "../constants";
import { buildEventModalBody } from "../ui";

export async function handleEventCommand(interaction: CommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId(MODAL.EVENT_CREATE)
    .setTitle("Create Event")
    .addComponents(buildEventModalBody({ userId: interaction.user.id }));

  await interaction.showModal(modal);
}
