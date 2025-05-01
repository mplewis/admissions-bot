// Parsing and manipulating dates and times

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const INVALID_DURATION_MSG =
	'Invalid duration format. Please provide a duration such as "30m", "1hr", "2 days".';

/**
 * Parse a duration string into a Day.js duration object.
 * @param durationStr The duration string to parse
 * @returns The parsed duration object, or an error message if the format is invalid
 */
export function parseDuration(
	durationStr: string
):
	| { success: true; duration: ReturnType<typeof dayjs.duration> }
	| { success: false; error: string } {
	const match = durationStr.match(/^(\d+)\s*([a-z]+)$/i);
	if (!match) return { success: false, error: INVALID_DURATION_MSG };

	const [, number, unit] = match;
	const duration = dayjs.duration(Number(number), unit as any);

	if (!duration.asMilliseconds()) return { success: false, error: INVALID_DURATION_MSG };

	return { success: true, duration };
}
