// Constants used throughout the app to avoid magic strings

export const MODAL = {
	CREATE_EVENT: 'event_create',
	EDIT_EVENT: 'event_edit',
	DELETE_EVENT: 'event_delete',
} as const;

export const FIELD = {
	TITLE: 'title',
	DESC: 'desc',
	DATETIME: 'datetime',
	DURATION: 'duration',
	LOCATION: 'location',
} as const;

export const BUTTON = {
	EDIT_EVENT: 'edit_event',
	DELETE_EVENT: 'delete_event',
} as const;

export const CMD = {
	EVENT: 'event',
} as const;

export const CHANNEL = {
	EVENTS: 'events',
} as const;
