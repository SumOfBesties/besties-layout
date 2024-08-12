import type { Schedule } from './schemas';

export type ScheduleItemType = Schedule['items'][number]['type'];
export type ScheduleItem = Schedule['items'][number];
