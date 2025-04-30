import { EventData } from "./events";

const lastUserSubmittedEvent: Record<string, EventData> = {};

export function getLastUserSubmittedEvent(userId: string) {
  return lastUserSubmittedEvent[userId];
}

export function setLastUserSubmittedEvent(
  userId: string,
  eventData: EventData
) {
  lastUserSubmittedEvent[userId] = eventData;
}

export function clearLastUserSubmittedEvent(userId: string) {
  delete lastUserSubmittedEvent[userId];
}
