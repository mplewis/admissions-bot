import {
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  APIEmbed,
} from "discord.js";
import { FIELD } from "./constants";

const getFieldValue = (
  embed: APIEmbed | undefined,
  fieldId: keyof typeof FIELD
) => embed?.fields?.find((f) => f.name === FIELD[fieldId])?.value || "";

export function createEventModalBody(embed?: APIEmbed) {
  return [
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(FIELD.TITLE)
        .setLabel("Event Title")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("My Cool Party")
        .setValue(embed?.title || "")
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(FIELD.DESC)
        .setLabel("Event Description")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder(
          "Come to my birthday party! I'm allergic to cake so please bring muffins."
        )
        .setValue(embed?.description || "")
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(FIELD.DATETIME)
        .setLabel("Event Date & Time (YYYY-MM-DD HH:MM)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("2024-01-11 14:30")
        .setValue(getFieldValue(embed, "DATETIME"))
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(FIELD.DURATION)
        .setLabel("Duration")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("e.g. 30 min, 1h, 2 days")
        .setValue(getFieldValue(embed, "DURATION"))
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(FIELD.LOCATION)
        .setLabel("Event Location")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("e.g. Summit Tacos, 237 Collyer St, Longmont, CO 80501")
        .setValue(getFieldValue(embed, "LOCATION"))
    ),
  ];
}
