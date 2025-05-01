// Parsing and manipulating dates and times

const INVALID_DURATION_MSG =
	'Invalid duration format. Please provide a duration such as "30m", "1hr", "2 days".';

/**
 * Parse a duration string into a Day.js duration object.
 * @param durationStr The duration string to parse
 * @returns The parsed duration object, or an error message if the format is invalid
 */
export function parseDuration(
	durationStr: string
): { success: true; durationSecs: number } | { success: false; error: string } {
	const match = durationStr.match(/^(\d+)\s*([a-z]+)$/i);
	if (!match) return { success: false, error: INVALID_DURATION_MSG };

	const [, amount, unit] = match;
	const num = parseInt(amount, 10);
	if (isNaN(num)) return { success: false, error: INVALID_DURATION_MSG };

	const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
	const multiplier = multipliers[unit[0].toLowerCase()];
	if (!multiplier) return { success: false, error: INVALID_DURATION_MSG };

	const durationSecs = num * multiplier;
	return { success: true, durationSecs };
}
