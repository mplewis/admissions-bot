import {
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  APIEmbed,
} from "discord.js";
import { FIELD } from "./constants";
import { getLastUserSubmittedEvent } from "./cache";
import { EventData } from "./events";

const getFieldValue = (
  embed: APIEmbed | undefined,
  fieldId: keyof typeof FIELD
) => embed?.fields?.find((f) => f.name === FIELD[fieldId])?.value || "";

type WithEmbed = { embed: APIEmbed; userId: string };
type WithUserId = { userId: string };

export function buildEventModalBody(params?: WithEmbed | WithUserId) {
  if (!params) return buildModalWithData();

  const data =
    getLastUserSubmittedEvent(params.userId) ||
    ("embed" in params
      ? {
          title: params.embed.title || "",
          description: params.embed.description || "",
          datetime: getFieldValue(params.embed, "DATETIME"),
          durationStr: getFieldValue(params.embed, "DURATION"),
          location: getFieldValue(params.embed, "LOCATION"),
        }
      : undefined);

  return buildModalWithData(data);
}

function buildModalWithData(data?: EventData) {
  return [
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(FIELD.TITLE)
        .setLabel("Event Title")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("My Cool Party")
        .setValue(data?.title || "")
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
        .setValue(data?.description || "")
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(FIELD.DATETIME)
        .setLabel("Event Date & Time (YYYY-MM-DD HH:MM)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("2024-01-11 14:30")
        .setValue(data?.datetime || "")
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(FIELD.DURATION)
        .setLabel("Duration")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("e.g. 30 min, 1h, 2 days")
        .setValue(data?.durationStr || "")
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId(FIELD.LOCATION)
        .setLabel("Event Location")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder("e.g. Summit Tacos, 237 Collyer St, Longmont, CO 80501")
        .setValue(data?.location || "")
    ),
  ];
}
