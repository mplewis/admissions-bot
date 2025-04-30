import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const INVALID_DURATION_MSG =
  'Invalid duration format. Please provide a duration such as "30m", "1hr", "2 days".';

export type DurationResult = {
  success: boolean;
  duration?: ReturnType<typeof dayjs.duration>;
  error?: string;
};

export function parseDuration(durationStr: string): DurationResult {
  const match = durationStr.match(/^(\d+)\s*([a-z]+)$/i);
  if (!match) return { success: false, error: INVALID_DURATION_MSG };

  const [, number, unit] = match;
  const duration = dayjs.duration(Number(number), unit as any);

  console.log({ number, unit, duration });
  if (!duration.asMilliseconds())
    return { success: false, error: INVALID_DURATION_MSG };

  return { success: true, duration };
}
