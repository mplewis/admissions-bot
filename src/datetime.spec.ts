import { describe, it, expect } from 'vitest';
import { parseDuration } from './datetime';

describe('parseDuration', () => {
	it('parses string durations into the expected duration objects', () => {
		const cases = [
			{ in: '1s', sec: 1 },
			{ in: '1sec', sec: 1 },
			{ in: '10 sec', sec: 10 },
			{ in: '1hr', sec: 3600 },
			{ in: '2h', sec: 7200 },
			{ in: '10 minutes', sec: 600 },
			{ in: '1 day', sec: 86400 },
		];

		for (const c of cases) {
			const result = parseDuration(c.in);
			expect(result.success).toBe(true);
			if (!result.success) throw new Error('assert');
			expect(result.durationSecs).toBe(c.sec);
		}
	});
});
