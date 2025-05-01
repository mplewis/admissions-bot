// Cache for last user submitted event. Helps users avoid having to re-enter
// data when they make a mistake and the form data is invalid.

import { EventData } from './events';

const lastUserSubmittedEvent: Record<string, EventData> = {};

/**
 * Get the last event submitted by a given user.
 * @param userId The user ID to check for last submitted event
 * @returns The last submitted event for the user, if any
 */
export function getLastUserSubmittedEvent(userId: string) {
	return lastUserSubmittedEvent[userId];
}

/**
 * Set the last event submitted by a given user. We do this because
 * Discord trashes the state of a modal when we return an ephemeral response
 * message, e.g. "invalid date, please try again," and we don't want the user
 * to have to re-enter all the data.
 * @param userId The user ID for whom to set the last submitted event
 * @param eventData The event data to set
 */
export function setLastUserSubmittedEvent(userId: string, eventData: EventData) {
	lastUserSubmittedEvent[userId] = eventData;
}

/**
 * Clear the last event submitted by a given user.
 * This usually happens when the user has successfully completed a
 * create/edit/delete event operation.
 * @param userId The user ID for whom to clear the last submitted event
 */
export function clearLastUserSubmittedEvent(userId: string) {
	delete lastUserSubmittedEvent[userId];
}
